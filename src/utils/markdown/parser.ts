import { marked, type Token } from "marked";
import { extractMetadata } from "./metadata.js";
import { renderToPlainText } from "./renderer.js";

export interface MarkdownParseResult {
	raw: string;
	tokens: Token[];
	plainText: string;
	html: string;
	metadata: {
		headings: Array<{ level: number; text: string }>;
		links: Array<{ href: string; text: string }>;
		codeBlocks: Array<{ lang?: string; code: string }>;
		wordCount: number;
		lineCount: number;
	};
}

export const parseMarkdown = async (
	content: string,
): Promise<MarkdownParseResult> => {
	marked.setOptions({ gfm: true, breaks: true });
	const tokens = marked.lexer(content);
	const html = await marked.parse(content);
	const plainText = renderToPlainText(tokens);
	const metadata = extractMetadata(tokens, content);

	return {
		raw: content,
		tokens,
		plainText,
		html,
		metadata,
	};
};

export const isMarkdownFile = (filePath: string): boolean => {
	const markdownExtensions = [".md", ".markdown", ".mdown", ".mkd", ".mkdn"];
	const lower = filePath.toLowerCase();
	return markdownExtensions.some((ext) => lower.endsWith(ext));
};
