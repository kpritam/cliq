import { BunContext } from "@effect/platform-bun";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";
import { layer as MessageServiceLayer } from "../chat/MessageService.js";
import { layer as FileKeyValueStoreLayer } from "../persistence/FileKeyValueStore.js";
import { layer as PathsLayer } from "../persistence/Paths.js";
import { layer as SessionStoreLayer } from "../persistence/SessionStore.js";
import { layer as ConfigServiceLayer } from "../services/ConfigService.js";
import { layer as PathValidationLayer } from "../services/PathValidation.js";
import { layer as ToolRegistryLayer } from "../services/ToolRegistry.js";
import { layer as VercelAILayer } from "../services/VercelAI.js";
import { layer as DirectoryToolsLayer } from "../tools/DirectoryTools.js";
import { layer as EditToolsLayer } from "../tools/EditTools.js";
import { layer as FileToolsLayer } from "../tools/FileTools.js";
import { layer as SearchToolsLayer } from "../tools/SearchTools.js";

/**
 * MainLayer builder encapsulates all layer composition for the CLI.
 * This keeps `cli.ts` lean and makes it easier to reuse in tests.
 */
export const ConfigProviderLayer = Layer.succeed(
	ConfigProvider.ConfigProvider,
	ConfigProvider.fromEnv(),
);

// Platform & storage stack
export const PlatformStack = PathsLayer.pipe(Layer.provide(BunContext.layer));

export const StorageLayer = FileKeyValueStoreLayer.pipe(
	Layer.provide(Layer.mergeAll(PlatformStack, BunContext.layer)),
);

// Config + session
export const ConfigStack = ConfigServiceLayer.pipe(Layer.provide(StorageLayer));
export const SessionStack = SessionStoreLayer.pipe(Layer.provide(StorageLayer));

// Path validation (fs safety)
export const PathValidationStack = PathValidationLayer.pipe(
	Layer.provide(BunContext.layer),
);

// Tool services
export const ToolsStack = Layer.mergeAll(
	FileToolsLayer,
	SearchToolsLayer,
	EditToolsLayer,
	DirectoryToolsLayer,
).pipe(Layer.provide(Layer.mergeAll(PathValidationStack, BunContext.layer)));

// AI provider stack
export const VercelStack = VercelAILayer.pipe(Layer.provide(ConfigStack));

// Tool registry runtime adaptation
export const RegistryStack = ToolRegistryLayer.pipe(
	Layer.provide(Layer.mergeAll(ToolsStack, VercelStack)),
);

// Message/session/ui related services
export const MessageStack = MessageServiceLayer.pipe(
	Layer.provide(
		Layer.mergeAll(
			SessionStack,
			ConfigStack,
			ToolsStack,
			VercelStack,
			RegistryStack,
		),
	),
);

/**
 * Complete application layer composition.
 */
export const MainLayer = Layer.mergeAll(
	BunContext.layer,
	ConfigProviderLayer,
	PlatformStack,
	StorageLayer,
	ConfigStack,
	SessionStack,
	PathValidationStack,
	ToolsStack,
	VercelStack,
	RegistryStack,
	MessageStack,
);

/**
 * Factory helper to obtain the fully composed layer.
 * Calling this instead of referencing MainLayer directly allows
 * future parameterization (e.g. injecting test paths, config overrides).
 */
export const buildMainLayer = () => MainLayer;
