export type Provider = "anthropic" | "openai" | "google";

export interface AnthropicOptions {
	readonly thinking?: {
		readonly type: "enabled" | "disabled";
		readonly budgetTokens?: number;
	};
}

export interface OpenAIOptions {
	readonly parallelToolCalls?: boolean;
}

export interface GoogleOptions {
	readonly safetySettings?: Array<{
		readonly category: string;
		readonly threshold: string;
	}>;
}

interface BaseConfig {
	readonly model: string;
	readonly temperature: number;
	readonly maxTokens?: number;
	readonly maxSteps?: number;
}

export interface AnthropicConfig extends BaseConfig {
	readonly provider: "anthropic";
	readonly apiKey?: string;
	readonly options?: AnthropicOptions;
}

export interface OpenAIConfig extends BaseConfig {
	readonly provider: "openai";
	readonly apiKey?: string;
	readonly options?: OpenAIOptions;
}

export interface GoogleConfig extends BaseConfig {
	readonly provider: "google";
	readonly apiKey?: string;
	readonly options?: GoogleOptions;
}

export type Config = AnthropicConfig | OpenAIConfig | GoogleConfig;

export interface ProviderConfig {
	readonly provider: Provider;
	readonly model: string;
	readonly apiKey?: string;
}

export type ModelSpecifier = `${Provider}:${string}`;
