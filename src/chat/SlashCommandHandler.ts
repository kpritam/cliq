import type * as readline from "node:readline";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { ConfigService } from "../services/ConfigService.js";
import type { Provider } from "../types/config.js";
import { promptForInput } from "./ReadlineIO.js";
import { UI } from "./ui/ChatUI.js";

const SLASH_COMMANDS = ["/model", "/exit", "/help"] as const;
type SlashCommand = (typeof SLASH_COMMANDS)[number];

export const isSlashCommand = (input: string): input is SlashCommand =>
	SLASH_COMMANDS.includes(input as SlashCommand);

const showHelp = () =>
	Effect.all([
		Console.log(""),
		Console.log(
			UI.Colors.BORDER("╭─ ") +
				UI.Colors.INFO(`${UI.Icons.INFO} `) +
				UI.Colors.INFO("Available Commands") +
				" " +
				UI.Colors.BORDER("─".repeat(56)),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.bullet(
					UI.Colors.TOOL_ARGS("/model") +
						UI.Colors.SECONDARY(" — Change AI model"),
				),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.bullet(
					UI.Colors.TOOL_ARGS("/exit") +
						UI.Colors.SECONDARY(" — Exit the chat"),
				),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.bullet(
					UI.Colors.TOOL_ARGS("/help") +
						UI.Colors.SECONDARY(" — Show this help"),
				),
		),
		Console.log(UI.Colors.BORDER(`╰${"─".repeat(78)}`)),
		Console.log(""),
	]).pipe(Effect.as(false));

const exitProgram = () =>
	Console.log(
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
	).pipe(Effect.as(true));

const showModelOptions = () =>
	Effect.all([
		Console.log(""),
		Console.log(
			UI.Colors.BORDER("╭─ ") +
				UI.Colors.ACCENT(`${UI.Icons.TOOL} `) +
				UI.Colors.ACCENT_BRIGHT("Available Providers & Models") +
				" " +
				UI.Colors.BORDER("─".repeat(46)),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.HIGHLIGHT("anthropic") +
				UI.Colors.MUTED(": ") +
				UI.Colors.SECONDARY(
					"claude-haiku-4-5, claude-3-5-haiku-latest, claude-3-5-sonnet-latest",
				),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.HIGHLIGHT("openai") +
				UI.Colors.MUTED(":    ") +
				UI.Colors.SECONDARY("gpt-4o, gpt-4o-mini"),
		),
		Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.HIGHLIGHT("google") +
				UI.Colors.MUTED(":    ") +
				UI.Colors.SECONDARY("gemini-2.5-flash, gemini-2.0-flash"),
		),
		Console.log(UI.Colors.BORDER(`╰${"─".repeat(78)}`)),
	]);

const validateProviderInput = (input: string) => {
	if (!input.includes(":")) {
		return Effect.fail(
			new Error("Invalid format. Use: provider:model"),
		) as Effect.Effect<never, Error>;
	}

	const [provider, model] = input.split(":");
	if (!provider || !model) {
		return Effect.fail(
			new Error("Invalid format. Use: provider:model"),
		) as Effect.Effect<never, Error>;
	}

	if (!["anthropic", "openai", "google"].includes(provider)) {
		return Effect.fail(
			new Error("Invalid provider. Use: anthropic, openai, or google"),
		) as Effect.Effect<never, Error>;
	}

	return Effect.succeed({
		provider: provider as Provider,
		model,
	});
};

const handleModelChange = (rl: readline.Interface) =>
	Effect.gen(function* () {
		const configService = yield* ConfigService;

		yield* showModelOptions();

		const input = yield* promptForInput(
			rl,
			"\n" +
				UI.Colors.ACCENT(`${UI.Icons.USER} `) +
				UI.Colors.MUTED("Enter provider:model: "),
		);

		const validation = yield* validateProviderInput(input).pipe(Effect.either);

		if (validation._tag === "Left") {
			yield* Console.log(
				"\n" +
					UI.Colors.BORDER("│ ") +
					UI.Colors.ERROR(`${UI.Icons.ERROR} `) +
					UI.Colors.ERROR(validation.left.message) +
					"\n",
			);
			return false;
		}

		const { provider, model } = validation.right;
		const persisted = yield* configService.setProvider(provider, model).pipe(
			Effect.map(() => true),
			Effect.catchAll((error) =>
				Console.log(
					"\n" +
						UI.Colors.BORDER("│ ") +
						UI.Colors.ERROR(`${UI.Icons.ERROR} `) +
						UI.Colors.ERROR(
							error.message ?? "Failed to persist provider change",
						) +
						"\n",
				).pipe(Effect.as(false)),
			),
		);
		if (!persisted) {
			return false;
		}
		yield* Console.log(
			"\n" +
				UI.Colors.BORDER("│ ") +
				UI.Colors.SUCCESS(`${UI.Icons.SUCCESS} `) +
				UI.Colors.SUCCESS(`Model changed to ${provider}:${model}`),
		);
		yield* Console.log(
			UI.Colors.BORDER("│ ") +
				UI.Colors.DIM("  This will take effect on next message.") +
				"\n",
		);
		return false;
	});

export const handleSlashCommand = (rl: readline.Interface, command: string) =>
	Effect.gen(function* () {
		if (command === "/exit") {
			return yield* exitProgram();
		}

		if (command === "/help") {
			return yield* showHelp();
		}

		if (command === "/model") {
			return yield* handleModelChange(rl);
		}

		return false;
	});
