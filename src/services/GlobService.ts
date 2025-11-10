import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export interface GlobOptions {
	readonly pattern: string;
	readonly cwd: string;
	readonly dot?: boolean;
	readonly absolute?: boolean;
	readonly onlyFiles?: boolean;
	readonly maxResults?: number;
}

export class GlobService extends Context.Tag("GlobService")<
	GlobService,
	{
		readonly scan: (
			options: GlobOptions,
		) => Effect.Effect<ReadonlyArray<string>, Error>;
	}
>() {}

const scan = ({
	pattern,
	cwd,
	dot = false,
	absolute = false,
	onlyFiles = true,
	maxResults = 1_000,
}: GlobOptions) =>
	Effect.promise(async () => {
		const glob = new Bun.Glob(pattern);
		const iterator = glob.scan({
			cwd,
			dot,
			absolute,
			onlyFiles,
			followSymlinks: false,
			throwErrorOnBrokenSymlink: false,
		});

		const matches: string[] = [];
		for await (const value of iterator) {
			matches.push(value as string);
			if (matches.length >= maxResults) {
				break;
			}
		}

		return matches as ReadonlyArray<string>;
	});

export const layer = Layer.succeed(GlobService, { scan });
