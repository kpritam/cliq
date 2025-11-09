import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import { z } from "zod";
import { SearchTools } from "../tools/SearchTools.js";

export const makeSearchToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<SearchTools, never>,
) => ({
	glob: tool({
		description: "Search for files matching a glob pattern",
		inputSchema: z.object({
			pattern: z.string().describe("The glob pattern to match files"),
			cwd: z
				.string()
				.optional()
				.describe("The working directory for the search"),
			dot: z
				.boolean()
				.optional()
				.describe("Include hidden files (default false)"),
			absolute: z
				.boolean()
				.optional()
				.describe("Return absolute paths (default false)"),
			onlyFiles: z
				.boolean()
				.optional()
				.describe("Only match files, not directories (default true)"),
			maxResults: z
				.number()
				.optional()
				.describe("Maximum number of results (default 1000)"),
		}),
		execute: async ({
			pattern,
			cwd,
			dot,
			absolute,
			onlyFiles,
			maxResults,
		}: {
			pattern: string;
			cwd?: string;
			dot?: boolean;
			absolute?: boolean;
			onlyFiles?: boolean;
			maxResults?: number;
		}) =>
			runtime.runPromise(
				Effect.flatMap(SearchTools, (service) =>
					service.glob({
						pattern,
						cwd,
						dot,
						absolute,
						onlyFiles,
						maxResults,
					}),
				),
			),
	}),

	grep: tool({
		description: "Search for text patterns in files using ripgrep",
		inputSchema: z.object({
			pattern: z.string().describe("The text pattern to search for"),
			isRegex: z
				.boolean()
				.optional()
				.describe("Treat pattern as regex (default false)"),
			includePatterns: z
				.array(z.string())
				.optional()
				.describe("File patterns to include"),
			excludePatterns: z
				.array(z.string())
				.optional()
				.describe("File patterns to exclude"),
			contextLines: z
				.number()
				.optional()
				.describe("Number of context lines (default 2)"),
			maxResults: z
				.number()
				.optional()
				.describe("Maximum number of results (default 100)"),
			searchPath: z
				.string()
				.optional()
				.describe("Path to search in (default cwd)"),
		}),
		execute: async ({
			pattern,
			isRegex,
			includePatterns,
			excludePatterns,
			contextLines,
			maxResults,
			searchPath,
		}: {
			pattern: string;
			isRegex?: boolean;
			includePatterns?: string[];
			excludePatterns?: string[];
			contextLines?: number;
			maxResults?: number;
			searchPath?: string;
		}) =>
			runtime.runPromise(
				Effect.flatMap(SearchTools, (service) =>
					service.grep({
						pattern,
						isRegex,
						includePatterns,
						excludePatterns,
						contextLines,
						maxResults,
						searchPath,
					}),
				),
			),
	}),
});
