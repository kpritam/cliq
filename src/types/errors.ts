import * as Data from "effect/Data";

export class FileAccessDenied extends Data.TaggedError("FileAccessDenied")<{
	readonly path: string;
}> {}

export class StringNotFound extends Data.TaggedError("StringNotFound")<{
	readonly path: string;
	readonly oldString: string;
}> {}

export class EmptyPattern extends Data.TaggedError("EmptyPattern")<{
	readonly pattern: string;
}> {}
export class CommandFailed extends Data.TaggedError("CommandFailed")<{
	readonly command: string;
	readonly args: readonly string[];
	readonly message: string;
}> {}

export class SessionNotFound extends Data.TaggedError("SessionNotFound")<{
	readonly sessionId: string;
}> {}

export class MessageNotFound extends Data.TaggedError("MessageNotFound")<{
	readonly sessionId: string;
	readonly messageId: string;
}> {}
