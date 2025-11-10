import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import { z } from "zod";
import { EditTools } from "../tools/EditTools.js";
import { runToolEffect } from "./runtime.js";

export const makeEditToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<EditTools, never>,
) => ({
	editFile: tool({
		description:
			"Edit a file using string replacement with validation and preview for large changes",
		inputSchema: z.object({
			filePath: z.string().describe("The path to the file to edit"),
			oldString: z.string().describe("The text to replace"),
			newString: z
				.string()
				.describe(
					"The text to replace it with (must be different from oldString)",
				),
			replaceAll: z
				.boolean()
				.optional()
				.describe("Replace all occurrences of oldString (default false)"),
			preview: z
				.boolean()
				.optional()
				.describe("Show preview for large changes (default true)"),
			force: z
				.boolean()
				.optional()
				.describe("Skip validation warnings and apply changes (default false)"),
		}),
		execute: async ({
			filePath,
			oldString,
			newString,
			replaceAll,
			preview,
			force,
		}: {
			filePath: string;
			oldString: string;
			newString: string;
			replaceAll?: boolean;
			preview?: boolean;
			force?: boolean;
		}) =>
			runToolEffect(
				runtime,
				Effect.flatMap(EditTools, (service) =>
					service.editFile({
						filePath,
						oldString,
						newString,
						replaceAll,
						preview,
						force,
					}),
				),
			),
	}),

	previewEdit: tool({
		description:
			"Preview file edit changes without applying them - useful for validating large changes",
		inputSchema: z.object({
			filePath: z.string().describe("The path to the file to preview editing"),
			oldString: z.string().describe("The text to replace"),
			newString: z.string().describe("The text to replace it with"),
			replaceAll: z
				.boolean()
				.optional()
				.describe("Replace all occurrences of oldString (default false)"),
		}),
		execute: async ({
			filePath,
			oldString,
			newString,
			replaceAll,
		}: {
			filePath: string;
			oldString: string;
			newString: string;
			replaceAll?: boolean;
		}) =>
			runToolEffect(
				runtime,
				Effect.flatMap(EditTools, (service) =>
					service.previewEdit({ filePath, oldString, newString, replaceAll }),
				),
			),
	}),
});
