import type * as PlatformError from "@effect/platform/Error";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import type { Session, StoredMessage } from "../types/session.js";
import { FileKeyValueStore } from "./FileKeyValueStore.js";

export interface SessionStoreService {
	readonly createSession: (
		directory: string,
		title: string,
	) => Effect.Effect<Session, PlatformError.PlatformError>;
	readonly getSession: (
		projectID: string,
		sessionID: string,
	) => Effect.Effect<Option.Option<Session>, PlatformError.PlatformError>;
	readonly saveSession: (
		session: Session,
	) => Effect.Effect<void, PlatformError.PlatformError>;
	readonly saveMessage: (
		message: StoredMessage,
	) => Effect.Effect<void, PlatformError.PlatformError>;
	readonly listMessages: (
		sessionID: string,
	) => Effect.Effect<Array<StoredMessage>, PlatformError.PlatformError>;
	readonly listSessions: Effect.Effect<
		Array<Session>,
		PlatformError.PlatformError
	>;
}

export class SessionStore extends Context.Tag("SessionStore")<
	SessionStore,
	SessionStoreService
>() {}

const SESSION_NS = "session";
const MESSAGE_NS = "message";

const generateID = () => Effect.sync(() => crypto.randomUUID());
const timestamp = () => Effect.sync(() => Date.now());

const serialize = <A>(value: A) => Effect.sync(() => JSON.stringify(value));
const deserialize = <A>(input: string) =>
	Effect.sync(() => JSON.parse(input) as A);

const hashProject = (directory: string): string => {
	const hasher = new Bun.CryptoHasher("sha256");
	hasher.update(directory);
	return hasher.digest("hex").slice(0, 16);
};

const messageNamespace = (sessionID: string) => `${MESSAGE_NS}/${sessionID}`;

export const layer = Layer.effect(
	SessionStore,
	Effect.gen(function* () {
		const store = yield* FileKeyValueStore;

		const storeSession = (session: Session) =>
			Effect.gen(function* () {
				const serialized = yield* serialize(session);
				yield* store.set(SESSION_NS, session.id, serialized);
			});

		const storeMessage = (message: StoredMessage) =>
			Effect.gen(function* () {
				const serialized = yield* serialize(message);
				yield* store.set(
					messageNamespace(message.sessionID),
					message.id,
					serialized,
				);
			});

		const loadSession = (id: string) =>
			Effect.gen(function* () {
				const maybeValue = yield* store.get(SESSION_NS, id);

				if (Option.isNone(maybeValue)) {
					return Option.none<Session>();
				}

				const session = yield* deserialize<Session>(maybeValue.value);
				return Option.some(session);
			});

		const loadMessage = (sessionID: string, id: string) =>
			Effect.gen(function* () {
				const maybeValue = yield* store.get(messageNamespace(sessionID), id);

				if (Option.isNone(maybeValue)) {
					return Option.none<StoredMessage>();
				}

				const message = yield* deserialize<StoredMessage>(maybeValue.value);
				return Option.some(message);
			});

		const createSession = (directory: string, title: string) =>
			Effect.all([timestamp(), generateID()]).pipe(
				Effect.map(([now, id]) => ({
					id,
					projectID: hashProject(directory),
					directory,
					title,
					version: "0.1.0",
					time: { created: now, updated: now },
				})),
				Effect.tap(storeSession),
			);

		const getSession = (_projectID: string, sessionID: string) =>
			loadSession(sessionID);

		const saveSession = (session: Session) =>
			Effect.gen(function* () {
				const updated = yield* timestamp();
				const updatedSession = {
					...session,
					time: { ...session.time, updated },
				};
				yield* storeSession(updatedSession);
			});

		const saveMessage = (message: StoredMessage) => storeMessage(message);

		const listMessages = (sessionID: string) =>
			Effect.gen(function* () {
				const keys = yield* store.listKeys(messageNamespace(sessionID));
				const messages = yield* Effect.forEach(keys, (key) =>
					Effect.gen(function* () {
						const maybeMessage = yield* loadMessage(sessionID, key);
						return Option.getOrThrow(maybeMessage);
					}),
				);
				// Sort messages by creation timestamp to maintain chronological order
				return messages.sort((a, b) => a.time.created - b.time.created);
			});

		const listSessions = Effect.gen(function* () {
			const keys = yield* store.listKeys(SESSION_NS);
			const sessions = yield* Effect.forEach(keys, (key) =>
				Effect.gen(function* () {
					const maybeSession = yield* loadSession(key);
					return Option.getOrThrow(maybeSession);
				}),
			);
			return sessions;
		});

		return {
			createSession,
			getSession,
			saveSession,
			saveMessage,
			listMessages,
			listSessions,
		};
	}),
);
