import { BunContext, BunRuntime } from "@effect/platform-bun";
import { config } from "dotenv";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { ChatProgram } from "./chat/ChatProgram.js";
import { layer as MessageServiceLayer } from "./chat/MessageService.js";
import { layer as FileKeyValueStoreLayer } from "./persistence/FileKeyValueStore.js";
import { layer as PathsLayer } from "./persistence/Paths.js";
import { layer as SessionStoreLayer } from "./persistence/SessionStore.js";
import { layer as ConfigServiceLayer } from "./services/ConfigService.js";
import { layer as PathValidationLayer } from "./services/PathValidation.js";
import { layer as ToolRegistryLayer } from "./services/ToolRegistry.js";
import { layer as VercelAILayer } from "./services/VercelAI.js";
import { layer as DirectoryToolsLayer } from "./tools/DirectoryTools.js";
import { layer as EditToolsLayer } from "./tools/EditTools.js";
import { layer as FileToolsLayer } from "./tools/FileTools.js";
import { layer as SearchToolsLayer } from "./tools/SearchTools.js";

// Load environment variables from .env file
config();

const ConfigProviderLayer = Layer.succeed(
	ConfigProvider.ConfigProvider,
	ConfigProvider.fromEnv(),
);

const PlatformStack = PathsLayer.pipe(Layer.provide(BunContext.layer));

const StorageLayer = FileKeyValueStoreLayer.pipe(
	Layer.provide(Layer.mergeAll(PlatformStack, BunContext.layer)),
);

const ConfigStack = ConfigServiceLayer.pipe(Layer.provide(StorageLayer));

const SessionStack = SessionStoreLayer.pipe(Layer.provide(StorageLayer));

const PathValidationStack = PathValidationLayer.pipe(
	Layer.provide(BunContext.layer),
);

const ToolsStack = Layer.mergeAll(
	FileToolsLayer,
	SearchToolsLayer,
	EditToolsLayer,
	DirectoryToolsLayer,
).pipe(Layer.provide(Layer.mergeAll(PathValidationStack, BunContext.layer)));

const VercelStack = VercelAILayer.pipe(Layer.provide(ConfigStack));

const RegistryStack = ToolRegistryLayer.pipe(
	Layer.provide(Layer.mergeAll(ToolsStack, VercelStack)),
);

const MessageStack = MessageServiceLayer.pipe(
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

const MainLayer = Layer.mergeAll(
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

ChatProgram.pipe(
	Effect.provide(MainLayer),
	Effect.tapErrorCause(Effect.logError),
	BunRuntime.runMain,
);
