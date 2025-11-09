import type { DiffStats } from "../../../utils/diff.js";

export interface ToolResult {
	readonly filePath?: string;
	readonly path?: string;
	readonly content?: string;
	readonly error?: string;
	readonly success?: boolean;
	readonly size?: number;
	readonly diff?: string;
	readonly stats?: DiffStats;
	readonly created?: boolean;
	readonly preview?: string;
	readonly wouldSucceed?: boolean;
	readonly validation?: {
		readonly warnings?: string[];
	};
	readonly count?: number;
	readonly exists?: boolean;
	readonly isMarkdown?: boolean;
	readonly metadata?: {
		readonly headings?: ReadonlyArray<unknown>;
		readonly links?: ReadonlyArray<unknown>;
		readonly codeBlocks?: ReadonlyArray<unknown>;
		readonly wordCount?: number;
		readonly lineCount?: number;
	};
	readonly requiresConfirmation?: boolean;
	readonly lineCount?: number;
	readonly matches?: unknown[];
	readonly [key: string]: unknown;
}

export const formatToolResultSummary = (
	result: ToolResult,
	toolName: string,
): string => {
	if (result?.error) {
		return `Error: ${result.error}`;
	}

	switch (toolName) {
		case "readFile":
			return formatReadFileSummary(result);
		case "writeFile":
			return formatWriteFileSummary(result);
		case "listDirectories":
			return formatListDirectoriesSummary(result);
		case "fileExists":
			return formatFileExistsSummary(result);
		case "editFile":
			return formatEditSummary(result);
		case "previewEdit":
			return formatPreviewEditSummary(result);
		case "renderMarkdown":
			return formatMarkdownSummary(result);
		case "glob":
			return formatGlobSummary(result);
		case "grep":
			return formatGrepSummary(result);
		default:
			return "Tool executed";
	}
};

const formatReadFileSummary = (result: ToolResult): string => {
	if (result && typeof result.content === "string") {
		const lines = result.content.split("\n").length;
		const chars = result.content.length;
		const kb = (chars / 1024).toFixed(1);
		return `Read file: ${lines} lines, ${kb}KB`;
	}
	return "File read successfully";
};

const formatWriteFileSummary = (result: ToolResult): string => {
	if (!result) return "File written successfully";

	const details: string[] = [];
	if (result.created) details.push("created");
	if (result.stats?.linesAdded)
		details.push(`+${result.stats.linesAdded} lines`);
	if (result.stats?.linesRemoved)
		details.push(`-${result.stats.linesRemoved} lines`);
	const kb = result.size !== undefined ? (result.size / 1024).toFixed(1) : null;
	if (kb) details.push(`${kb}KB`);

	return details.length > 0
		? `Wrote file: ${details.join(", ")}`
		: "File written successfully";
};

const formatListDirectoriesSummary = (result: ToolResult): string => {
	if (result && result.count !== undefined) {
		const plural = result.count === 1 ? "item" : "items";
		return `Listed ${result.count} ${plural}`;
	}
	return "Directory listed successfully";
};

const formatFileExistsSummary = (result: ToolResult): string => {
	if (result && result.exists !== undefined) {
		return result.exists ? "File exists" : "File does not exist";
	}
	return "Existence check completed";
};

export const formatEditSummary = (result: ToolResult): string => {
	if (!result?.success) {
		return result?.requiresConfirmation
			? "Large changes detected — preview shown"
			: "Edit operation completed";
	}

	const changes: string[] = [];
	if (result.stats?.linesAdded)
		changes.push(`+${result.stats.linesAdded} lines`);
	if (result.stats?.linesRemoved)
		changes.push(`-${result.stats.linesRemoved} lines`);

	return `File edited${changes.length > 0 ? `: ${changes.join(", ")}` : " successfully"}`;
};

const formatPreviewEditSummary = (result: ToolResult): string => {
	if (result?.wouldSucceed) {
		return "Edit preview: changes would succeed";
	}
	if (result?.error) {
		return `Preview failed: ${result.error}`;
	}
	return "Edit preview generated";
};

export const formatMarkdownSummary = (result: ToolResult): string => {
	if (!result?.isMarkdown) {
		return result?.lineCount
			? `Read file: ${result.lineCount} lines (not markdown)`
			: "File read successfully";
	}

	const { metadata } = result;
	const parts: string[] = [];
	if (metadata?.headings?.length) {
		parts.push(`${metadata.headings.length}h`);
	}
	if (metadata?.links?.length) {
		parts.push(`${metadata.links.length}l`);
	}
	if (metadata?.codeBlocks?.length) {
		parts.push(`${metadata.codeBlocks.length}cb`);
	}
	if (metadata?.wordCount) {
		parts.push(`${metadata.wordCount}w`);
	}

	return parts.length > 0
		? `Parsed markdown: ${parts.join(", ")}`
		: "Parsed markdown successfully";
};

const formatGlobSummary = (result: ToolResult): string => {
	if (result && result.count !== undefined) {
		const plural = result.count === 1 ? "match" : "matches";
		return `Found ${result.count} ${plural}`;
	}
	return "Glob search completed";
};

const formatGrepSummary = (result: ToolResult): string => {
	if (result && Array.isArray(result.matches)) {
		const plural = result.matches.length === 1 ? "match" : "matches";
		return `Found ${result.matches.length} ${plural}`;
	}
	return "Grep search completed";
};
