import { tool } from "ai";
import * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import {
	type EditInput,
	EditToolSchema,
	type PreviewInput,
	PreviewToolSchema,
} from "../schemas/toolInputs.js";
import { EditTools } from "../tools/EditTools.js";
import { runToolEffect } from "./runtime.js";

export const makeEditToolsForVercel = (
	runtime: ManagedRuntime.ManagedRuntime<EditTools, never>,
) => ({
	editFile: tool({
		description:
			"Edit a file using string replacement with validation and preview for large changes",
		inputSchema: EditToolSchema,
		execute: async (input: EditInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(EditTools, (service) => service.editFile(input)),
			),
	}),

	previewEdit: tool({
		description:
			"Preview file edit changes without applying them - useful for validating large changes",
		inputSchema: PreviewToolSchema,
		execute: async (input: PreviewInput) =>
			runToolEffect(
				runtime,
				Effect.flatMap(EditTools, (service) => service.previewEdit(input)),
			),
	}),
});
