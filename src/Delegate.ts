// eslint-disable-next-line @typescript-eslint/ban-types
interface Listener<TFunc extends Function> {
	object: object | null;
	member: TFunc;
	singleShot: boolean;
	skip: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function isNotSingleShot<TFunc extends Function>(listener: Listener<TFunc>): boolean {
	return !listener.singleShot;
}

// NOTE: due to current absence of types for variadic functions (see https://github.com/Microsoft/TypeScript/issues/5453)
// we cannot declare function type as (...args: ...TParams) => void
// so we use the generic type for the whole function, not only the parameters tuple
// eslint-disable-next-line @typescript-eslint/ban-types
export class Delegate<TFunc extends Function> {
	public readonly fire = this._fireImpl.bind(this) as unknown as TFunc;

	private _listeners: Listener<TFunc>[] = [];

	public subscribe(obj: object | null, member: TFunc, singleShot?: boolean): void {
		this._listeners.push({ object: obj, member: member, singleShot: !!singleShot, skip: false });
	}

	public unsubscribe(obj: object | null, member: TFunc): void {
		for (let i = 0; i < this._listeners.length; ++i) {
			const listener = this._listeners[i];
			if (listener.object === obj && listener.member === member) {
				// we should skip this listener in the method fire if it's in progress right now
				listener.skip = true;
				this._listeners.splice(i, 1);
				break;
			}
		}
	}

	public unsubscribeAll(obj: object | null): void {
		for (let i = this._listeners.length - 1; i >= 0; --i) {
			const listener = this._listeners[i];
			if (listener.object === obj) {
				// we should skip this listener in the method fire if it's in progress right now
				listener.skip = true;
				this._listeners.splice(i, 1);
			}
		}
	}

	public destroy(): void {
		this._listeners = [];
	}

	private _fireImpl(...args: unknown[]): void {
		const oldListeners = this._listeners;
		// remove all single-shots
		this._listeners = this._listeners.filter(isNotSingleShot);

		const length = oldListeners.length;
		for (let i = 0; i < length; ++i) {
			const listener = oldListeners[i];
			if (listener.skip) {
				// if unsubscribe/unsubscribeAll was called inside this cycle for this listener
				// (inside some of the previous listeners callbacks) then this listener is marked as "to be skipped"
				continue;
			}

			try {
				listener.member.apply(listener.object || null, args);
			} catch (e: unknown) {
        // log here
			}
		}
	}
}
