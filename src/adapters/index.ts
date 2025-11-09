import type * as ManagedRuntime from "effect/ManagedRuntime";
import type { DirectoryTools } from "../tools/DirectoryTools.js";
import type { EditTools } from "../tools/EditTools.js";
import type { FileTools } from "../tools/FileTools.js";
import type { SearchTools } from "../tools/SearchTools.js";
import { makeDirectoryToolsForVercel } from "./DirectoryToolAdapters.js";
import { makeEditToolsForVercel } from "./EditToolAdapters.js";
import { makeFileToolsForVercel } from "./FileToolAdapters.js";
import { makeSearchToolsForVercel } from "./SearchToolAdapters.js";

export const makeAllTools = (
	fileRuntime: ManagedRuntime.ManagedRuntime<FileTools, never>,
	searchRuntime: ManagedRuntime.ManagedRuntime<SearchTools, never>,
	editRuntime: ManagedRuntime.ManagedRuntime<EditTools, never>,
	dirRuntime: ManagedRuntime.ManagedRuntime<DirectoryTools, never>,
) => ({
	...makeFileToolsForVercel(fileRuntime),
	...makeSearchToolsForVercel(searchRuntime),
	...makeEditToolsForVercel(editRuntime),
	...makeDirectoryToolsForVercel(dirRuntime),
});
