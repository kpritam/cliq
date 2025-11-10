import type * as PlatformError from "@effect/platform/Error";
import type * as ConfigError from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";
import { FileKeyValueStore } from "../persistence/FileKeyValueStore.js";
import type {
	Config as AppConfig,
	Provider,
	ProviderConfig,
} from "../types/config.js";
import * as ConfigBuilder from "./config/ConfigBuilder.js";
import * as EnvConfig from "./config/EnvConfig.js";
import * as Persistence from "./config/Persistence.js";
import * as ProviderResolver from "./config/ProviderResolver.js";

export class ConfigService extends Context.Tag("ConfigService")<
	ConfigService,
	{
		readonly load: Effect.Effect<AppConfig>;
		readonly current: Effect.Effect<ProviderConfig>;
		readonly setProvider: (
			provider: Provider,
			model: string,
		) => Effect.Effect<
			void,
			PlatformError.PlatformError | ConfigError.ConfigError
		>;
	}
>() {}

const initializeConfig = (
	store: Context.Tag.Service<typeof FileKeyValueStore>,
) =>
	Effect.gen(function* () {
		const env = yield* EnvConfig.load;
		const persistedProvider = yield* Persistence.loadProvider(store);
		const persistedModel = yield* Persistence.loadModel(store);

		const provider = Option.getOrElse(persistedProvider, () =>
			ProviderResolver.resolve(env),
		);
		const model = Option.getOrElse(persistedModel, () =>
			ConfigBuilder.resolveModel(env, provider),
		);

		return ConfigBuilder.build(env, provider, model);
	});

export const layer = Layer.effect(
	ConfigService,
	Effect.gen(function* () {
		const store = yield* FileKeyValueStore;
		const initialConfig = yield* initializeConfig(store);
		const configRef = yield* Ref.make(initialConfig);

		const load = Ref.get(configRef);

		const current = load.pipe(
			Effect.map((cfg) => ({
				provider: cfg.provider,
				model: cfg.model,
				apiKey: cfg.apiKey,
			})),
		);

		const setProvider = (provider: Provider, model: string) =>
			Effect.gen(function* () {
				yield* Effect.all({
					saveProvider: Persistence.saveProvider(store, provider),
					saveModel: Persistence.saveModel(store, model),
				});
				const env = yield* EnvConfig.load;
				const newConfig = ConfigBuilder.build(env, provider, model);
				yield* Ref.set(configRef, newConfig);
			});

		return {
			load,
			current,
			setProvider,
		};
	}),
);
