export interface Session {
	readonly id: string;
	readonly projectID: string;
	readonly directory: string;
	readonly title: string;
	readonly version: string;
	readonly time: {
		readonly created: number;
		readonly updated: number;
	};
}

export interface StoredMessage {
	readonly id: string;
	readonly sessionID: string;
	readonly role: "user" | "assistant" | "system";
	readonly content: string;
	readonly time: {
		readonly created: number;
	};
}
