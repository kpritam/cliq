import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import {
	type GlobInput,
	GlobToolSchema,
	type GrepInput,
	GrepToolSchema,
} from "../schemas/toolInputs.js";
import { SearchTools } from "../tools/SearchTools.js";
import { runToolEffect } from "./runtime.js";

export const makeSearchToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<SearchTools, never>,
) => ({
	glob: tool({
		description: "Search for files matching a glob pattern",
		inputSchema: GlobToolSchema,
		execute: async (input: GlobInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(SearchTools, (service) => service.glob(input)),
			),
	}),

	grep: tool({
		description: "Search for text patterns in files using ripgrep",
		inputSchema: GrepToolSchema,
		execute: async (input: GrepInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(SearchTools, (service) => service.grep(input)),
			),
	}),
});
