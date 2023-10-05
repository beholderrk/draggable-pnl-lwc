/**
 * Color calculations and conversions.
 *
 * Additional credits go to:
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * @link   http://www.phpied.com/rgb-color-parser-in-javascript/
 *
 * @author Alexander Kachanov
 * @author Eugene Korobko
 */

/**
 * Red component of the RGB color value
 * The valid values are integers in range [0, 255]
 */
export type RedComponent = number;

/**
 * Green component of the RGB color value
 * The valid values are integers in range [0, 255]
 */
export type GreenComponent = number;

/**
 * Blue component of the RGB color value
 * The valid values are integers in range [0, 255]
 */
export type BlueComponent = number;

/**
 * Alpha component of the RGBA color value
 * The valid values are integers in range [0, 1]
 */
export type AlphaComponent = number;

export type Rgb = [RedComponent, GreenComponent, BlueComponent];
export type Rgba = [RedComponent, GreenComponent, BlueComponent, AlphaComponent];

/**
 * Hue of the color represented in HSL color model
 * The valid values are reals in range [0, 1]
 */
export type Hue = number;

/**
 * Saturation of the color represented in HSL color model
 * The valid values are reals in range [0, 1]
 */
export type HslSaturation = number;

/**
 * Saturation of the color represented in HSV color model
 * The valid values are reals in range [0, 1]
 */
export type HsvSaturation = number;

/**
 * Lightness of the color represented in HSL color model
 * The valid values are reals in range [0, 1]
 */
export type Lightness = number;

/**
 * Value of the color represented in HSV color model
 * The valid values are reals in range [0, 1]
 */
export type Value = number;

export type Hsl = [Hue, HslSaturation, Lightness];
export type Hsv = [Hue, HsvSaturation, Value];

function normalizeInteger(min: number, n: number, max: number): number {
	return (
		isNaN(n) ? min :
			n < min ? min :
			n > max ? max :
			Math.round(n)
	);
}

function normalizeNumber(min: number, n: number, max: number): number {
	return (
		isNaN(n) ? min :
			n < min ? min :
			n > max ? max :
			// limit the precision of all numbers to at most 4 digits in fractional part
			Math.round(n * 10000) / 10000
	);
}

export function normalizeRedComponent(red: number): RedComponent {
	return normalizeInteger(0, red, 255) as RedComponent;
}

export function normalizeGreenComponent(green: number): GreenComponent {
	return normalizeInteger(0, green, 255) as GreenComponent;
}

export function normalizeBlueComponent(blue: number): BlueComponent {
	return normalizeInteger(0, blue, 255) as BlueComponent;
}

export function normalizeAlphaComponent(alpha: number): AlphaComponent {
	return normalizeNumber(0, alpha, 1) as AlphaComponent;
}

export function rgb(red: number, green: number, blue: number): Rgb {
	return [
		normalizeRedComponent(red),
		normalizeGreenComponent(green),
		normalizeBlueComponent(blue),
	];
}

export function areEqualRgb(rgb1: Rgb, rgb2: Rgb): boolean {
	return rgb1[0] === rgb2[0] &&
		rgb1[1] === rgb2[1] &&
		rgb1[2] === rgb2[2];
}

export function rgba(red: number, green: number, blue: number, alpha: number): Rgba;
export function rgba(rgb: Rgb, alpha: number): Rgba;
export function rgba(redOrRgb: number | Rgb, greenOrAlpha: number, blue?: number, alpha?: number): Rgba {
	if (Array.isArray(redOrRgb)) {
		// rgba(rgb: Rgb, alpha: number)
		const rgb = redOrRgb;
		alpha = greenOrAlpha;

		return [
			rgb[0],
			rgb[1],
			rgb[2],
			normalizeAlphaComponent(alpha),
		];
	} else {
		// rgba(red: number, green: number, blue: number, alpha: number)
		const red = redOrRgb;
		const green = greenOrAlpha;
		blue = blue || 0;
		alpha = alpha || 0;

		return [
			normalizeRedComponent(red),
			normalizeGreenComponent(green),
			normalizeBlueComponent(blue),
			normalizeAlphaComponent(alpha),
		];
	}
}

export function areEqualRgba(rgba1: Rgba, rgba2: Rgba): boolean {
	return rgba1[0] === rgba2[0] &&
		rgba1[1] === rgba2[1] &&
		rgba1[2] === rgba2[2] &&
		rgba1[3] === rgba2[3];
}

export function normalizeHue(hue: number): Hue {
	return normalizeNumber(0, hue, 1) as Hue;
}

