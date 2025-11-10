import type * as Path from "@effect/platform/Path";

export type GrepMatch = {
	readonly filePath: string;
	readonly lineNumber: number;
	readonly content: string;
	readonly contextBefore: readonly string[];
	readonly contextAfter: readonly string[];
};

export type GrepFileState = {
	ring: string[];
	pending: Array<{
		before: string[];
		after: string[];
		remainingAfter: number;
		match: GrepMatch;
	}>;
};

export const createGrepFileState = (): GrepFileState => ({
	ring: [],
	pending: [],
});

export const getFileState = (
	states: Map<string, GrepFileState>,
	filePath: string,
	path: Path.Path,
	cwd: string,
	workspaceRoot: string,
): { key: string; state: GrepFileState } => {
	const key = path.relative(workspaceRoot, path.resolve(cwd, filePath));
	let state = states.get(key);
	if (!state) {
		state = createGrepFileState();
		states.set(key, state);
	}
	return { key, state };
};

export const processContextLine = (
	state: GrepFileState,
	ctxLine: string,
	contextLines: number,
): void => {
	state.ring.push(ctxLine);
	if (state.ring.length > contextLines) {
		state.ring.shift();
	}

	for (const p of state.pending) {
		if (p.remainingAfter > 0) {
			p.after.push(ctxLine);
			p.remainingAfter--;
		}
	}

	state.pending = state.pending.filter((p) => p.remainingAfter > 0);
};

export const processMatchLine = (
	state: GrepFileState,
	key: string,
	lineNumber: number,
	content: string,
	contextLines: number,
	results: GrepMatch[],
): void => {
	const before = [...state.ring];
	const matchObj: GrepMatch = {
		filePath: key,
		lineNumber,
		content: content.trimEnd(),
		contextBefore: before,
		contextAfter: [],
	};

	state.pending.push({
		before,
		after: matchObj.contextAfter as string[],
		remainingAfter: contextLines,
		match: matchObj,
	});

	results.push(matchObj);
};

export const parseGrepOutput = (
	output: string,
	path: Path.Path,
	cwd: string,
	contextLines: number,
	workspaceRoot: string,
): { matches: GrepMatch[]; filesSearched: number } => {
	const lines = output.trim().length > 0 ? output.trim().split("\n") : [];
	const fileState = new Map<string, GrepFileState>();
	const results: GrepMatch[] = [];
	let filesSearched = 0;

	for (const line of lines) {
		const parsed = JSON.parse(line);

		if (parsed.type === "summary") {
			filesSearched += parsed.data.searched;
			continue;
		}

		if (parsed.type === "context") {
			const { state } = getFileState(
				fileState,
				parsed.data.path.text,
				path,
				cwd,
				workspaceRoot,
			);
			const ctxLine = parsed.data.lines.text.trimEnd();
			processContextLine(state, ctxLine, contextLines);
			continue;
		}

		if (parsed.type === "match") {
			const { key, state } = getFileState(
				fileState,
				parsed.data.path.text,
				path,
				cwd,
				workspaceRoot,
			);
			processMatchLine(
				state,
				key,
				parsed.data.line_number,
				parsed.data.lines.text,
				contextLines,
				results,
			);
		}
	}

	return { matches: results, filesSearched };
};
