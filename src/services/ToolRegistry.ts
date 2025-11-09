import { BunContext } from "@effect/platform-bun";
import type { ToolSet } from "ai";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { makeAllTools } from "../adapters/index.js";
import { layer as DirectoryToolsLayer } from "../tools/DirectoryTools.js";
import { layer as EditToolsLayer } from "../tools/EditTools.js";
import { layer as FileToolsLayer } from "../tools/FileTools.js";
import { layer as SearchToolsLayer } from "../tools/SearchTools.js";
import { layer as PathValidationLayer } from "./PathValidation.js";

export class ToolRegistry extends Context.Tag("ToolRegistry")<
	ToolRegistry,
	{
		readonly tools: Effect.Effect<ToolSet>;
		readonly listToolNames: Effect.Effect<ReadonlyArray<string>>;
	}
>() {}

export const layer = Layer.effect(
	ToolRegistry,
	Effect.sync(() => {
		const pathValidationStack = PathValidationLayer.pipe(
			Layer.provide(BunContext.layer),
		);

		// Create managed runtimes with full layer stacks for each tool service
		const fileToolsRuntime = ManagedRuntime.make(
			FileToolsLayer.pipe(
				Layer.provide(pathValidationStack),
				Layer.provide(BunContext.layer),
				Layer.orDie,
			),
		);

		const searchToolsRuntime = ManagedRuntime.make(
			SearchToolsLayer.pipe(
				Layer.provide(pathValidationStack),
				Layer.provide(BunContext.layer),
				Layer.orDie,
			),
		);

		const editToolsRuntime = ManagedRuntime.make(
			EditToolsLayer.pipe(
				Layer.provide(pathValidationStack),
				Layer.provide(BunContext.layer),
				Layer.orDie,
			),
		);

		const directoryToolsRuntime = ManagedRuntime.make(
			DirectoryToolsLayer.pipe(
				Layer.provide(pathValidationStack),
				Layer.provide(BunContext.layer),
				Layer.orDie,
			),
		);

		const toolsMap = makeAllTools(
			fileToolsRuntime,
			searchToolsRuntime,
			editToolsRuntime,
			directoryToolsRuntime,
		);

		return {
			tools: Effect.succeed(toolsMap),
			listToolNames: Effect.succeed(Object.keys(toolsMap).sort()),
		};
	}),
);
