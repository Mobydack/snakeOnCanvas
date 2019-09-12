interface ICanvas2dOpts {
	alpha?: boolean;
	canvas: HTMLCanvasElement;
	height?: number;
	width?: number;
}

interface ICanvas2d {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	hexToRgba(hex: number | string): number[];
}

export class Canvas2d implements ICanvas2d {
	private _canvas: HTMLCanvasElement = null;
	private _context: CanvasRenderingContext2D = null;
	private readonly defaultOpts: ICanvas2dOpts = {
		alpha: true,
		canvas: null,
		height: window.innerHeight,
		width: window.innerWidth,
	};

	constructor(opts: ICanvas2dOpts) {
		if (! opts.canvas) {
			throw new Error('cavnas is required field');
		}

		const { canvas, width, height, alpha } = {...this.defaultOpts, ...opts};

		this._canvas = canvas;

		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d', { alpha });
		this._context = ctx;
	}

	public setPixel(x: number, y: number, color: string | number) {
		const [r, g, b, a] = this.hexToRgba(color);
		const imageData = this.context.getImageData(x, y, 1, 1);

		imageData.data[0] = r;
		imageData.data[1] = g;
		imageData.data[2] = b;
		imageData.data[3] = a;

		this._context.putImageData(imageData, x, y);
	}

	public clear() {
		this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
	}

	public hexToRgba(hex: number | string): number[] {
		if (typeof hex === 'string') {
			return this.stringHexToRgba(hex);
		} else if (typeof hex === 'number') {
			return this.numberHexToRgba(hex);
		} else {
			throw new Error('Ivalid argument type');
		}
	}

	private stringHexToRgba(hex: string): number[] {
		const length = hex.length;

		if (
			! (/^[a-fA-F0-9]/.test(hex)) ||
			length < 3 ||
			length > 8 ||
			length === 5 ||
			length === 7
		) {
			throw new Error('Invalid hex length');
		}

		const rgba: number[] = [0, 0, 0, 255];

		if (length >= 3 && length < 5) {
			for (let i = 0; i < length; i++) {
				rgba[i] = parseInt(hex[i] + hex[i], 16);
			}
		} else {
			for (let i = 0; i < length; i += 2) {
				rgba[i] = parseInt(hex.substr(i, 2), 16);
			}
		}

		return rgba;
	}

	private numberHexToRgba(hex: number): number[] {
		if (hex > 0xffffffff)  {
			throw new Error('Invalid hex length');
		}

		const rgba: number[] = [0, 0, 0, 255];

		for (let i = 24, j = 0; i < 0; i -= 8, j++) {
			rgba[j] = hex >> j & 255;
		}

		return rgba;
	}

	get canvas() {
		return this._canvas;
	}

	get context() {
		return this._context;
	}
}
