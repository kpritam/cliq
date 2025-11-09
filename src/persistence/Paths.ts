import * as Path from "@effect/platform/Path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class Paths extends Context.Tag("Paths")<
	Paths,
	{
		readonly storageBase: string;
		readonly sessionDir: (projectID: string) => string;
		readonly sessionPath: (projectID: string, sessionID: string) => string;
		readonly messageDir: (sessionID: string) => string;
		readonly messagePath: (sessionID: string, messageID: string) => string;
	}
>() {}

export const layer = Layer.effect(
	Paths,
	Effect.gen(function* () {
		const path = yield* Path.Path;
		const homeDirectory =
			Bun.env.HOME ?? Bun.env.USERPROFILE ?? path.resolve(process.cwd(), "..");
		const storageBasePath = path.join(homeDirectory, ".cliq", "storage");

		const sessionDir = (projectID: string) =>
			path.join(storageBasePath, "session", projectID);

		const sessionPath = (projectID: string, sessionID: string) =>
			path.join(storageBasePath, "session", projectID, `${sessionID}.json`);

		const messageDir = (sessionID: string) =>
			path.join(storageBasePath, "message", sessionID);

		const messagePath = (sessionID: string, messageID: string) =>
			path.join(storageBasePath, "message", sessionID, `${messageID}.json`);

		return {
			storageBase: storageBasePath,
			sessionDir,
			sessionPath,
			messageDir,
			messagePath,
		};
	}),
);
