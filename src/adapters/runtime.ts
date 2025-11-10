import type * as Effect from "effect/Effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";

export const runToolEffect = <Tag, A, E = never>(
	runtime: ManagedRuntime.ManagedRuntime<Tag, never>,
	effect: Effect.Effect<A, E, Tag>,
): Promise<A> => runtime.runPromise(effect);
