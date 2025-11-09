import * as Option from "effect/Option";
import type {
	AnthropicConfig,
	Config,
	GoogleConfig,
	OpenAIConfig,
	Provider,
} from "../../types/config.js";
import type { EnvConfig } from "./EnvConfig.js";

const DEFAULT_MODELS: Readonly<Record<Provider, string>> = {
	google: "gemini-2.5-flash",
	anthropic: "claude-haiku-4-5",
	openai: "gpt-4o-mini",
} as const;

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

export const resolveModel = (env: EnvConfig, provider: Provider): string =>
	Option.getOrElse(env.aiModel, () => DEFAULT_MODELS[provider]);
