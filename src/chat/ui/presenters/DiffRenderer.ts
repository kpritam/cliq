import type { DiffStats } from "../../../utils/diff.js";
import { UI } from "../ChatUI.js";

export const renderDiffBlock = (diff: string): void => {
	const lines = diff.split("\n");

	for (const rawLine of lines) {
		const line = rawLine.replace(/\r?$/, "");

		// Skip empty lines
		if (line.trim().length === 0) {
			continue;
		}

		if (line.startsWith("Index:") || line.startsWith("===")) {
			// Index headers
			console.log(UI.Colors.BORDER("│ ") + UI.Colors.DIFF_HEADER(line));
		} else if (line.startsWith("+++ ") || line.startsWith("--- ")) {
			// File headers
			const filename = line.substring(4);
			const prefix = line.substring(0, 4);
			console.log(
				UI.Colors.BORDER("│ ") +
					UI.Colors.DIM(prefix) +
					UI.Colors.DIFF_FILENAME(filename),
			);
		} else if (line.startsWith("@@")) {
			// Hunk headers
			console.log(UI.Colors.BORDER("│ ") + UI.Colors.DIFF_HEADER(line));
		} else if (line.startsWith("+")) {
			// Additions
			console.log(
				UI.Colors.BORDER("│ ") +
					UI.Colors.DIFF_ADD("+ ") +
					UI.Colors.DIFF_ADD(line.substring(1)),
			);
		} else if (line.startsWith("-")) {
			// Deletions
			console.log(
				UI.Colors.BORDER("│ ") +
					UI.Colors.DIFF_REMOVE("- ") +
					UI.Colors.DIFF_REMOVE(line.substring(1)),
			);
		} else {
			// Context
			console.log(
				UI.Colors.BORDER("│ ") +
					UI.Colors.DIM("  ") +
					UI.Colors.DIFF_CONTEXT(line),
			);
		}
	}
};

export const displayChangeStats = (stats: DiffStats | undefined): void => {
	if (!stats) return;

	const parts: string[] = [];

	if (stats.linesAdded > 0) {
		parts.push(UI.Colors.DIFF_ADD(`+${stats.linesAdded}`));
	}
	if (stats.linesRemoved > 0) {
		parts.push(UI.Colors.DIFF_REMOVE(`-${stats.linesRemoved}`));
	}
	if (stats.totalChanges > 0) {
		parts.push(UI.Colors.SECONDARY(`${stats.totalChanges} total`));
	}

	if (parts.length === 0) {
		return;
	}

	console.log(
		UI.Colors.BORDER("│ ") +
			UI.Colors.TOOL(`${UI.Icons.STATS} `) +
			UI.Colors.MUTED("Changes: ") +
			parts.join(UI.Colors.MUTED(" │ ")) +
			UI.Colors.MUTED(" lines"),
	);
};
