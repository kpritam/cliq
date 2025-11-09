import chalk from "chalk";

const Icons = {
	// Core actions
	TOOL: "◆",
	SUCCESS: "✓",
	PROCESSING: "◉",
	ASSISTANT: "◆",
	USER: "❯",

	// File operations
	CHANGES: "✎",
	STATS: "◈",
	PREVIEW: "◐",
	FILE_READ: "◐",
	FILE_WRITE: "◆",
	FILE_EDIT: "✎",

	// Status indicators
	WARNING: "⚠",
	ERROR: "✗",
	INFO: "ⓘ",

	// Content types
	CODE: "◈",
	MARKDOWN: "◇",
	SEARCH: "◎",

	// Visual elements
	ARROW: "→",
	DOT: "•",
	CORNER_TOP_LEFT: "╭",
	CORNER_TOP_RIGHT: "╮",
	CORNER_BOTTOM_LEFT: "╰",
	CORNER_BOTTOM_RIGHT: "╯",
	HORIZONTAL: "─",
	VERTICAL: "│",
	BULLET: "•",
} as const;

const Colors = {
	// Tool colors
	TOOL: chalk.hex("#8B949E"), // Muted gray
	TOOL_NAME: chalk.hex("#79C0FF").bold, // Bright blue
	TOOL_ARGS: chalk.hex("#A5D6FF"), // Light blue

	// Status colors
	SUCCESS: chalk.hex("#3FB950"), // Green
	ERROR: chalk.hex("#F85149"), // Red
	WARNING: chalk.hex("#D29922"), // Orange
	INFO: chalk.hex("#58A6FF"), // Blue

	// Text hierarchy
	PRIMARY: chalk.hex("#E6EDF3"), // Bright white
	SECONDARY: chalk.hex("#8B949E"), // Gray
	MUTED: chalk.hex("#6E7681"), // Muted gray
	DIM: chalk.hex("#484F58"), // Dim gray

	// Highlights
	HIGHLIGHT: chalk.hex("#79C0FF"), // Bright blue
	ACCENT: chalk.hex("#D2A8FF"), // Purple
	ACCENT_BRIGHT: chalk.hex("#D2A8FF").bold, // Bold purple

	// Code
	CODE: chalk.hex("#FFA657"), // Orange
	CODE_BLOCK: chalk.hex("#8B949E"), // Gray

	// Diff colors
	DIFF_ADD: chalk.hex("#3FB950"), // Green
	DIFF_REMOVE: chalk.hex("#F85149"), // Red
	DIFF_CONTEXT: chalk.hex("#6E7681"), // Muted gray
	DIFF_HEADER: chalk.hex("#58A6FF"), // Blue
	DIFF_FILENAME: chalk.hex("#D2A8FF").bold, // Bold purple

	// Borders
	BORDER: chalk.hex("#30363D"), // Dark gray
	BORDER_BRIGHT: chalk.hex("#484F58"), // Medium gray
	BORDER_ACCENT: chalk.hex("#58A6FF"), // Blue
} as const;

const Separators = {
	MAIN: chalk.hex("#30363D")("─".repeat(80)),
	SECTION: "\n",
	THIN: chalk.hex("#21262D")("─".repeat(80)),
	DOUBLE: chalk.hex("#30363D")("═".repeat(80)),
} as const;

const printInfo = (message: string): void => {
	console.log(Colors.INFO(`${Icons.INFO} ${message}`));
};

const printError = (message: string): void => {
	console.log(Colors.ERROR(`${Icons.ERROR} ${message}`));
};

const printSuccess = (message: string): void => {
	console.log(Colors.SUCCESS(`${Icons.SUCCESS} ${message}`));
};

const printWarning = (message: string): void => {
	console.log(Colors.WARNING(`${Icons.WARNING} ${message}`));
};

const box = (
	content: string,
	opts?: { title?: string; color?: keyof typeof Colors; width?: number },
): string => {
	const width = opts?.width ?? 80;
	const color = opts?.color ? Colors[opts.color] : Colors.BORDER;
	const lines = content.split("\n");
	const contentWidth = width - 4; // Account for borders and padding

	const top = color(
		Icons.CORNER_TOP_LEFT +
			Icons.HORIZONTAL.repeat(opts?.title ? opts.title.length + 2 : width - 2) +
			Icons.CORNER_TOP_RIGHT,
	);

	const titleLine = opts?.title
		? color(Icons.VERTICAL) +
			" " +
			Colors.ACCENT(opts.title) +
			" " +
			color(Icons.VERTICAL)
		: null;

	const contentLines = lines.map(
		(line) =>
			color(Icons.VERTICAL) +
			" " +
			line.padEnd(contentWidth) +
			" " +
			color(Icons.VERTICAL),
	);

	const bottom = color(
		Icons.CORNER_BOTTOM_LEFT +
			Icons.HORIZONTAL.repeat(width - 2) +
			Icons.CORNER_BOTTOM_RIGHT,
	);

	return [top, titleLine, ...contentLines, bottom].filter(Boolean).join("\n");
};

const indent = (text: string, spaces = 2): string => {
	const prefix = " ".repeat(spaces);
	return text
		.split("\n")
		.map((line) => prefix + line)
		.join("\n");
};

const bullet = (text: string, icon?: string): string => {
	return `${Colors.MUTED(icon ?? Icons.BULLET)} ${text}`;
};

export const UI = {
	Icons,
	Colors,
	Separators,
	printInfo,
	printError,
	printSuccess,
	printWarning,
	box,
	indent,
	bullet,
} as const;
