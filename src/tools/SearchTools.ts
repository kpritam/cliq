import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import type * as PlatformError from "@effect/platform/Error";
import * as Path from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { PathValidation } from "../services/PathValidation.js";
import type { FileAccessDenied } from "../types/errors.js";
import { CommandFailed, EmptyPattern } from "../types/errors.js";
import { parseGrepOutput } from "./search/GrepParser.js";

const DEFAULT_EXCLUDES = [
	"node_modules/**",
	".git/**",
	"dist/**",
	"build/**",
	"*.log",
] as const;

const GlobParameters = Schema.Struct({
	pattern: Schema.String,
	cwd: Schema.optional(Schema.String),
	dot: Schema.optional(Schema.Boolean),
	absolute: Schema.optional(Schema.Boolean),
	onlyFiles: Schema.optional(Schema.Boolean),
	maxResults: Schema.optional(Schema.Number),
});

const GlobSuccess = Schema.Struct({
	pattern: Schema.String,
	matches: Schema.Array(Schema.String),
	count: Schema.Number,
	truncated: Schema.Boolean,
	cwd: Schema.String,
});

const GrepParameters = Schema.Struct({
	pattern: Schema.String,
	isRegex: Schema.optional(Schema.Boolean),
	includePatterns: Schema.optional(Schema.Array(Schema.String)),
	excludePatterns: Schema.optional(Schema.Array(Schema.String)),
	contextLines: Schema.optional(Schema.Number),
	maxResults: Schema.optional(Schema.Number),
	searchPath: Schema.optional(Schema.String),
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
			params: Schema.Schema.Type<typeof GlobParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof GlobSuccess>,
			PlatformError.PlatformError | FileAccessDenied
		>;
		readonly grep: (
			params: Schema.Schema.Type<typeof GrepParameters>,
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
		}: Schema.Schema.Type<typeof GlobParameters>) =>
			Effect.gen(function* () {
				const workingDir = yield* pathValidation.ensureWithinCwd(cwd ?? ".");
				const glob = new Bun.Glob(pattern);
				const iterator = glob.scan({
					cwd: workingDir,
					dot,
					absolute,
					onlyFiles,
					followSymlinks: false,
					throwErrorOnBrokenSymlink: false,
				});

				const matches: string[] = [];
				yield* Effect.promise(async () => {
					for await (const val of iterator) {
						matches.push(val as string);
						if (matches.length >= maxResults) break;
					}
				});

				matches.sort();

				return {
					pattern,
					matches: matches as readonly string[],
					count: matches.length,
					truncated: matches.length >= maxResults,
					cwd: absolute ? workingDir : pathValidation.relativePath(workingDir),
				} as const;
			});

		const grep = ({
			pattern,
			isRegex = false,
			includePatterns,
			excludePatterns,
			contextLines = 2,
			maxResults = 100,
			searchPath,
		}: Schema.Schema.Type<typeof GrepParameters>) =>
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
				);

				return {
					pattern,
					isRegex,
					filesSearched,
					matches,
					truncated: matches.length >= maxResults,
				} as const;
			});

		return {
			glob,
			grep,
		};
	}),
);
