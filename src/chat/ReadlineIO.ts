import * as readline from "node:readline";
import * as Effect from "effect/Effect";

export const createReadlineInterface = () =>
	readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: process.stdin.isTTY,
	});

export const promptForInput = (
	rl: readline.Interface,
	prompt: string,
): Effect.Effect<string> =>
	Effect.async<string>((resume) => {
		let finished = false;
		const finish = (value: string) => {
			if (finished) return;
			finished = true;
			resume(Effect.succeed(value.trim()));
		};

		const onClose = () => finish("");
		rl.once("close", onClose);

		try {
			rl.question(prompt, (answer) => {
				rl.off("close", onClose);
				finish(answer);
			});
		} catch (_err) {
			rl.off("close", onClose);
			finish("");
		}
	});
