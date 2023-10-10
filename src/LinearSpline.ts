class LinearSpline {
	private readonly _xs: number[];
	private readonly _ys: number[];

	public constructor(xs: number[], ys: number[]) {
		this._xs = xs;
		this._ys = ys;
	}

	public at(x: number) {
		// TODO maybe binarySearch ?
		const moreEqualXIndex = this._xs.findIndex((xx: number) => xx >= x);
		if (moreEqualXIndex === -1) {
			return 0;
		}
		if (this._xs[moreEqualXIndex] === x) {
			return this._ys[moreEqualXIndex];
		}

		const beforeXIndex = moreEqualXIndex - 1;
		if (beforeXIndex < 0) {
			return 0;
		}

		const prevPoint = { x: this._xs[beforeXIndex], y: this._ys[beforeXIndex] };
		const nextPoint = { x: this._xs[moreEqualXIndex], y: this._ys[moreEqualXIndex] };
		const a = (nextPoint.y - prevPoint.y) / ((nextPoint.x - prevPoint.x) || 1);
		const b = prevPoint.y;
		const newY = a * (x - prevPoint.x) + b;

		return newY;
	}
}

export function linearSpline(x: number[], y: number[], newX: number[]): number[] {
	const spline = new LinearSpline(x, y);
	return newX.map((xv: number) => {
		return spline.at(xv);
	});
}
