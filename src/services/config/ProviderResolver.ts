import * as Option from "effect/Option";
import type { Provider } from "../../types/config.js";

const PROVIDERS: ReadonlyArray<Provider> = ["anthropic", "openai", "google"];

const DEFAULT_PROVIDER: Provider = "anthropic";

export interface ProviderContext {
	readonly aiProvider: Option.Option<string>;
	readonly anthropicApiKey: Option.Option<string>;
	readonly openaiApiKey: Option.Option<string>;
	readonly googleApiKey: Option.Option<string>;
}

/**
 * Determine the provider to use by inspecting explicit configuration and API keys.
 */
export const resolve = (context: ProviderContext): Provider => {
	const explicitProvider = Option.flatMap(context.aiProvider, (p) => {
		const lower = p.toLowerCase();
		return PROVIDERS.includes(lower as Provider)
			? Option.some(lower as Provider)
			: Option.none<Provider>();
	});

	if (Option.isSome(explicitProvider)) {
		return explicitProvider.value;
	}

	if (Option.isSome(context.anthropicApiKey)) return "anthropic";
	if (Option.isSome(context.openaiApiKey)) return "openai";
	if (Option.isSome(context.googleApiKey)) return "google";

	return DEFAULT_PROVIDER;
};
