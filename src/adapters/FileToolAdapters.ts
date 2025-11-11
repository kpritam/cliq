import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import {
	type FileExistsInput,
	FileExistsToolSchema,
	type ReadFileInput,
	ReadFileToolSchema,
	type RenderMarkdownInput,
	RenderMarkdownToolSchema,
	type WriteFileInput,
	WriteFileToolSchema,
} from "../schemas/toolInputs.js";
import { FileTools } from "../tools/FileTools.js";
import { runToolEffect } from "./runtime.js";

export const makeFileToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<FileTools, never>,
) => ({
	readFile: tool({
		description: "Read the contents of a file",
		inputSchema: ReadFileToolSchema,
		execute: async ({ filePath }: ReadFileInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(FileTools, (service) => service.readFile({ filePath })),
			),
	}),

	writeFile: tool({
		description: "Write content to a file",
		inputSchema: WriteFileToolSchema,
		execute: async ({ filePath, content, includeDiff }: WriteFileInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(FileTools, (service) =>
					service.writeFile({ filePath, content, includeDiff }),
				),
			),
	}),

	fileExists: tool({
		description: "Check if a file or directory exists",
		inputSchema: FileExistsToolSchema,
		execute: async ({ filePath }: FileExistsInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(FileTools, (service) =>
					service.fileExists({ filePath }),
				),
			),
	}),

	renderMarkdown: tool({
		description:
			"Read and parse a markdown file, returning both raw content and parsed metadata",
		inputSchema: RenderMarkdownToolSchema,
		execute: async ({ filePath, includeHtml }: RenderMarkdownInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(FileTools, (service) =>
					service.renderMarkdown({ filePath, includeHtml }),
				),
			),
	}),
});
