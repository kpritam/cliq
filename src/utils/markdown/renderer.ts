import chalk from "chalk";
import { marked, type Token, type Tokens } from "marked";

const TerminalColors = {
	heading: chalk.hex("#60A5FA"),
	code: chalk.hex("#D1D5DB"),
	codeBlock: chalk.hex("#9CA3AF"),
	blockQuote: chalk.hex("#D1D5DB"),
	link: chalk.hex("#60A5FA").underline,
	linkText: chalk.hex("#93C5FD"),
	strong: chalk.bold,
	emphasis: chalk.italic,
	listItem: chalk.hex("#D1D5DB"),
	rule: chalk.hex("#E5E7EB"),
	text: chalk.white,
};

const renderListToText = (listToken: Tokens.List): string => {
	const items: string[] = [];
	for (let i = 0; i < listToken.items.length; i++) {
		const item = listToken.items[i];
		const prefix = listToken.ordered ? `${i + 1}. ` : "- ";
		items.push(`${prefix}${item.text}`);
	}
	return items.join("\n");
};

export const renderToPlainText = (tokens: Token[]): string => {
	const lines: string[] = [];
	for (const token of tokens) {
		switch (token.type) {
			case "heading":
				lines.push(`${"#".repeat(token.depth)} ${token.text}`);
				break;
			case "paragraph":
				lines.push(token.text);
				break;
			case "list":
				if ("items" in token && Array.isArray(token.items)) {
					lines.push(renderListToText(token as Tokens.List));
				}
				break;
			case "code":
				lines.push(`\`\`\`${token.lang || ""}`);
				lines.push(token.text);
				lines.push("```");
				break;
			case "blockquote":
				lines.push(`> ${token.text}`);
				break;
			case "hr":
				lines.push("---");
				break;
			case "text":
				lines.push(token.text);
				break;
			default:
				if ("text" in token && typeof token.text === "string") {
					lines.push(token.text);
				}
		}
	}
	return lines.join("\n\n");
};

const wrapText = (text: string, maxWidth: number): string => {
	if (maxWidth <= 0) return text;

	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		if (currentLine.length + word.length + 1 <= maxWidth) {
			currentLine += (currentLine ? " " : "") + word;
		} else {
			if (currentLine) {
				lines.push(currentLine);
				currentLine = word;
			} else {
				lines.push(word);
			}
		}
	}

	if (currentLine) {
		lines.push(currentLine);
	}

	return lines.join("\n");
};

const addIndent = (text: string, indent: string): string =>
	text
		.split("\n")
		.map((line) => indent + line)
		.join("\n");

const renderListToTerminal = (
	listToken: Tokens.List,
	maxWidth: number,
	indent: string,
): string => {
	const items: string[] = [];
	for (let i = 0; i < listToken.items.length; i++) {
		const item = listToken.items[i];
		const prefix = listToken.ordered ? `${i + 1}. ` : "• ";
		const itemText = wrapText(
			item.text,
			maxWidth - indent.length - prefix.length - 2,
		);
		const firstLine = `${indent}${TerminalColors.listItem(prefix)}${TerminalColors.text(itemText.split("\n")[0])}`;
		const additionalLines = itemText.split("\n").slice(1);
		const wrappedLines = [firstLine];

		for (const line of additionalLines) {
			wrappedLines.push(
				`${indent}${" ".repeat(prefix.length)}${TerminalColors.text(line)}`,
			);
		}
		items.push(wrappedLines.join("\n"));
	}

	return items.join("\n");
};

const renderTokensToTerminal = (
	tokens: Token[],
	maxWidth: number,
	indent = "",
): string => {
	const lines: string[] = [];

	for (const token of tokens) {
		switch (token.type) {
			case "heading": {
				const prefix = "#".repeat(token.depth);
				lines.push(TerminalColors.heading(`${indent}${prefix} ${token.text}`));
				lines.push("");
				break;
			}
			case "paragraph": {
				const wrappedText = wrapText(token.text, maxWidth - indent.length);
				lines.push(TerminalColors.text(addIndent(wrappedText, indent)));
				lines.push("");
				break;
			}
			case "list":
				if ("items" in token && Array.isArray(token.items)) {
					lines.push(
						renderListToTerminal(token as Tokens.List, maxWidth, indent),
					);
					lines.push("");
				}
				break;
			case "code": {
				lines.push(
					TerminalColors.codeBlock(`${indent}\`\`\`${token.lang || ""}`),
				);
				const codeLines = token.text.split("\n");
				for (const codeLine of codeLines) {
					lines.push(TerminalColors.code(`${indent}${codeLine}`));
				}
				lines.push(TerminalColors.codeBlock(`${indent}\`\`\``));
				lines.push("");
				break;
			}
			case "blockquote": {
				const quotedText = wrapText(token.text, maxWidth - indent.length - 2);
				const quotedLines = quotedText.split("\n");
				for (const quotedLine of quotedLines) {
					lines.push(TerminalColors.blockQuote(`${indent}┃ ${quotedLine}`));
				}
				lines.push("");
				break;
			}
			case "hr":
				lines.push(
					TerminalColors.rule(
						`${indent}${"─".repeat(Math.min(40, maxWidth - indent.length))}`,
					),
				);
				lines.push("");
				break;
			case "text": {
				const textWrapped = wrapText(token.text, maxWidth - indent.length);
				lines.push(TerminalColors.text(addIndent(textWrapped, indent)));
				break;
			}
			default:
				if ("text" in token && typeof token.text === "string") {
					const defaultWrapped = wrapText(token.text, maxWidth - indent.length);
					lines.push(TerminalColors.text(addIndent(defaultWrapped, indent)));
				}
		}
	}

	return lines.join("\n").replace(/\n{3,}/g, "\n\n");
};

export const renderMarkdownToTerminal = (
	content: string,
	maxWidth = 80,
): string => {
	const tokens = marked.lexer(content);
	return renderTokensToTerminal(tokens, maxWidth);
};
