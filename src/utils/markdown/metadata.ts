import type { Token, Tokens } from "marked";

export interface MarkdownMetadata {
	headings: Array<{ level: number; text: string }>;
	links: Array<{ href: string; text: string }>;
	codeBlocks: Array<{ lang?: string; code: string }>;
	wordCount: number;
	lineCount: number;
}

type LinkToken = Tokens.Generic & {
	readonly type: "link";
	readonly href: string;
	readonly text: string;
};

const isLinkToken = (token: Token): token is LinkToken => token.type === "link";

type ParentToken = Token & { readonly tokens: Token[] };

const hasChildTokens = (token: Token): token is ParentToken =>
	"tokens" in token && Array.isArray((token as ParentToken).tokens);

const extractLinksFromTokens = (
	tokens: Token[],
	links: Array<{ href: string; text: string }>,
): void => {
	for (const token of tokens) {
		if (isLinkToken(token)) {
			links.push({ href: token.href, text: token.text });
		} else if (hasChildTokens(token)) {
			extractLinksFromTokens(token.tokens, links);
		}
	}
};

export const extractMetadata = (
	tokens: Token[],
	content: string,
): MarkdownMetadata => {
	const headings: Array<{ level: number; text: string }> = [];
	const links: Array<{ href: string; text: string }> = [];
	const codeBlocks: Array<{ lang?: string; code: string }> = [];

	for (const token of tokens) {
		if (token.type === "heading") {
			headings.push({ level: token.depth, text: token.text });
		} else if (token.type === "code") {
			codeBlocks.push({ lang: token.lang, code: token.text });
		}
		if (hasChildTokens(token)) {
			extractLinksFromTokens(token.tokens, links);
		}
	}

	const lines = content.split("\n");
	const words = content.split(/\s+/).filter((w) => w.length > 0);

	return {
		headings,
		links,
		codeBlocks,
		wordCount: words.length,
		lineCount: lines.length,
	};
};
