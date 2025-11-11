import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import type * as PlatformError from "@effect/platform/Error";
import * as Path from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import type { GlobInput, GrepInput } from "../schemas/toolInputs.js";
import { GlobService } from "../services/GlobService.js";
import { PathValidation } from "../services/PathValidation.js";
import { WorkspaceContext } from "../services/WorkspaceContext.js";
import {
	CommandFailed,
	EmptyPattern,
	FileAccessDenied,
} from "../types/errors.js";
import { parseGrepOutput } from "./search/GrepParser.js";

const DEFAULT_EXCLUDES = [
	"node_modules/**",
	".git/**",
	"dist/**",
	"build/**",
	"*.log",
];

const GlobSuccess = Schema.Struct({
	pattern: Schema.String,
	matches: Schema.Array(Schema.String),
	count: Schema.Number,
	truncated: Schema.Boolean,
	cwd: Schema.String,
});

const GrepMatch = Schema.Struct({
	filePath: Schema.String,
	lineNumber: Schema.Number,
	content: Schema.String,
	contextBefore: Schema.Array(Schema.String),
	contextAfter: Schema.Array(Schema.String),
});

const GrepSuccess = Schema.Struct({
	pattern: Schema.String,
	isRegex: Schema.Boolean,
	filesSearched: Schema.Number,
	matches: Schema.Array(GrepMatch),
	truncated: Schema.Boolean,
});

export class SearchTools extends Context.Tag("SearchTools")<
	SearchTools,
	{
		readonly glob: (
			params: GlobInput,
		) => Effect.Effect<
			Schema.Schema.Type<typeof GlobSuccess>,
			PlatformError.PlatformError | FileAccessDenied
		>;
		readonly grep: (
			params: GrepInput,
		) => Effect.Effect<
			Schema.Schema.Type<typeof GrepSuccess>,
			| EmptyPattern
			| PlatformError.PlatformError
			| FileAccessDenied
			| CommandFailed
		>;
	}
>() {}

const buildGrepArgs = (
	pattern: string,
	isRegex: boolean,
	includePatterns: readonly string[] | undefined,
	excludePatterns: readonly string[] | undefined,
	contextLines: number,
	maxResults: number,
): string[] => {
	const args = [
		"--json",
		"--max-count",
		maxResults.toString(),
		"--context",
		contextLines.toString(),
		"--with-filename",
		"--line-number",
	];

	if (!isRegex) args.push("--fixed-strings");

	for (const exclusion of excludePatterns ?? DEFAULT_EXCLUDES) {
		args.push("--glob", `!${exclusion}`);
	}

	for (const inclusion of includePatterns ?? []) {
		args.push("--glob", inclusion);
	}

	args.push(pattern);
	args.push(".");

	return args;
};

export const layer = Layer.effect(
	SearchTools,
	Effect.gen(function* () {
		const path = yield* Path.Path;
		const executor = yield* CommandExecutor.CommandExecutor;
		const pathValidation = yield* PathValidation;
		const globService = yield* GlobService;
		const workspace = yield* WorkspaceContext;

		const runRgString = (args: readonly string[], cwd: string) =>
			Command.make("rg", ...args).pipe(
				Command.workingDirectory(cwd),
				Command.string,
				Effect.provideService(CommandExecutor.CommandExecutor, executor),
			);

		const glob = ({
			pattern,
			cwd,
			dot = false,
			absolute = false,
			onlyFiles = true,
			maxResults = 1000,
		}: GlobInput) =>
			Effect.gen(function* () {
				const workingDir = yield* pathValidation.ensureWithinCwd(cwd ?? ".");
				const matches = yield* globService
					.scan({
						pattern,
						cwd: workingDir,
						dot,
						absolute,
						onlyFiles,
						maxResults,
					})
					.pipe(
						Effect.mapError(
							() =>
								new FileAccessDenied({
									path: pathValidation.relativePath(workingDir),
								}),
						),
					);
				const orderedMatches = [...matches].sort();

				return {
					pattern,
					matches: orderedMatches,
					count: orderedMatches.length,
					truncated: matches.length >= maxResults,
					cwd: absolute ? workingDir : pathValidation.relativePath(workingDir),
				};
			});

		const grep = ({
			pattern,
			isRegex = false,
			includePatterns,
			excludePatterns,
			contextLines = 2,
			maxResults = 100,
			searchPath,
		}: GrepInput) =>
			Effect.gen(function* () {
				if (pattern.trim().length === 0) {
					return yield* Effect.fail(new EmptyPattern({ pattern }));
				}

				const cwd = yield* pathValidation.ensureWithinCwd(searchPath ?? ".");

				const args = buildGrepArgs(
					pattern,
					isRegex,
					includePatterns,
					excludePatterns,
					contextLines,
					maxResults,
				);

				const output = yield* runRgString(args, cwd).pipe(
					Effect.catchAll((e) =>
						Effect.fail(
							new CommandFailed({
								command: "rg",
								args,
								message:
									e instanceof Error && typeof e.message === "string"
										? e.message
										: "ripgrep execution failed",
							}),
						),
					),
				);
				const { matches, filesSearched } = parseGrepOutput(
					output,
					path,
					cwd,
					contextLines,
					workspace.realCwd,
				);

				return {
					pattern,
					isRegex,
					filesSearched,
					matches,
					truncated: matches.length >= maxResults,
				};
			});

		return {
			glob,
			grep,
		};
	}),
);
