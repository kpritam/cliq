import { BunRuntime } from "@effect/platform-bun";
import { config } from "dotenv";
import * as Effect from "effect/Effect";
import { ChatProgram } from "./chat/ChatProgram.js";
import { buildMainLayer } from "./layers/MainLayer.js";

// Load environment variables from .env file
config();

const MainLayer = buildMainLayer();

ChatProgram.pipe(
	Effect.provide(MainLayer),
	Effect.tapErrorCause(Effect.logError),
	BunRuntime.runMain,
);
