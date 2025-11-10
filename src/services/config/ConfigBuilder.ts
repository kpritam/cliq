import * as Option from "effect/Option";
import type {
	AnthropicConfig,
	Config,
	GoogleConfig,
	OpenAIConfig,
	Provider,
} from "../../types/config.js";
import type { EnvConfig } from "./EnvConfig.js";

/**
 * Default model to use for each provider when none is persisted or supplied via env.
 */
const DEFAULT_MODELS: Readonly<Record<Provider, string>> = {
	google: "gemini-2.5-flash",
	anthropic: "claude-haiku-4-5",
	openai: "gpt-4o-mini",
};

interface BaseConfigParams {
	readonly model: string;
	readonly temperature: number;
	readonly maxTokens: Option.Option<number>;
	readonly maxSteps: number;
}

const createBaseConfig = (env: EnvConfig, model: string): BaseConfigParams => ({
	model,
	temperature: env.temperature,
	maxTokens: env.maxTokens,
	maxSteps: env.maxSteps,
});

const createAnthropicConfig = (
	base: BaseConfigParams,
	apiKey: Option.Option<string>,
): AnthropicConfig => ({
	provider: "anthropic",
	model: base.model,
	temperature: base.temperature,
	maxTokens: Option.getOrUndefined(base.maxTokens),
	maxSteps: base.maxSteps,
	apiKey: Option.getOrUndefined(apiKey),
});

const createOpenAIConfig = (
	base: BaseConfigParams,
	apiKey: Option.Option<string>,
): OpenAIConfig => ({
	provider: "openai",
	model: base.model,
	temperature: base.temperature,
	maxTokens: Option.getOrUndefined(base.maxTokens),
	maxSteps: base.maxSteps,
	apiKey: Option.getOrUndefined(apiKey),
});

const createGoogleConfig = (
	base: BaseConfigParams,
	apiKey: Option.Option<string>,
): GoogleConfig => ({
	provider: "google",
	model: base.model,
	temperature: base.temperature,
	maxTokens: Option.getOrUndefined(base.maxTokens),
	maxSteps: base.maxSteps,
	apiKey: Option.getOrUndefined(apiKey),
});

/**
 * Construct the effective configuration for the given provider and model.
 * Values combine persisted settings with environment overrides.
 */
export const build = (
	env: EnvConfig,
	provider: Provider,
	model: string,
): Config => {
	const base = createBaseConfig(env, model);

	switch (provider) {
		case "anthropic":
			return createAnthropicConfig(base, env.anthropicApiKey);
		case "openai":
			return createOpenAIConfig(base, env.openaiApiKey);
		case "google":
			return createGoogleConfig(base, env.googleApiKey);
	}
};

/**
 * Determine which model to use for the given provider, falling back to defaults.
 */
export const resolveModel = (env: EnvConfig, provider: Provider): string =>
	Option.getOrElse(env.aiModel, () => DEFAULT_MODELS[provider]);
