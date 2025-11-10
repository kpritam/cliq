import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import { z } from "zod";
import { FileTools } from "../tools/FileTools.js";
import { runToolEffect } from "./runtime.js";

export const makeFileToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<FileTools, never>,
) => ({
	readFile: tool({
		description: "Read the contents of a file",
		inputSchema: z.object({
			filePath: z.string().describe("The path to the file to read"),
		}),
		execute: async ({ filePath }: { filePath: string }) =>
			runToolEffect(
				runtime,
				Effect.flatMap(FileTools, (service) => service.readFile({ filePath })),
			),
	}),

	writeFile: tool({
		description: "Write content to a file",
		inputSchema: z.object({
			filePath: z.string().describe("The path where to write the file"),
			content: z.string().describe("The content to write to the file"),
		}),
		execute: async ({
			filePath,
			content,
		}: {
			filePath: string;
			content: string;
		}) =>
			runToolEffect(
				runtime,
				Effect.flatMap(FileTools, (service) =>
					service.writeFile({ filePath, content }),
				),
			),
	}),

	fileExists: tool({
		description: "Check if a file or directory exists",
		inputSchema: z.object({
			filePath: z.string().describe("The path to check for existence"),
		}),
		execute: async ({ filePath }: { filePath: string }) =>
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
		inputSchema: z.object({
			filePath: z.string().describe("The path to the markdown file to parse"),
			includeHtml: z
				.boolean()
				.optional()
				.describe("Include HTML rendering (default false)"),
		}),
		execute: async ({
			filePath,
			includeHtml,
		}: {
			filePath: string;
			includeHtml?: boolean;
		}) =>
			runToolEffect(
				runtime,
				Effect.flatMap(FileTools, (service) =>
					service.renderMarkdown({ filePath, includeHtml }),
				),
			),
	}),
});
