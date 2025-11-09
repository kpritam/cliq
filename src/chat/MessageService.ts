import type * as PlatformError from "@effect/platform/Error";
import type { CoreMessage, ToolSet } from "ai";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SessionStore } from "../persistence/SessionStore.js";
import { ConfigService } from "../services/ConfigService.js";
import { ToolRegistry } from "../services/ToolRegistry.js";
import { VercelAI } from "../services/VercelAI.js";
import type { StoredMessage } from "../types/session.js";
import { renderMarkdownToTerminal } from "../utils/markdown/index.js";
import { buildSystemPrompt } from "./systemPrompt.js";
import { presentToolCalls, presentToolResults } from "./ToolPresenter.js";
import { UI } from "./ui/ChatUI.js";

export class MessageService extends Context.Tag("MessageService")<
	MessageService,
	{
		readonly sendMessage: (
			input: string,
			sessionId: string,
		) => Effect.Effect<void, PlatformError.PlatformError>;
	}
>() {}

type VercelAIService = Context.Tag.Service<typeof VercelAI>;

const createUserMessage = (
	input: string,
	sessionId: string,
): StoredMessage => ({
	id: crypto.randomUUID(),
	sessionID: sessionId,
	role: "user",
	content: input,
	time: { created: Date.now() },
});

const createAssistantMessage = (
	text: string,
	sessionId: string,
): StoredMessage => ({
	id: crypto.randomUUID(),
	sessionID: sessionId,
	role: "assistant",
	content: text,
	time: { created: Date.now() },
});

const buildMessages = (
	history: StoredMessage[],
	systemPrompt: string,
): CoreMessage[] => [
	{ role: "system", content: systemPrompt },
	...history
		.filter((msg) => msg.role !== "system")
		.filter((msg) => msg.content.trim().length > 0)
		.map((msg) => ({
			role: msg.role as "user" | "assistant",
			content: msg.content,
		})),
];

const streamTextToConsole = (textStream: AsyncIterable<string>) =>
	Effect.promise(async () => {
		let text = "";
		for await (const textPart of textStream) {
			process.stdout.write(textPart);
			text += textPart;
		}
		process.stdout.write("\n");
		return text;
	});

const displayProcessing = () =>
	Console.log(
		UI.Colors.BORDER("\n╭─ ") +
			UI.Colors.TOOL(`${UI.Icons.PROCESSING} `) +
			UI.Colors.MUTED("Processing...") +
			UI.Colors.BORDER(` ${"─".repeat(62)}`),
	);

const displayAssistantHeader = () =>
	Console.log(
		"\n" +
			UI.Colors.BORDER("╭─ ") +
			UI.Colors.ACCENT(`${UI.Icons.ASSISTANT} `) +
			UI.Colors.ACCENT_BRIGHT("Assistant") +
			" " +
			UI.Colors.BORDER("─".repeat(66)),
	);

const displayComplete = () =>
	Console.log(`${UI.Colors.BORDER(`╰${"─".repeat(78)}`)}\n`);

const handleChatStream = (
	messages: CoreMessage[],
	tools: ToolSet,
	config: { maxSteps: number; temperature: number },
	vercelAI: VercelAIService,
) =>
	Effect.gen(function* () {
		yield* displayProcessing();

		yield* displayAssistantHeader();

		const result = yield* vercelAI.streamChat({
			messages,
			tools,
			maxSteps: config.maxSteps,
			temperature: config.temperature,
			onStepFinish: (step) => {
				if (step.toolCalls && step.toolCalls.length > 0) {
					presentToolCalls(step.toolCalls);
				}
				if (step.toolResults && step.toolResults.length > 0) {
					presentToolResults(step.toolResults);
				}
			},
		});

		const assistantText = yield* streamTextToConsole(result.textStream);
		yield* displayComplete();

		return assistantText;
	});

export const layer = Layer.effect(
	MessageService,
	Effect.gen(function* () {
		const sessionStore = yield* SessionStore;
		const configService = yield* ConfigService;
		const toolRegistry = yield* ToolRegistry;
		const vercelAI = yield* VercelAI;

		const sendMessage = (input: string, sessionId: string) =>
			Effect.gen(function* () {
				const config = yield* configService.load;
				const tools = yield* toolRegistry.tools;

				const userMessage = createUserMessage(input, sessionId);
				yield* sessionStore.saveMessage(userMessage);

				const history = yield* sessionStore.listMessages(sessionId);

				const systemPrompt = buildSystemPrompt({
					cwd: process.cwd(),
					provider: config.provider,
					model: config.model,
					maxSteps: config.maxSteps ?? 10,
				});

				const messages = buildMessages(history, systemPrompt);

				const assistantText = yield* handleChatStream(
					messages,
					tools,
					{
						maxSteps: config.maxSteps ?? 10,
						temperature: config.temperature,
					},
					vercelAI,
				);

				const trimmedAssistantText = assistantText.trim();
				if (trimmedAssistantText.length > 0) {
					const assistantMessage = createAssistantMessage(
						trimmedAssistantText,
						sessionId,
					);
					yield* sessionStore.saveMessage(assistantMessage);
				}
			});

		const service: Context.Tag.Service<typeof MessageService> = {
			sendMessage,
		};

		return service;
	}),
);
