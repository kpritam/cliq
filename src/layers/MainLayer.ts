import { BunContext } from "@effect/platform-bun";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";
import { layer as MessageServiceLayer } from "../chat/MessageService.js";
import { layer as FileKeyValueStoreLayer } from "../persistence/FileKeyValueStore.js";
import { layer as PathsLayer } from "../persistence/Paths.js";
import { layer as SessionStoreLayer } from "../persistence/SessionStore.js";
import { layer as ConfigServiceLayer } from "../services/ConfigService.js";
import { layer as CryptoHasherLayer } from "../services/CryptoHasher.js";
import { layer as GlobServiceLayer } from "../services/GlobService.js";
import { layer as PathValidationLayer } from "../services/PathValidation.js";
import { layer as ToolRegistryLayer } from "../services/ToolRegistry.js";
import { layer as VercelAILayer } from "../services/VercelAI.js";
import { layer as WorkspaceContextLayer } from "../services/WorkspaceContext.js";
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

const bunPlatformLayer = BunContext.layer;

const workspaceLayer = WorkspaceContextLayer.pipe(
	Layer.provide(bunPlatformLayer),
);
const globLayer = GlobServiceLayer;

const pathsLayer = PathsLayer.pipe(
	Layer.provide(Layer.mergeAll(bunPlatformLayer, workspaceLayer)),
);

const storageLayer = FileKeyValueStoreLayer.pipe(
	Layer.provide(Layer.mergeAll(pathsLayer, bunPlatformLayer)),
);

const configLayer = ConfigServiceLayer.pipe(Layer.provide(storageLayer));
const cryptoHasherLayer = CryptoHasherLayer;
const sessionLayer = SessionStoreLayer.pipe(
	Layer.provide(Layer.mergeAll(storageLayer, cryptoHasherLayer)),
);

const pathValidationLayer = PathValidationLayer.pipe(
	Layer.provide(Layer.mergeAll(bunPlatformLayer, workspaceLayer)),
);

const toolServicesLayer = Layer.mergeAll(
	FileToolsLayer,
	SearchToolsLayer,
	EditToolsLayer,
	DirectoryToolsLayer,
).pipe(
	Layer.provide(
		Layer.mergeAll(
			pathValidationLayer,
			bunPlatformLayer,
			workspaceLayer,
			globLayer,
		),
	),
);

const vercelLayer = VercelAILayer.pipe(Layer.provide(configLayer));

const registryLayer = ToolRegistryLayer.pipe(
	Layer.provide(Layer.mergeAll(toolServicesLayer, vercelLayer)),
);

const messageLayer = MessageServiceLayer.pipe(
	Layer.provide(
		Layer.mergeAll(
			sessionLayer,
			configLayer,
			toolServicesLayer,
			vercelLayer,
			registryLayer,
			workspaceLayer,
		),
	),
);

/**
 * Complete application layer composition.
 */
export const MainLayer = Layer.mergeAll(
	bunPlatformLayer,
	ConfigProviderLayer,
	workspaceLayer,
	pathsLayer,
	storageLayer,
	configLayer,
	sessionLayer,
	pathValidationLayer,
	cryptoHasherLayer,
	globLayer,
	toolServicesLayer,
	vercelLayer,
	registryLayer,
	messageLayer,
);

/**
 * Factory helper to obtain the fully composed layer.
 * Calling this instead of referencing MainLayer directly allows
 * future parameterization (e.g. injecting test paths, config overrides).
 */
export const buildMainLayer = () => MainLayer;
