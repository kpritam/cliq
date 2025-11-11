import * as Schema from "effect/Schema";

export const ReadFileParameters = Schema.Struct({
	filePath: Schema.String.annotations({
		description: "The path to the file to read",
	}),
});

export const WriteFileParameters = Schema.Struct({
	filePath: Schema.String.annotations({
		description: "The path where to write the file",
	}),
	content: Schema.String.annotations({
		description: "The content to write to the file",
	}),
	includeDiff: Schema.optional(Schema.Boolean).annotations({
		description: "Include diff details in the response (default true)",
	}),
});

export const FileExistsParameters = Schema.Struct({
	filePath: Schema.String.annotations({
		description: "The path to check for existence",
	}),
});

export const RenderMarkdownParameters = Schema.Struct({
	filePath: Schema.String.annotations({
		description: "The path to the markdown file to parse",
	}),
	includeHtml: Schema.optional(Schema.Boolean).annotations({
		description: "Include HTML rendering (default false)",
	}),
});

export const GlobParameters = Schema.Struct({
	pattern: Schema.String.annotations({
		description: "The glob pattern to match files",
	}),
	cwd: Schema.optional(Schema.String).annotations({
		description: "The working directory for the search",
	}),
	dot: Schema.optional(Schema.Boolean).annotations({
		description: "Include hidden files (default false)",
	}),
	absolute: Schema.optional(Schema.Boolean).annotations({
		description: "Return absolute paths (default false)",
	}),
	onlyFiles: Schema.optional(Schema.Boolean).annotations({
		description: "Only match files, not directories (default true)",
	}),
	maxResults: Schema.optional(Schema.Number).annotations({
		description: "Maximum number of results (default 1000)",
	}),
});

export const GrepParameters = Schema.Struct({
	pattern: Schema.String.annotations({
		description: "The text pattern to search for",
	}),
	isRegex: Schema.optional(Schema.Boolean).annotations({
		description: "Treat pattern as regex (default false)",
	}),
	includePatterns: Schema.optional(Schema.Array(Schema.String)).annotations({
		description: "File patterns to include",
	}),
	excludePatterns: Schema.optional(Schema.Array(Schema.String)).annotations({
		description: "File patterns to exclude",
	}),
	contextLines: Schema.optional(Schema.Number).annotations({
		description: "Number of context lines (default 2)",
	}),
	maxResults: Schema.optional(Schema.Number).annotations({
		description: "Maximum number of results (default 100)",
	}),
	searchPath: Schema.optional(Schema.String).annotations({
		description: "Path to search in (default cwd)",
	}),
});

export const EditParameters = Schema.Struct({
	filePath: Schema.String.annotations({
		description: "The path to the file to edit",
	}),
	oldString: Schema.String.annotations({
		description: "The text to replace",
	}),
	newString: Schema.String.annotations({
		description: "The text to replace it with (must differ from oldString)",
	}),
	replaceAll: Schema.optional(Schema.Boolean).annotations({
		description: "Replace all occurrences of oldString (default false)",
	}),
	preview: Schema.optional(Schema.Boolean).annotations({
		description:
			"Show preview for large changes before applying (default true)",
	}),
	force: Schema.optional(Schema.Boolean).annotations({
		description: "Skip validation warnings and apply changes (default false)",
	}),
	includeDiff: Schema.optional(Schema.Boolean).annotations({
		description: "Include diff details in the response (default true)",
	}),
});

export const PreviewParameters = Schema.Struct({
	filePath: Schema.String.annotations({
		description: "The path to the file to preview editing",
	}),
	oldString: Schema.String.annotations({
		description: "The text to replace",
	}),
	newString: Schema.String.annotations({
		description: "The text to replace it with",
	}),
	replaceAll: Schema.optional(Schema.Boolean).annotations({
		description: "Replace all occurrences of oldString (default false)",
	}),
});

export const ListDirectoryParameters = Schema.Struct({
	path: Schema.String.annotations({
		description: "Directory to list (e.g., '.')",
	}),
});

export const ReadFileToolSchema = Schema.standardSchemaV1(ReadFileParameters);
export const WriteFileToolSchema = Schema.standardSchemaV1(WriteFileParameters);
export const FileExistsToolSchema =
	Schema.standardSchemaV1(FileExistsParameters);
export const RenderMarkdownToolSchema = Schema.standardSchemaV1(
	RenderMarkdownParameters,
);
export const GlobToolSchema = Schema.standardSchemaV1(GlobParameters);
export const GrepToolSchema = Schema.standardSchemaV1(GrepParameters);
export const EditToolSchema = Schema.standardSchemaV1(EditParameters);
export const PreviewToolSchema = Schema.standardSchemaV1(PreviewParameters);
export const ListDirectoryToolSchema = Schema.standardSchemaV1(
	ListDirectoryParameters,
);

export type ReadFileInput = Schema.Schema.Type<typeof ReadFileParameters>;
export type WriteFileInput = Schema.Schema.Type<typeof WriteFileParameters>;
export type FileExistsInput = Schema.Schema.Type<typeof FileExistsParameters>;
export type RenderMarkdownInput = Schema.Schema.Type<
	typeof RenderMarkdownParameters
>;
export type GlobInput = Schema.Schema.Type<typeof GlobParameters>;
export type GrepInput = Schema.Schema.Type<typeof GrepParameters>;
export type EditInput = Schema.Schema.Type<typeof EditParameters>;
export type PreviewInput = Schema.Schema.Type<typeof PreviewParameters>;
export type ListDirectoryInput = Schema.Schema.Type<
	typeof ListDirectoryParameters
>;
