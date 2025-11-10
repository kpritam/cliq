import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class WorkspaceContext extends Context.Tag("WorkspaceContext")<
	WorkspaceContext,
	{
		readonly cwd: string;
		readonly realCwd: string;
	}
>() {}

export const layer = Layer.effect(
	WorkspaceContext,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;

		const cwd = yield* Effect.sync(() => process.cwd());
		const realCwd = yield* fs
			.realPath(cwd)
			.pipe(Effect.catchAll(() => Effect.succeed(cwd)));

		return {
			cwd,
			realCwd: path.resolve(realCwd),
		};
	}),
);
