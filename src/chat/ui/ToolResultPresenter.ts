import type { DiffStats } from "../../utils/diff.js";
import { renderMarkdownToTerminal } from "../../utils/markdown/index.js";
import { UI } from "./ChatUI.js";
import {
	displayChangeStats,
	renderDiffBlock,
} from "./presenters/DiffRenderer.js";
import {
	formatToolResultSummary,
	type ToolResult,
} from "./presenters/ResultFormatters.js";

export { displayToolCall, formatToolArgs } from "./presenters/ToolDisplay.js";

export const displayToolResult = (
	toolName: string,
	result: ToolResult,
): void => {
	const summary = formatToolResultSummary(result, toolName);

	// Show result with proper alignment matching tool call borders
	const icon = result?.error ? UI.Icons.ERROR : UI.Icons.SUCCESS;
	const color = result?.error ? UI.Colors.ERROR : UI.Colors.SUCCESS;

	console.log(
		UI.Colors.BORDER("│ ") +
			color(`${icon} `) +
			(result?.error ? UI.Colors.ERROR(summary) : UI.Colors.SECONDARY(summary)),
	);

	displayDetailedToolResult(result, toolName);
	console.log(UI.Colors.BORDER(`╰${"─".repeat(78)}`));
};

export const displayDetailedToolResult = (
	result: ToolResult,
	toolName: string,
): void => {
	displayWriteFileDiff(result, toolName);
	displayEditDiff(result, toolName);
	displayPreviewEdit(result, toolName);
	displayValidationWarnings(result);
	displayMarkdownMetadata(result, toolName);
	displayRenderedMarkdown(result, toolName);
};

export const displayWriteFileDiff = (
	result: ToolResult,
	toolName: string,
): void => {
	if (toolName !== "writeFile" || !result?.diff) return;

	console.log(
		UI.Colors.BORDER("│ ") +
			UI.Colors.TOOL(`${UI.Icons.CHANGES} `) +
			UI.Colors.MUTED("File diff"),
	);
	console.log(UI.Colors.BORDER("│ "));
	renderDiffBlock(result.diff);
	console.log(UI.Colors.BORDER("│ "));
	displayChangeStats(result.stats as DiffStats);
};

export const displayEditDiff = (result: ToolResult, toolName: string): void => {
	if (toolName !== "editFile" || !result?.diff) return;

	console.log(
		UI.Colors.BORDER("│ ") +
			UI.Colors.TOOL(`${UI.Icons.CHANGES} `) +
			UI.Colors.MUTED("Changes"),
	);
	console.log(UI.Colors.BORDER("│ "));
	renderDiffBlock(result.diff);
	console.log(UI.Colors.BORDER("│ "));
	displayChangeStats(result.stats as DiffStats);
};

export const displayPreviewEdit = (
	result: ToolResult,
	toolName: string,
): void => {
	if (toolName !== "previewEdit" || !result) return;

	console.log(
		UI.Colors.BORDER("│ ") +
			UI.Colors.TOOL(`${UI.Icons.PREVIEW} `) +
			UI.Colors.MUTED("Preview"),
	);
	console.log(UI.Colors.BORDER("│ "));
	if (result.diff && typeof result.diff === "string") {
		renderDiffBlock(result.diff);
	} else if (result.preview) {
		console.log(UI.indent(result.preview, 4));
	} else {
		console.log(UI.Colors.DIM("    (no preview available)"));
	}
	console.log(UI.Colors.BORDER("│ "));
};

export const displayValidationWarnings = (result: ToolResult): void => {
	if (
		!result?.validation?.warnings ||
		result.validation.warnings.length === 0
	) {
		return;
	}

	console.log(
		UI.Colors.BORDER("│ ") +
			UI.Colors.WARNING(`${UI.Icons.WARNING} `) +
			UI.Colors.WARNING("Warnings"),
	);
	for (const warning of result.validation.warnings) {
		console.log(UI.Colors.BORDER("│ ") + UI.bullet(UI.Colors.WARNING(warning)));
	}
};

export const displayMarkdownMetadata = (
	result: ToolResult,
	toolName: string,
): void => {
	if (toolName !== "renderMarkdown" || !result?.isMarkdown) return;

	console.log(
		UI.Colors.BORDER("│ ") +
			UI.Colors.TOOL(`${UI.Icons.MARKDOWN} `) +
			UI.Colors.MUTED("Markdown"),
	);
	const { metadata } = result;
	if (metadata?.headings?.length) {
		console.log(
			UI.Colors.BORDER("│ ") +
				UI.bullet(UI.Colors.SECONDARY(`Headings: ${metadata.headings.length}`)),
		);
	}
	if (metadata?.codeBlocks?.length) {
		console.log(
			UI.Colors.BORDER("│ ") +
				UI.bullet(
					UI.Colors.SECONDARY(`Code blocks: ${metadata.codeBlocks.length}`),
				),
		);
	}
};

export const displayRenderedMarkdown = (
	result: ToolResult,
	toolName: string,
): void => {
	if (
		toolName !== "readFile" ||
		!result?.filePath ||
		!result.content ||
		result.content.length >= 2000 ||
		!result.filePath.toLowerCase().endsWith(".md")
	) {
		return;
	}

	console.log(
		"\n" +
			UI.Colors.BORDER("  ") +
			UI.Colors.TOOL(`${UI.Icons.MARKDOWN} `) +
			UI.Colors.MUTED("Rendered Markdown"),
	);
	console.log(UI.Separators.THIN);
	try {
		const rendered = renderMarkdownToTerminal(result.content, 76);
		console.log(UI.indent(rendered, 2));
	} catch (_error) {
		console.log(
			UI.Colors.BORDER("  ") + UI.Colors.DIM("Could not render markdown"),
		);
	}
	console.log(UI.Separators.THIN);
};
