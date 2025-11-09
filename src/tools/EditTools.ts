import * as FileSystem from "@effect/platform/FileSystem";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { PathValidation } from "../services/PathValidation.js";
import { type FileAccessDenied, StringNotFound } from "../types/errors.js";
import { computeDiff, computeStats } from "../utils/diff.js";

const EditParameters = Schema.Struct({
	filePath: Schema.String,
	oldString: Schema.String,
	newString: Schema.String,
	replaceAll: Schema.optional(Schema.Boolean),
	preview: Schema.optional(Schema.Boolean),
	force: Schema.optional(Schema.Boolean),
});

const DiffStatsSchema = Schema.Struct({
	linesAdded: Schema.Number,
	linesRemoved: Schema.Number,
	totalChanges: Schema.Number,
});

const Validation = Schema.Struct({
	isValid: Schema.Boolean,
	warnings: Schema.Array(Schema.String),
	errors: Schema.Array(Schema.String),
	changeStats: DiffStatsSchema,
});

const EditSuccess = Schema.Struct({
	success: Schema.Boolean,
	path: Schema.String,
	size: Schema.Number,
	diff: Schema.String,
	stats: DiffStatsSchema,
	validation: Validation,
	message: Schema.optional(Schema.String),
	preview: Schema.optional(Schema.String),
});

const PreviewParameters = Schema.Struct({
	filePath: Schema.String,
	oldString: Schema.String,
	newString: Schema.String,
	replaceAll: Schema.optional(Schema.Boolean),
});

const PreviewSuccess = Schema.Struct({
	path: Schema.String,
	diff: Schema.String,
	validation: Validation,
	recommendation: Schema.optional(Schema.Literal("proceed", "review", "abort")),
});

export class EditTools extends Context.Tag("EditTools")<
	EditTools,
	{
		readonly editFile: (
			params: Schema.Schema.Type<typeof EditParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof EditSuccess>,
			StringNotFound | FileAccessDenied | Error
		>;
		readonly previewEdit: (
			params: Schema.Schema.Type<typeof PreviewParameters>,
		) => Effect.Effect<
			Schema.Schema.Type<typeof PreviewSuccess>,
			StringNotFound | FileAccessDenied | Error
		>;
	}
>() {}

const validateEdit = (original: string, updated: string) => {
	const stats = computeStats(original, updated);
	const warnings: string[] = [];
	const errors: string[] = [];

	if (updated.length > 500_000) {
		warnings.push("File becomes very large (>500KB)");
	}
	if (updated.includes("\u0000")) {
		errors.push("Content contains null bytes");
	}
	const longLine = updated.split("\n").some((l) => l.length > 2000);
	if (longLine) {
		warnings.push("Contains very long lines (>2000 chars)");
	}

	return {
		isValid: errors.length === 0,
		warnings,
		errors,
		changeStats: stats,
	};
};

const applyReplacement = (
	content: string,
	oldString: string,
	newString: string,
	replaceAll: boolean,
	filePath: string,
): Effect.Effect<string, StringNotFound> => {
	if (oldString === "") {
		return Effect.succeed(newString);
	}
	if (!content.includes(oldString)) {
		return Effect.fail(new StringNotFound({ path: filePath, oldString }));
	}

	const replaced = replaceAll
		? content.split(oldString).join(newString)
		: content.replace(oldString, newString);

	return Effect.succeed(replaced);
};

export const layer = Layer.effect(
	EditTools,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const pathValidation = yield* PathValidation;

		const previewEdit = ({
			filePath,
			oldString,
			newString,
			replaceAll = false,
		}: Schema.Schema.Type<typeof PreviewParameters>) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(filePath);
				const content = yield* fs.readFileString(resolved);
				const updated = yield* applyReplacement(
					content,
					oldString,
					newString,
					replaceAll,
					filePath,
				);

				const validation = validateEdit(content, updated);
				let recommendation: "proceed" | "review" | "abort" | undefined;

				if (!validation.isValid) {
					recommendation = "abort";
				} else if (validation.warnings.length > 0) {
					recommendation = "review";
				} else {
					recommendation = "proceed";
				}

				return {
					path: pathValidation.relativePath(resolved),
					diff: computeDiff(content, updated, filePath),
					validation,
					recommendation,
				};
			});

		const editFile = ({
			filePath,
			oldString,
			newString,
			replaceAll = false,
			preview,
			force,
		}: Schema.Schema.Type<typeof EditParameters>) =>
			Effect.gen(function* () {
				const resolved = yield* pathValidation.ensureWithinCwd(filePath);
				const content = yield* fs.readFileString(resolved);
				const updated = yield* applyReplacement(
					content,
					oldString,
					newString,
					replaceAll,
					filePath,
				);

				const validation = validateEdit(content, updated);
				const stats = validation.changeStats;
				const diff = computeDiff(content, updated, filePath);
				const relPath = pathValidation.relativePath(resolved);

				const shouldGate =
					(preview ?? true) &&
					(!validation.isValid || validation.warnings.length > 0);

				if (shouldGate && !force) {
					return {
						success: false,
						path: relPath,
						size: updated.length,
						diff,
						stats,
						validation,
						message:
							"Large or risky change detected. Preview recommended before applying.",
						preview: diff,
					};
				}

				yield* fs.writeFileString(resolved, updated);

				return {
					success: true,
					path: relPath,
					size: updated.length,
					diff,
					stats,
					validation,
				};
			});

		return {
			editFile,
			previewEdit,
		};
	}),
);
