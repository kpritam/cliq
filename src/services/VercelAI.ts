import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
	type LanguageModel,
	type ModelMessage,
	type StepResult,
	stepCountIs,
	streamText,
	type ToolSet,
} from "ai";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { Config, Provider } from "../types/config.js";
import { ConfigService } from "./ConfigService.js";

export interface StreamChatRequest<TOOLS extends ToolSet = ToolSet> {
	readonly messages: ModelMessage[];
	readonly tools: TOOLS;
	readonly maxSteps?: number;
	readonly temperature?: number;
	readonly onStepFinish?: (step: StepResult<TOOLS>) => void;
}

export class VercelAI extends Context.Tag("VercelAI")<
	VercelAI,
	{
		readonly getModel: Effect.Effect<LanguageModel>;
		readonly streamChat: <TOOLS extends ToolSet>(
			request: StreamChatRequest<TOOLS>,
		) => Effect.Effect<ReturnType<typeof streamText<TOOLS>>>;
	}
>() {}

const resolveModel = (
	provider: Provider,
	modelId: string,
	apiKey?: string,
): LanguageModel => {
	switch (provider) {
		case "anthropic":
			return createAnthropic(apiKey ? { apiKey } : {})(modelId);
		case "openai":
			return createOpenAI(apiKey ? { apiKey } : {})(modelId);
		case "google":
			return createGoogleGenerativeAI(apiKey ? { apiKey } : {})(modelId);
	}
};

const normalizeProviderOptions = (config: Config) => {
	if (!config.options) return undefined;

	switch (config.provider) {
		case "anthropic":
			return {
				anthropic: structuredClone(config.options),
			};
		case "openai":
			return {
				openai: structuredClone(config.options),
			};
		case "google":
			return {
				google: structuredClone(config.options),
			};
	}
};

export const layer = Layer.effect(
	VercelAI,
	Effect.gen(function* () {
		const configService = yield* ConfigService;

		const getModel = Effect.gen(function* () {
			const config = yield* configService.load;
			return resolveModel(config.provider, config.model, config.apiKey);
		});

		const streamChat = <TOOLS extends ToolSet>(
			request: StreamChatRequest<TOOLS>,
		) =>
			Effect.gen(function* () {
				const config = yield* configService.load;
				const model = yield* getModel;

				const { messages, tools, maxSteps, temperature, onStepFinish } =
					request;

				return streamText({
					model,
					messages,
					tools,
					stopWhen: stepCountIs(maxSteps ?? config.maxSteps ?? 10),
					temperature: temperature ?? config.temperature,
					maxOutputTokens: config.maxTokens,
					providerOptions: normalizeProviderOptions(config) as never,
					onStepFinish,
				});
			});

		return {
			getModel,
			streamChat,
		};
	}),
);
