import * as Diff from "diff";

export interface DiffStats {
	readonly linesAdded: number;
	readonly linesRemoved: number;
	readonly totalChanges: number;
}

export const computeDiff = (
	original: string,
	updated: string,
	filePath: string,
): string => Diff.createPatch(filePath, original, updated);

export const computeStats = (original: string, updated: string): DiffStats => {
	const parts = Diff.diffLines(original, updated);
	let added = 0;
	let removed = 0;

	for (const part of parts) {
		if (part.added) {
			added += part.count ?? 0;
		} else if (part.removed) {
			removed += part.count ?? 0;
		}
	}

	return {
		linesAdded: added,
		linesRemoved: removed,
		totalChanges: added + removed,
	};
};
