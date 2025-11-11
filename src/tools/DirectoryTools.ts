import type * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as PathService from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import type { ListDirectoryInput } from "../schemas/toolInputs.js";
import { PathValidation } from "../services/PathValidation.js";
import type { FileAccessDenied } from "../types/errors.js";

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
			p: ListDirectoryInput,
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

		const listDirectories = ({ path: dir }: ListDirectoryInput) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(dir);
				const names = yield* fs.readDirectory(resolved);

				const files = yield* Effect.forEach(names, (name) =>
					Effect.gen(function* () {
						const child = path.resolve(resolved, name);
						const info = yield* fs.stat(child);
						const type: "directory" | "file" =
							info.type === "Directory" ? "directory" : "file";
						return {
							name,
							type,
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
