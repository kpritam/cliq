import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import { z } from "zod";
import { DirectoryTools } from "../tools/DirectoryTools.js";

export const makeDirectoryToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<DirectoryTools, never>,
) => ({
	listDirectories: tool({
		description: "List files and directories in a given path",
		inputSchema: z.object({
			path: z.string().describe("Directory to list (e.g., '.')"),
		}),
		execute: async ({ path: p }: { path: string }) =>
			runtime.runPromise(
				Effect.flatMap(DirectoryTools, (svc) =>
					svc.listDirectories({ path: p }),
				),
			),
	}),
});
