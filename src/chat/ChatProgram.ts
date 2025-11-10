import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { SessionStore } from "../persistence/SessionStore.js";
import { ConfigService } from "../services/ConfigService.js";
import { ToolRegistry } from "../services/ToolRegistry.js";
import type { VercelAI } from "../services/VercelAI.js";
import { WorkspaceContext } from "../services/WorkspaceContext.js";
import { MessageService } from "./MessageService.js";
import { createReadlineInterface, promptForInput } from "./ReadlineIO.js";
import { handleSlashCommand, isSlashCommand } from "./SlashCommandHandler.js";
import { UI } from "./ui/ChatUI.js";

const shouldExit = (input: string) =>
	input === "" || input.toLowerCase() === "exit";

type ReadlineResource = {
	readonly rl: ReturnType<typeof createReadlineInterface>;
	readonly onSigint: () => void;
};

type MessageServiceService = Context.Tag.Service<typeof MessageService>;

const acquireReadline = Effect.sync<ReadlineResource>(() => {
	const rl = createReadlineInterface();
	const onSigint = () => {
		console.log(
			"\n" +
				UI.Colors.BORDER(`╭${"─".repeat(78)}╮`) +
				"\n" +
				UI.Colors.BORDER("│ ") +
				UI.Colors.ACCENT(`${UI.Icons.SUCCESS} `) +
				UI.Colors.SECONDARY("Goodbye!") +
				" ".repeat(68) +
				UI.Colors.BORDER("│") +
				"\n" +
				UI.Colors.BORDER(`╰${"─".repeat(78)}╯`) +
				"\n",
		);
		rl.close();
		process.exit(0);
	};
	rl.on("SIGINT", onSigint);
	return { rl, onSigint };
});

const releaseReadline = (resource: ReadlineResource) =>
	Effect.sync(() => {
		resource.rl.off("SIGINT", resource.onSigint);
		resource.rl.close();
	});

const processInput = (
	sessionId: string,
	messageService: MessageServiceService,
	rl: ReturnType<typeof createReadlineInterface>,
): Effect.Effect<boolean, never, ConfigService | VercelAI> =>
	Effect.gen(function* () {
		const input = yield* promptForInput(
			rl,
			UI.Colors.ACCENT(`${UI.Icons.USER} `) + UI.Colors.PRIMARY("You: "),
		);

		if (isSlashCommand(input)) {
			const exit = yield* handleSlashCommand(rl, input);
			return !exit;
		}

		if (shouldExit(input)) {
			yield* Console.log(
				"\n" +
					UI.Colors.BORDER(`╭${"─".repeat(78)}╮`) +
					"\n" +
					UI.Colors.BORDER("│ ") +
					UI.Colors.ACCENT(`${UI.Icons.SUCCESS} `) +
					UI.Colors.SECONDARY("Goodbye!") +
					" ".repeat(68) +
					UI.Colors.BORDER("│") +
					"\n" +
					UI.Colors.BORDER(`╰${"─".repeat(78)}╯`) +
					"\n",
			);
			return false;
		}

		return yield* messageService.sendMessage(input, sessionId).pipe(
			Effect.as(true),
			Effect.catchAllCause((cause) =>
				Console.error(
					"\n" +
						UI.Colors.BORDER("╭─ ") +
						UI.Colors.ERROR(`${UI.Icons.ERROR} Error`) +
						" " +
						UI.Colors.BORDER("─".repeat(65)) +
						"\n" +
						UI.Colors.BORDER("│ ") +
						UI.Colors.ERROR(Cause.pretty(cause)) +
						"\n" +
						UI.Colors.BORDER(`╰${"─".repeat(78)}`),
				).pipe(Effect.as(false)),
			),
		);
	});

const runLoop = (
	sessionId: string,
	messageService: MessageServiceService,
	rl: ReturnType<typeof createReadlineInterface>,
): Effect.Effect<void, never, ConfigService | VercelAI> =>
	processInput(sessionId, messageService, rl).pipe(
		Effect.flatMap((keepGoing) =>
			keepGoing
				? runLoop(sessionId, messageService, rl)
				: Effect.succeed(undefined),
		),
	);

const chatLoop = (
	sessionId: string,
): Effect.Effect<void, never, MessageService | ConfigService | VercelAI> =>
	Effect.gen(function* () {
		const messageService = yield* MessageService;
		yield* Effect.acquireUseRelease(
			acquireReadline,
			({ rl }) => runLoop(sessionId, messageService, rl),
			(resource, _exit) => releaseReadline(resource),
		);
	});

const displayWelcome = (
	sessionId: string,
	config: { provider: string; model: string },
	toolNames: ReadonlyArray<string>,
) =>
	Effect.all([
		Console.log(""),
		Console.log(UI.Colors.BORDER(`╭${"─".repeat(78)}╮`)),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.ACCENT_BRIGHT(`${UI.Icons.ASSISTANT} Cliq`) +
				UI.Colors.SECONDARY(" — Effect-based AI Assistant") +
				" ".repeat(38) +
				UI.Colors.BORDER("│"),
		),
		Console.log(UI.Colors.BORDER(`├${"─".repeat(78)}┤`)),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.MUTED("Session    ") +
				UI.Colors.SECONDARY(sessionId) +
				" ".repeat(Math.max(0, 66 - sessionId.length)) +
				UI.Colors.BORDER("│"),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.MUTED("Provider   ") +
				UI.Colors.HIGHLIGHT(config.provider) +
				" ".repeat(Math.max(0, 66 - config.provider.length)) +
				UI.Colors.BORDER("│"),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.MUTED("Model      ") +
				UI.Colors.HIGHLIGHT(config.model) +
				" ".repeat(Math.max(0, 66 - config.model.length)) +
				UI.Colors.BORDER("│"),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.MUTED("Tools      ") +
				UI.Colors.SECONDARY(`${toolNames.length} available`) +
				" ".repeat(Math.max(0, 54)) +
				UI.Colors.BORDER("│"),
		),
		Console.log(UI.Colors.BORDER(`├${"─".repeat(78)}┤`)),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.DIM("Type ") +
				UI.Colors.TOOL_ARGS("exit") +
				UI.Colors.DIM(" or ") +
				UI.Colors.TOOL_ARGS("/exit") +
				UI.Colors.DIM(" to quit, ") +
				UI.Colors.TOOL_ARGS("/help") +
				UI.Colors.DIM(" for commands") +
				" ".repeat(28) +
				UI.Colors.BORDER("│"),
		),
		Console.log(UI.Colors.BORDER(`╰${"─".repeat(78)}╯`)),
		Console.log(""),
	]);

export const ChatProgram = Effect.gen(function* () {
	const sessionStore = yield* SessionStore;
	const configService = yield* ConfigService;
	const toolRegistry = yield* ToolRegistry;
	const workspace = yield* WorkspaceContext;

	const config = yield* configService.load;
	const toolNames = yield* toolRegistry.listToolNames;
	const session = yield* sessionStore.createSession(
		workspace.cwd,
		"Cliq Session",
	);

	yield* displayWelcome(session.id, config, toolNames);
	yield* chatLoop(session.id);
});
