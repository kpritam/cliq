import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class CryptoHasher extends Context.Tag("CryptoHasher")<
	CryptoHasher,
	{
		readonly sha256: (input: string) => Effect.Effect<string>;
	}
>() {}

const sha256 = (input: string) =>
	Effect.sync(() => {
		const hasher = new Bun.CryptoHasher("sha256");
		hasher.update(input);
		return hasher.digest("hex");
	});

export const layer = Layer.succeed(CryptoHasher, {
	sha256,
});
