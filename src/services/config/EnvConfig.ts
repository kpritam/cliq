import * as Config from "effect/Config";
import type * as Option from "effect/Option";

export interface EnvConfig {
	readonly aiProvider: Option.Option<string>;
	readonly aiModel: Option.Option<string>;
	readonly temperature: number;
	readonly maxTokens: Option.Option<number>;
	readonly maxSteps: number;
	readonly anthropicApiKey: Option.Option<string>;
	readonly openaiApiKey: Option.Option<string>;
	readonly googleApiKey: Option.Option<string>;
}

const envConfig = Config.all({
	aiProvider: Config.option(Config.string("AI_PROVIDER")),
	aiModel: Config.option(Config.string("AI_MODEL")),
	temperature: Config.withDefault(Config.number("AI_TEMPERATURE"), 0.2),
	maxTokens: Config.option(Config.integer("AI_MAX_TOKENS")),
	maxSteps: Config.withDefault(Config.integer("AI_MAX_STEPS"), 10),
	anthropicApiKey: Config.option(Config.string("ANTHROPIC_API_KEY")),
	openaiApiKey: Config.option(Config.string("OPENAI_API_KEY")),
	googleApiKey: Config.option(Config.string("GOOGLE_API_KEY")),
}) satisfies Config.Config<EnvConfig>;

/**
 * Load configuration values from the environment using Effect's config API.
 */
export const load = envConfig;