export function normalizeHslSaturation(hslSaturation: number): HslSaturation {
	return normalizeNumber(0, hslSaturation, 1) as HslSaturation;
}

export function normalizeHsvSaturation(hsvSaturation: number): HsvSaturation {
	return normalizeNumber(0, hsvSaturation, 1) as HsvSaturation;
}

export function normalizeLightness(lightness: number): Lightness {
	return normalizeNumber(0, lightness, 1) as Lightness;
}

export function normalizeValue(value: number): Value {
	return normalizeNumber(0, value, 1) as Value;
}

export function hsl(hue: number, saturation: number, lightness: number): Hsl {
	return [
		normalizeHue(hue),
		normalizeHslSaturation(saturation),
		normalizeLightness(lightness),
	];
}

export function areEqualHsl(hsl1: Hsl, hsl2: Hsl): boolean {
	return hsl1[0] === hsl2[0] &&
		hsl1[1] === hsl2[1] &&
		hsl1[2] === hsl2[2];
}

export function hsv(hue: number, saturation: number, value: number): Hsv {
	return [
		normalizeHue(hue),
		normalizeHsvSaturation(saturation),
		normalizeValue(value),
	];
}

export function areEqualHsv(hsv1: Hsv, hsv2: Hsv): boolean {
	return hsv1[0] === hsv2[0] &&
		hsv1[1] === hsv2[1] &&
		hsv1[2] === hsv2[2];
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param  rgb The RGB representation
 * @return     The HSL representation
 */
export function rgbToHsl(rgb: Rgb): Hsl {
	const [r, g, b] = rgb;

	// normalize RGB values to [0, 1]
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;

	const min = Math.min(rn, gn, bn);
	const max = Math.max(rn, gn, bn);

	let h = 0 as Hue;
	let s = 0 as HslSaturation;
	const l = (min + max) / 2 as Lightness;

	if (min === max) {
		// achromatic
		h = 0 as Hue;
		s = 0 as HslSaturation;
	} else {
		const d = max - min;
		s = (l > 0.5 ? d / (2 - max - min) : d / (max + min)) as HslSaturation;
		switch (max) {
			case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6 as Hue; break;
			case gn: h = ((bn - rn) / d + 2) / 6 as Hue; break;
			case bn: h = ((rn - gn) / d + 4) / 6 as Hue; break;
		}
	}

	return [h, s, l];
}

function hue2Rgb(p: number, q: number, t: number): number {
	if (t < 0) {
		t += 1;
	}

	if (t > 1) {
		t -= 1;
	}

	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}

	if (t < 1 / 2) {
		return q;
	}

	if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}

	return p;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param  hsl The HSL representation
 * @return     The RGB representation
 */
