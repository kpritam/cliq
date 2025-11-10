import * as Path from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { WorkspaceContext } from "../services/WorkspaceContext.js";

export class Paths extends Context.Tag("Paths")<
	Paths,
	{
		readonly storageBase: string;
	}
>() {}

export const layer = Layer.effect(
	Paths,
	Effect.gen(function* () {
		const path = yield* Path.Path;
		const workspace = yield* WorkspaceContext;
		const homeDirectory =
			Bun.env.HOME ?? Bun.env.USERPROFILE ?? path.resolve(workspace.cwd, "..");
		const storageBasePath = path.join(homeDirectory, ".cliq", "storage");

		return {
			storageBase: storageBasePath,
		};
	}),
);
