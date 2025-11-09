import type * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { Paths } from "./Paths.js";

export interface FileKeyValueStoreService {
	readonly get: (
		namespace: string,
		key: string,
	) => Effect.Effect<Option.Option<string>, PlatformError.PlatformError>;
	readonly set: (
		namespace: string,
		key: string,
		value: string,
	) => Effect.Effect<void, PlatformError.PlatformError>;
	readonly remove: (
		namespace: string,
		key: string,
	) => Effect.Effect<void, PlatformError.PlatformError>;
	readonly listKeys: (
		namespace: string,
	) => Effect.Effect<ReadonlyArray<string>, PlatformError.PlatformError>;
	readonly clearNamespace: (
		namespace: string,
	) => Effect.Effect<void, PlatformError.PlatformError>;
}

export class FileKeyValueStore extends Context.Tag("FileKeyValueStore")<
	FileKeyValueStore,
	FileKeyValueStoreService
>() {}

const JSON_EXTENSION = ".json";

export const layer = Layer.effect(
	FileKeyValueStore,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;
		const paths = yield* Paths;
		const baseDir = paths.storageBase;

		const namespaceDir = (namespace: string) => path.join(baseDir, namespace);

		const resolveKeyPath = (namespace: string, key: string) =>
			path.join(namespaceDir(namespace), `${key}${JSON_EXTENSION}`);

		const ensureNamespace = (namespace: string) =>
			fs.makeDirectory(namespaceDir(namespace), { recursive: true });

		const read = (filePath: string) =>
			Effect.gen(function* () {
				const exists = yield* fs.exists(filePath);
				if (exists) {
					const content = yield* fs.readFileString(filePath);
					return Option.some(content);
				}
				return Option.none<string>();
			});

		const get = (namespace: string, key: string) =>
			read(resolveKeyPath(namespace, key));

		const set = (namespace: string, key: string, value: string) =>
			Effect.gen(function* () {
				yield* ensureNamespace(namespace);
				yield* fs.writeFileString(resolveKeyPath(namespace, key), value);
			});

		const remove = (namespace: string, key: string) =>
			fs.remove(resolveKeyPath(namespace, key), { force: true });

		const listKeys = (namespace: string) =>
			Effect.gen(function* () {
				const exists = yield* fs.exists(namespaceDir(namespace));
				if (!exists) {
					return [];
				}
				const entries = yield* fs.readDirectory(namespaceDir(namespace));
				return entries
					.filter((entry) => entry.endsWith(JSON_EXTENSION))
					.map((entry) => entry.slice(0, -JSON_EXTENSION.length));
			});

		const clearNamespace = (namespace: string) =>
			fs.remove(namespaceDir(namespace), {
				recursive: true,
				force: true,
			});

		return {
			get,
			set,
			remove,
			listKeys,
			clearNamespace,
		};
	}),
);
