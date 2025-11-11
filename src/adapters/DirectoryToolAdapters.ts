import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import {
	type ListDirectoryInput,
	ListDirectoryToolSchema,
} from "../schemas/toolInputs.js";
import { DirectoryTools } from "../tools/DirectoryTools.js";
import { runToolEffect } from "./runtime.js";

export const makeDirectoryToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<DirectoryTools, never>,
) => ({
	listDirectories: tool({
		description: "List files and directories in a given path",
		inputSchema: ListDirectoryToolSchema,
		execute: async ({ path }: ListDirectoryInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(DirectoryTools, (svc) => svc.listDirectories({ path })),
			),
	}),
});
