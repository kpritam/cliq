import * as Data from "effect/Data";

export class FileAccessDenied extends Data.TaggedError("FileAccessDenied")<{
	readonly path: string;
}> {}

export class FileNotFound extends Data.TaggedError("FileNotFound")<{
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

export class FileReadFailed extends Data.TaggedError("FileReadFailed")<{
	readonly path: string;
	readonly message: string;
}> {}

export class FileWriteFailed extends Data.TaggedError("FileWriteFailed")<{
	readonly path: string;
	readonly message: string;
}> {}
