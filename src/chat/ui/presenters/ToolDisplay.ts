import { UI } from "../ChatUI.js";

export interface ToolArgs {
	readonly filePath?: string;
	readonly path?: string;
	readonly content?: string;
	readonly pattern?: string;
	readonly glob?: string;
	readonly old?: string;
	readonly new?: string;
	readonly [key: string]: unknown;
}

const getToolIcon = (toolName: string): string => {
	if (
		toolName.includes("read") ||
		toolName.includes("File") ||
		toolName.includes("exists")
	) {
		return UI.Icons.FILE_READ;
	}
	if (toolName.includes("write")) {
		return UI.Icons.FILE_WRITE;
	}
	if (toolName.includes("edit")) {
		return UI.Icons.FILE_EDIT;
	}
	if (
		toolName.includes("search") ||
		toolName.includes("grep") ||
		toolName.includes("glob")
	) {
		return UI.Icons.SEARCH;
	}
	if (toolName.includes("markdown")) {
		return UI.Icons.MARKDOWN;
	}
	return UI.Icons.TOOL;
};

export const displayToolCall = (toolName: string, args: ToolArgs): void => {
	console.log("");

	const icon = getToolIcon(toolName);
	const header =
		UI.Colors.BORDER("╭─ ") +
		UI.Colors.TOOL(`${icon} `) +
		UI.Colors.TOOL_NAME(toolName) +
		" " +
		UI.Colors.BORDER("─".repeat(Math.max(0, 76 - toolName.length)));

	console.log(header);

	const formattedArgs = formatToolArgs(args);
	if (formattedArgs) {
		console.log(UI.Colors.BORDER("│ ") + formattedArgs);
	}

	console.log(UI.Colors.BORDER(`╰${"─".repeat(78)}`));
};

const truncate = (str: string, maxLen: number): string => {
	if (str.length <= maxLen) return str;
	return `${str.substring(0, maxLen - 3)}...`;
};

export const formatToolArgs = (args: ToolArgs): string => {
	if (!args || Object.keys(args).length === 0) return "";

	const parts: string[] = [];

	// Handle file path
	const filePath = args.filePath || args.path;
	if (filePath && typeof filePath === "string") {
		parts.push(
			UI.Colors.MUTED("path: ") + UI.Colors.TOOL_ARGS(truncate(filePath, 60)),
		);
	}

	// Handle pattern/glob
	const pattern = args.pattern || args.glob;
	if (pattern && typeof pattern === "string") {
		parts.push(
			UI.Colors.MUTED("pattern: ") +
				UI.Colors.TOOL_ARGS(`"${truncate(pattern, 50)}"`),
		);
	}

	// Handle content preview
	if (args.content && typeof args.content === "string" && !filePath) {
		const preview = args.content.split("\n")[0];
		parts.push(
			UI.Colors.MUTED("content: ") +
				UI.Colors.TOOL_ARGS(`"${truncate(preview, 50)}"`),
		);
	}

	// Handle edit operations
	if (args.old && typeof args.old === "string") {
		const preview = args.old.split("\n")[0];
		parts.push(
			UI.Colors.MUTED("replacing: ") +
				UI.Colors.DIM(`"${truncate(preview, 40)}"`),
		);
	}
	if (args.new && typeof args.new === "string") {
		const preview = args.new.split("\n")[0];
		parts.push(
			UI.Colors.MUTED("with: ") +
				UI.Colors.TOOL_ARGS(`"${truncate(preview, 40)}"`),
		);
	}

	// Handle other important args
	const otherKeys = Object.keys(args).filter(
		(k) =>
			![
				"filePath",
				"path",
				"content",
				"pattern",
				"glob",
				"old",
				"new",
			].includes(k),
	);

	for (const key of otherKeys.slice(0, 2)) {
		// Show max 2 additional args
		const value = args[key];
		if (
			typeof value === "string" ||
			typeof value === "number" ||
			typeof value === "boolean"
		) {
			const strValue = String(value);
			parts.push(
				UI.Colors.MUTED(`${key}: `) + UI.Colors.DIM(truncate(strValue, 30)),
			);
		}
	}

	return parts.join(UI.Colors.BORDER(" │ "));
};
