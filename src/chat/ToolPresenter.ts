import type { ToolSet, TypedToolCall, TypedToolResult } from "ai";
import {
	displayToolCall,
	displayToolResult,
} from "./ui/ToolResultPresenter.js";

export const presentToolCalls = (toolCalls: Array<TypedToolCall<ToolSet>>) => {
	for (const toolCall of toolCalls) {
		displayToolCall(
			toolCall.toolName,
			toolCall.input as Record<string, unknown>,
		);
	}
};

export const presentToolResults = (
	toolResults: Array<TypedToolResult<ToolSet>>,
) => {
	for (const toolResult of toolResults) {
		displayToolResult(
			toolResult.toolName,
			toolResult.output as Record<string, unknown>,
		);
	}
};
