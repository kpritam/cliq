import type * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as PathService from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { FileAccessDenied } from "../types/errors.js";
import { WorkspaceContext } from "./WorkspaceContext.js";

export class PathValidation extends Context.Tag("PathValidation")<
	PathValidation,
	{
		readonly ensureWithinCwd: (
			inputPath: string,
		) => Effect.Effect<string, FileAccessDenied | PlatformError.PlatformError>;
		readonly resolvePath: (inputPath: string) => string;
		readonly relativePath: (inputPath: string) => string;
	}
>() {}

export const layer = Layer.effect(
	PathValidation,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* PathService.Path;
		const workspace = yield* WorkspaceContext;
		const cwd = workspace.cwd;
		const cwdReal = workspace.realCwd;

		const resolvePath = (inputPath: string): string =>
			path.resolve(cwd, inputPath);

		const relativePath = (inputPath: string): string =>
			path.relative(cwd, inputPath);

		const ensureWithinCwd = (
			inputPath: string,
		): Effect.Effect<string, FileAccessDenied | PlatformError.PlatformError> =>
			Effect.gen(function* () {
				const resolved = resolvePath(inputPath);
				const exists = yield* fs.exists(resolved);
				const target = exists
					? yield* fs.realPath(resolved)
					: yield* fs.realPath(path.dirname(resolved)).pipe(
							Effect.map((parent) =>
								path.resolve(parent, path.basename(resolved)),
							),
							Effect.catchAll(() => Effect.succeed(resolved)),
						);

				const rel = path.relative(cwdReal, target);
				if (rel.startsWith("..") || path.isAbsolute(rel)) {
					return yield* Effect.fail(new FileAccessDenied({ path: inputPath }));
				}
				return target;
			});

		return {
			ensureWithinCwd,
			resolvePath,
			relativePath,
		};
	}),
);