export function hslToRgb(hsl: Hsl): Rgb {
	const [h, s, l] = hsl;

	// normalized RGB values in range [0, 1]
	let rn: number;
	let gn: number;
	let bn: number;

	if (s === 0) {
		// achromatic
		rn = gn = bn = l;
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		rn = hue2Rgb(p, q, h + 1 / 3);
		gn = hue2Rgb(p, q, h);
		bn = hue2Rgb(p, q, h - 1 / 3);
	}

	return [
		normalizeRedComponent  (rn * 255),
		normalizeGreenComponent(gn * 255),
		normalizeBlueComponent (bn * 255),
	];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param  rgb The RGB representation
 * @return     The HSV representation
 */
export function rgbToHsv(rgb: Rgb): Hsv {
	const [r, g, b] = rgb;

	// normalize RGB values to [0, 1]
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;

	const min = Math.min(rn, gn, bn);
	const max = Math.max(rn, gn, bn);

	const d = max - min;

	let h = 0 as Hue;
	const s = (max === 0 ? 0 : d / max) as HsvSaturation;
	const v = max as Value;

	if (max === min) {
		h = 0 as Hue; // achromatic
	} else {
		switch (max) {
			case r: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6 as Hue; break;
			case g: h = ((bn - rn) / d + 2) / 6 as Hue; break;
			case b: h = ((rn - gn) / d + 4) / 6 as Hue; break;
		}
	}

	return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param  hsv The HSV representation
 * @return     The RGB representation
 */
export function hsvToRgb(hsv: Hsv): Rgb {
	const [h, s, v] = hsv;

	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);

	// normalized RGB values in range [0, 1]
	let rn = 0;
	let gn = 0;
	let bn = 0;

	switch (i % 6) {
		case 0: rn = v; gn = t; bn = p; break;
		case 1: rn = q; gn = v; bn = p; break;
		case 2: rn = p; gn = v; bn = t; break;
		case 3: rn = p; gn = q; bn = v; break;
		case 4: rn = t; gn = p; bn = v; break;
		case 5: rn = v; gn = p; bn = q; break;
	}

	return [
		normalizeRedComponent  (rn * 255),
		normalizeGreenComponent(gn * 255),
		normalizeBlueComponent (bn * 255),
	];
}

const rgbGrayscaleWeights = [0.199, 0.687, 0.114];
export function rgbToGrayscale(rgb: Rgb): number {
	return rgbGrayscaleWeights[0] * rgb[0] +
		rgbGrayscaleWeights[1] * rgb[1] +
		rgbGrayscaleWeights[2] * rgb[2];
}

/**
 * Calculates distance between two colors in the RGB color space
 */
export function distanceRgb(rgb1: Rgb, rgb2: Rgb): number {
	const [r1, g1, b1] = rgb1;
	const [r2, g2, b2] = rgb2;

	const dr = r2 - r1;
	const dg = g2 - g1;
	const db = b2 - b1;

	return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function invertRgb(rgb: Rgb): Rgb {
	const [r, g, b] = rgb;
	return [
		255 - r as RedComponent,
		255 - g as GreenComponent,
		255 - b as BlueComponent,
	];
}

export function darkenRgb(rgb: Rgb, percent: number): Rgb {
	const hsl = rgbToHsl(rgb);
	return hslToRgb([hsl[0], hsl[1], normalizeLightness(hsl[2] - percent / 100)]);
}

export function blendRgba(color1: Rgba, color2: Rgba): Rgba {
	const [r1, g1, b1, a1] = color1;
	const [r2, g2, b2, a2] = color2;

	const a = normalizeAlphaComponent(1 - (1 - a2) * (1 - a1));
	const r = normalizeRedComponent((r2 * a2 / a) + (r1 * a1 * (1 - a2) / a));
	const g = normalizeGreenComponent((g2 * a2 / a) + (g1 * a1 * (1 - a2) / a));
	const b = normalizeBlueComponent((b2 * a2 / a) + (b1 * a1 * (1 - a2) / a));

	return [r, g, b, a];
}

export function shiftRgb(color: Rgb, offset: number, shift: number = 0.05): Rgb {
	const hsl = rgbToHsl(color);
	const h = hsl[0] + offset * shift;
	hsl[0] = normalizeHue(h - Math.floor(h));
	return hslToRgb(hsl);
}

export function shiftRgba(color: Rgba, offset: number, shift: number = 0.05): Rgba {
	const [r, g, b, a] = color;
	const [newR, newG, newB] = shiftRgb([r, g, b], offset, shift);
	return [newR, newG, newB, a];
}

export function shiftColor(color: string, offset: number, shift: number = 0.05): string {
	const rgba = parseRgba(color);
	return rgbaToString(shiftRgba(rgba, offset, shift));
}

// ------------------------- RGB tuple representation --------------------------
namespace RgbRepresentation {
	/**
	 * @example
	 * rgb(123, 234, 45)
	 * @example
	 * rgb(255,234,245)
	 */
	export const re = /^rgb\(\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*\)$/;
	export function parse(matches: RegExpExecArray): Rgb {
		return [
			normalizeRedComponent  (parseInt(matches[1], 10)),
			normalizeGreenComponent(parseInt(matches[2], 10)),
			normalizeBlueComponent (parseInt(matches[3], 10)),
		];
	}
}

function tryParseRgbString(rgbString: string): Rgb | null {
	const matches = RgbRepresentation.re.exec(rgbString);
	return matches !== null ? RgbRepresentation.parse(matches) : null;
}

export function rgbToString(rgb: Rgb): string {
	const [red, green, blue] = rgb;
	return `rgb(${red}, ${green}, ${blue})`;
}

// -------------------------- RGB Hex representation ---------------------------
namespace RgbHexRepresentation {
	/**
	 * @example
	 * #00ff00
	 * @example
	 * #336699
	 */
	export const re = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
	export function parse(matches: RegExpExecArray): Rgb {
		return [
			normalizeRedComponent  (parseInt(matches[1], 16)),
			normalizeGreenComponent(parseInt(matches[2], 16)),
			normalizeBlueComponent (parseInt(matches[3], 16)),
		];
	}
}

function tryParseRgbHexString(rgbHexString: string): Rgb | null {
	const matches = RgbHexRepresentation.re.exec(rgbHexString);
	return matches !== null ? RgbHexRepresentation.parse(matches) : null;
}

export function rgbToHexString(rgb: Rgb): string {
	const [red, green, blue] = rgb;

	const r = red.toString(16);
	const g = green.toString(16);
	const b = blue.toString(16);

	return '#' +
		(r.length === 1 ? '0' : '') + r +
		(g.length === 1 ? '0' : '') + g +
		(b.length === 1 ? '0' : '') + b;
}

// ----------------------- RGB Short Hex representation ------------------------
namespace RgbShortHexRepresentation {
	/**
	 * @example
	 * #fb0
	 * @example
	 * #f0f
	 */
	export const re = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
	export function parse(matches: RegExpExecArray): Rgb {
		return [
			normalizeRedComponent  (parseInt(matches[1] + matches[1], 16)),
			normalizeGreenComponent(parseInt(matches[2] + matches[2], 16)),
			normalizeBlueComponent (parseInt(matches[3] + matches[3], 16)),
		];
	}
}

function tryParseRgbShortHexString(rgbShortHexString: string): Rgb | null {
	const matches = RgbShortHexRepresentation.re.exec(rgbShortHexString);
	return matches !== null ? RgbShortHexRepresentation.parse(matches) : null;
}

// ------------------------- RGBA tuple representation -------------------------
namespace RgbaRepresentation {
	/**
	 * @example
	 * rgba(123, 234, 45, 1)
	 * @example
	 * rgba(255,234,245,0.1)
	 */
	export const re = /^rgba\(\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?[\d]{0,10}(?:\.\d+)?)\s*\)$/;
	export function parse(matches: RegExpExecArray): Rgba {
		return [
			normalizeRedComponent  (parseInt(matches[1], 10)),
			normalizeGreenComponent(parseInt(matches[2], 10)),
			normalizeBlueComponent (parseInt(matches[3], 10)),
			normalizeAlphaComponent(parseFloat(matches[4])),
		];
	}
}

function tryParseRgbaString(rgbaString: string): Rgba | null {
	const matches = RgbaRepresentation.re.exec(rgbaString);
	return matches !== null ? RgbaRepresentation.parse(matches) : null;
}

export function rgbaToString(rgba: Rgba): string {
	const [red, green, blue, alpha] = rgba;
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

// -----------------------------------------------------------------------------
export function rgbToBlackWhiteString(rgb: Rgb, threshold: number): 'black' | 'white' {
	if (threshold < 0 || threshold > 255) {
		throw new Error('invalid threshold value, valid values are [0, 255]');
	}

	return rgbToGrayscale(rgb) >= threshold ? 'white' : 'black';
}

export function tryParseRgb(colorString: string): Rgb | null {
	colorString = colorString.toLowerCase();

	const rgbParseResult = tryParseRgbString(colorString);
	if (rgbParseResult !== null) {
		return rgbParseResult;
	}

	const rgbHexParseResult = tryParseRgbHexString(colorString);
	if (rgbHexParseResult !== null) {
		return rgbHexParseResult;
	}

	const rgbShortHexParseResult = tryParseRgbShortHexString(colorString);
	if (rgbShortHexParseResult !== null) {
		return rgbShortHexParseResult;
	}

	const rgbaParseResult = tryParseRgbaString(colorString);
	if (rgbaParseResult !== null) {
		const [r, g, b] = rgbaParseResult;
		return [r, g, b];
	}

	return null;
}

export function parseRgb(colorString: string): Rgb {
	const parseResult = tryParseRgb(colorString);

	if (parseResult !== null) {
		return parseResult;
	} else {
		throw new Error('Passed color string does not match any of the known color representations');
	}
}

export function tryParseRgba(colorString: string): Rgba | null {
	colorString = colorString.toLowerCase();

	const rgbParseResult = tryParseRgbString(colorString);
	if (rgbParseResult !== null) {
		const [r, g, b] = rgbParseResult;
		return [r, g, b, 1 as AlphaComponent];
	}

	const rgbHexParseResult = tryParseRgbHexString(colorString);
	if (rgbHexParseResult !== null) {
		const [r, g, b] = rgbHexParseResult;
		return [r, g, b, 1 as AlphaComponent];
	}

	const rgbShortHexParseResult = tryParseRgbShortHexString(colorString);
	if (rgbShortHexParseResult !== null) {
		const [r, g, b] = rgbShortHexParseResult;
		return [r, g, b, 1 as AlphaComponent];
	}

	const rgbaParseResult = tryParseRgbaString(colorString);
	if (rgbaParseResult !== null) {
		return rgbaParseResult;
	}

	return null;
}

export function parseRgba(colorString: string): Rgba {
	const parseResult = tryParseRgba(colorString);

	if (parseResult !== null) {
		return parseResult;
	} else {
		throw new Error('Passed color string does not match any of the known color representations');
	}
}
