import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import type { FileKeyValueStore } from "../../persistence/FileKeyValueStore.js";
import type { Provider } from "../../types/config.js";

const CONFIG_NS = "config";
const PROVIDERS: ReadonlyArray<Provider> = ["anthropic", "openai", "google"];

type FileKeyValueStoreService = Context.Tag.Service<typeof FileKeyValueStore>;

const validateProvider = (value: unknown): Option.Option<Provider> =>
	PROVIDERS.includes(value as Provider)
		? Option.some(value as Provider)
		: Option.none<Provider>();

/**
 * Retrieve the persisted provider if it exists and is valid.
 */
export const loadProvider = (store: FileKeyValueStoreService) =>
	Effect.gen(function* () {
		const value = yield* store.get(CONFIG_NS, "provider");
		return Option.flatMap(value, validateProvider);
	});

/**
 * Retrieve the persisted model name.
 */
export const loadModel = (store: FileKeyValueStoreService) =>
	store.get(CONFIG_NS, "model");

/**
 * Persist the selected provider for future sessions.
 */
export const saveProvider = (
	store: FileKeyValueStoreService,
	provider: Provider,
) => store.set(CONFIG_NS, "provider", provider);

/**
 * Persist the selected model for future sessions.
 */
export const saveModel = (store: FileKeyValueStoreService, model: string) =>
	store.set(CONFIG_NS, "model", model);
