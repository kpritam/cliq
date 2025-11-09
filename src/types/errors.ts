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
