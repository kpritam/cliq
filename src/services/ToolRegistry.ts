import { BunContext } from "@effect/platform-bun";
import type { ToolSet } from "ai";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { makeAllTools } from "../adapters/index.js";
import {
	type DirectoryTools,
	layer as DirectoryToolsLayer,
} from "../tools/DirectoryTools.js";
import { type EditTools, layer as EditToolsLayer } from "../tools/EditTools.js";
import { type FileTools, layer as FileToolsLayer } from "../tools/FileTools.js";
import {
	type SearchTools,
	layer as SearchToolsLayer,
} from "../tools/SearchTools.js";
import { layer as GlobServiceLayer } from "./GlobService.js";
import { layer as PathValidationLayer } from "./PathValidation.js";
import { layer as WorkspaceContextLayer } from "./WorkspaceContext.js";

export class ToolRegistry extends Context.Tag("ToolRegistry")<
	ToolRegistry,
	{
		readonly tools: Effect.Effect<ToolSet>;
		readonly listToolNames: Effect.Effect<ReadonlyArray<string>>;
	}
>() {}

export const layer = Layer.effect(
	ToolRegistry,
	Effect.gen(function* () {
		const bunPlatformLayer = BunContext.layer;
		const workspaceLayer = WorkspaceContextLayer.pipe(
			Layer.provide(bunPlatformLayer),
		);
		const pathValidationLayer = PathValidationLayer.pipe(
			Layer.provide(workspaceLayer),
			Layer.provide(bunPlatformLayer),
		);

		const provideCoreDependencies = <A>(
			serviceLayer: Layer.Layer<never, never, A>,
		) =>
			serviceLayer.pipe(
				Layer.provide(pathValidationLayer),
				Layer.provide(workspaceLayer),
				Layer.provide(bunPlatformLayer),
			);

		const fileToolsRuntime = ManagedRuntime.make(
			provideCoreDependencies(FileToolsLayer).pipe(Layer.orDie),
		) as ManagedRuntime.ManagedRuntime<FileTools, never>;
		const searchToolsRuntime = ManagedRuntime.make(
			provideCoreDependencies(SearchToolsLayer)
				.pipe(Layer.provide(GlobServiceLayer))
				.pipe(Layer.orDie),
		) as ManagedRuntime.ManagedRuntime<SearchTools, never>;
		const editToolsRuntime = ManagedRuntime.make(
			provideCoreDependencies(EditToolsLayer).pipe(Layer.orDie),
		) as ManagedRuntime.ManagedRuntime<EditTools, never>;
		const directoryToolsRuntime = ManagedRuntime.make(
			provideCoreDependencies(DirectoryToolsLayer).pipe(Layer.orDie),
		) as ManagedRuntime.ManagedRuntime<DirectoryTools, never>;

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
