import type * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { DiffStats, MarkdownMetadata } from "../schemas/tools.js";
import { PathValidation } from "../services/PathValidation.js";
import type { FileAccessDenied } from "../types/errors.js";
import { computeDiff, computeStats } from "../utils/diff.js";
import { isMarkdownFile, parseMarkdown } from "../utils/markdown/index.js";

export class FileTools extends Context.Tag("FileTools")<
	FileTools,
	{
		readonly readFile: (
			params: Schema.Schema.Type<typeof ReadFileParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof ReadFileSuccess>,
			Error | PlatformError.PlatformError | FileAccessDenied
		>;
		readonly writeFile: (
			params: Schema.Schema.Type<typeof WriteFileParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof WriteFileSuccess>,
			Error | PlatformError.PlatformError | FileAccessDenied
		>;
		readonly fileExists: (
			params: Schema.Schema.Type<typeof FileExistsParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof FileExistsSuccess>,
			Error | FileAccessDenied
		>;
		readonly renderMarkdown: (
			params: Schema.Schema.Type<typeof RenderMarkdownParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof RenderMarkdownSuccess>,
			Error | PlatformError.PlatformError | FileAccessDenied
		>;
	}
>() {}

// Schemas
const ReadFileParameters = Schema.Struct({ filePath: Schema.String });
const ReadFileSuccess = Schema.Struct({
	filePath: Schema.String,
	content: Schema.String,
});
const WriteFileParameters = Schema.Struct({
	filePath: Schema.String,
	content: Schema.String,
	includeDiff: Schema.optional(Schema.Boolean),
});
const WriteFileSuccess = Schema.Struct({
	filePath: Schema.String,
	size: Schema.Number,
	created: Schema.optional(Schema.Boolean),
	diff: Schema.optional(Schema.String),
	stats: Schema.optional(DiffStats),
});
const FileExistsParameters = Schema.Struct({ filePath: Schema.String });
const FileExistsSuccess = Schema.Struct({
	filePath: Schema.String,
	exists: Schema.Boolean,
	type: Schema.optional(Schema.Literal("file", "directory", "other")),
});
const RenderMarkdownParameters = Schema.Struct({
	filePath: Schema.String,
	includeHtml: Schema.optional(Schema.Boolean),
});
const RenderMarkdownSuccess = Schema.Struct({
	filePath: Schema.String,
	isMarkdown: Schema.Boolean,
	content: Schema.String,
	plainText: Schema.String,
	html: Schema.optional(Schema.String),
	metadata: MarkdownMetadata,
});

// Helpers
const mapFileType = (
	type: FileSystem.File.Info["type"],
): "file" | "directory" | "other" =>
	type === "File" ? "file" : type === "Directory" ? "directory" : "other";
const createNonMarkdownResult = (
	filePath: string,
	content: string,
): Schema.Schema.Type<typeof RenderMarkdownSuccess> => ({
	filePath,
	isMarkdown: false,
	content,
	plainText: content,
	metadata: {
		headings: [],
		links: [],
		codeBlocks: [],
		wordCount: content.split(/\s+/).length,
		lineCount: content.split("\n").length,
		structure: { headingCount: 0, linkCount: 0, codeBlockCount: 0 },
	},
});

export const layer = Layer.effect(
	FileTools,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const pathValidation = yield* PathValidation;

		const readFile = ({
			filePath,
		}: Schema.Schema.Type<typeof ReadFileParameters>) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(filePath);
				const content = yield* fs.readFileString(resolved);
				return { filePath: pathValidation.relativePath(resolved), content };
			});

		const writeFile = ({
			filePath,
			content,
			includeDiff = true,
		}: Schema.Schema.Type<typeof WriteFileParameters>) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(filePath);
				const relPath = pathValidation.relativePath(resolved);
				const previousContent = yield* fs.readFileString(resolved).pipe(
					Effect.map((data) => data as string | null),
					Effect.catchAll(() => Effect.succeed(null as string | null)),
				);
				const original = previousContent ?? "";
				let stats: ReturnType<typeof computeStats> | undefined;
				let diff: string | undefined;
				if (includeDiff) {
					const computedStats = computeStats(original, content);
					const hasChanges = computedStats.totalChanges > 0;
					stats = hasChanges ? computedStats : undefined;
					diff = hasChanges
						? computeDiff(original, content, relPath)
						: undefined;
				}
				yield* fs.writeFileString(resolved, content);
				return {
					filePath: relPath,
					size: content.length,
					created: previousContent === null,
					diff,
					stats,
				};
			});

		const fileExists = ({
			filePath,
		}: Schema.Schema.Type<typeof FileExistsParameters>) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(filePath);
				const relPath = pathValidation.relativePath(resolved);
				const stat = yield* fs
					.stat(resolved)
					.pipe(Effect.catchAll(() => Effect.succeed(null)));
				if (stat === null) return { filePath: relPath, exists: false };
				return {
					filePath: relPath,
					exists: true,
					type: mapFileType(stat.type),
				};
			});

		const renderMarkdown = ({
			filePath,
			includeHtml,
		}: Schema.Schema.Type<typeof RenderMarkdownParameters>) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(filePath);
				const relPath = pathValidation.relativePath(resolved);
				const content = yield* fs.readFileString(resolved);
				if (!isMarkdownFile(resolved)) {
					return createNonMarkdownResult(relPath, content);
				}
				const parsed = yield* Effect.promise(() => parseMarkdown(content));
				return {
					filePath: relPath,
					isMarkdown: true,
					content: parsed.raw,
					plainText: parsed.plainText,
					html: includeHtml ? parsed.html : undefined,
					metadata: {
						headings: parsed.metadata.headings,
						links: parsed.metadata.links,
						codeBlocks: parsed.metadata.codeBlocks.map((block) => ({
							language: block.lang ?? "text",
							lineCount: block.code.split("\n").length,
						})),
						wordCount: parsed.metadata.wordCount,
						lineCount: parsed.metadata.lineCount,
						structure: {
							headingCount: parsed.metadata.headings.length,
							linkCount: parsed.metadata.links.length,
							codeBlockCount: parsed.metadata.codeBlocks.length,
						},
					},
				};
			});

		return { readFile, writeFile, fileExists, renderMarkdown };
	}),
);
