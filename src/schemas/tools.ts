import * as Schema from "effect/Schema";

// Shared diff statistics used across file and edit operations
export const DiffStats = Schema.Struct({
	linesAdded: Schema.Number,
	linesRemoved: Schema.Number,
	totalChanges: Schema.Number,
});

// Markdown related schemas
export const MarkdownHeading = Schema.Struct({
	level: Schema.Number,
	text: Schema.String,
});

export const MarkdownLink = Schema.Struct({
	href: Schema.String,
	text: Schema.String,
});

export const MarkdownCodeBlock = Schema.Struct({
	language: Schema.String,
	lineCount: Schema.Number,
});

export const MarkdownStructure = Schema.Struct({
	headingCount: Schema.Number,
	linkCount: Schema.Number,
	codeBlockCount: Schema.Number,
});

export const MarkdownMetadata = Schema.Struct({
	headings: Schema.Array(MarkdownHeading),
	links: Schema.Array(MarkdownLink),
	codeBlocks: Schema.Array(MarkdownCodeBlock),
	wordCount: Schema.Number,
	lineCount: Schema.Number,
	structure: MarkdownStructure,
});

// Validation structure reused by EditTools (preview & execution)
export const Validation = Schema.Struct({
	isValid: Schema.Boolean,
	warnings: Schema.Array(Schema.String),
	errors: Schema.Array(Schema.String),
	changeStats: DiffStats,
});

export const Schemas = {
	DiffStats,
	MarkdownHeading,
	MarkdownLink,
	MarkdownCodeBlock,
	MarkdownStructure,
	MarkdownMetadata,
	Validation,
} as const;
