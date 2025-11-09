import * as Schema from "effect/Schema";

export const SessionId = Schema.String.pipe(Schema.brand("SessionId"));
export type SessionId = Schema.Schema.Type<typeof SessionId>;

export const MessageId = Schema.String.pipe(Schema.brand("MessageId"));
export type MessageId = Schema.Schema.Type<typeof MessageId>;

export const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"));
export type ProjectId = Schema.Schema.Type<typeof ProjectId>;

export const FilePath = Schema.String.pipe(Schema.brand("FilePath"));
export type FilePath = Schema.Schema.Type<typeof FilePath>;

export const Namespace = Schema.String.pipe(Schema.brand("Namespace"));
export type Namespace = Schema.Schema.Type<typeof Namespace>;

export const ConfigKey = Schema.String.pipe(Schema.brand("ConfigKey"));
export type ConfigKey = Schema.Schema.Type<typeof ConfigKey>;
