import type * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as PathService from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { PathValidation } from "../services/PathValidation.js";
import type { FileAccessDenied } from "../types/errors.js";

const ListParameters = Schema.Struct({ path: Schema.String });

const ListSuccess = Schema.Struct({
	files: Schema.Array(
		Schema.Struct({
			name: Schema.String,
			type: Schema.Literal("file", "directory"),
		}),
	),
	count: Schema.Number,
});

export class DirectoryTools extends Context.Tag("DirectoryTools")<
	DirectoryTools,
	{
		readonly listDirectories: (
			p: Schema.Schema.Type<typeof ListParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof ListSuccess>,
			Error | PlatformError.PlatformError | FileAccessDenied
		>;
	}
>() {}

export const layer = Layer.effect(
	DirectoryTools,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* PathService.Path;
		const pathValidation = yield* PathValidation;

		const listDirectories = ({
			path: dir,
		}: Schema.Schema.Type<typeof ListParameters>) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(dir);
				const names = yield* fs.readDirectory(resolved);

				const files = yield* Effect.forEach(names, (name) =>
					Effect.gen(function* () {
						const child = path.resolve(resolved, name);
						const info = yield* fs.stat(child);
						return {
							name,
							type:
								info.type === "Directory"
									? ("directory" as const)
									: ("file" as const),
						};
					}),
				);

				return {
					files: files as ReadonlyArray<{
						name: string;
						type: "file" | "directory";
					}>,
					count: files.length,
				};
			});

		return { listDirectories };
	}),
);
