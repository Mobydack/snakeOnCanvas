import { throttle } from 'lodash';
import { Canvas2d } from './lib/canvas2d';

const canvas: HTMLCanvasElement = document.querySelector('#app');

const c = new Canvas2d({
	alpha: false,
	canvas,
	height: 400,
	width: 400,
});

type TCb = (value: number) => void;

interface ISnake {
	gameField: number[][];
	move(cb: TCb): void;
}

interface ISnaleOpts {
	width: number;
	height: number;
	start?: [number, number];
}

class Snake implements ISnake {
	public direction: number = 0;
	public readonly RIGHT: number  = 0;
	public readonly LEFT: number = 1;
	public readonly UP: number = 2;
	public readonly DOWN: number = 3;
	public count = 3;
	private _gameField: number[][] = [];
	private head: [number, number] = [2, 0];
	private tail: [number, number] = [0, 0];
	private width: number = 0;
	private height: number = 0;

	constructor({ width, height }: ISnaleOpts) {
		if (width < 4 && height < 4) {
			throw new Error('Invalid size');
		}

		this.width = width;
		this.height = height;

		for (let i = 0; i < height; i++) {
			const line = (new Array(width)).fill(0);
			this._gameField.push(line);
		}

		this._gameField[0][0] = 3;
		this._gameField[0][1] = 2;
		this._gameField[0][2] = 1;

	}

	public move(cb: TCb) {
		const { width, height } = this;

		const { direction, RIGHT, LEFT, UP, DOWN } = this;
		let [x, y] = this.head;

		if (direction === RIGHT) {
			x += 1;
		} else if (direction === LEFT) {
			x -= 1;
		} else if (direction === UP) {
			y -= 1;
		} else if (direction === DOWN) {
			y  += 1;
		}

		x = x % width;
		y = y % width;

		if (x < 0) {
			x = width - 1;
		}

		if (y < 0) {
			y = height - 1;
		}

		if (this._gameField[y][x] > 0) {
			return false;
		}

		if (this._gameField[y][x] < 0) {
			cb(this._gameField[y][x]);
		}

		this.head = [x, y];
		const [xTail, yTail] = this.tail;

		this._gameField[yTail][xTail] = 0;

		for (let i = 0; i < height; i ++) {
			for (let j  = 0; j < width; j++) {
				let value = this._gameField[i][j];

				if (value > 0) {
					value += 1;
				}

				if (value === this.count) {
					this.tail = [j, i];
				}

				this._gameField[i][j] = value;
			}
		}

		this._gameField[y][x] = 1;

		return true;
	}

	public createObject(value: number) {
		const width = this.width - 1;
		const height = this.height - 1;
		let x: number = Math.round(Math.random() * width);
		let y: number = Math.round(Math.random() * height);

		if (this._gameField[y][x] > 0) {
			do {
				x = Math.round(Math.random() * width);
				y = Math.round(Math.random() * height);
			} while (this._gameField[y][x] > 0);
		}

		this._gameField[y][x]  = value;
	}

	get gameField() {
		return this._gameField;
	}
}

const size = 10;

const programSnake = new Snake({
	height: size,
	width: size,
});

const sizeBox = {
	height: c.canvas.height / size,
	width: c.canvas.width / size,
};

let refInterval: number = null;
let isEatCreated = false;
const render = () => {
	c.context.fillStyle = 'black';
	c.context.fillRect(0, 0, c.canvas.width, c.canvas.height);

	const arr = programSnake.gameField;

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (arr[i][j] > 0) {
				c.context.fillStyle = 'red';
			} else if (arr[i][j] === -1) {
				c.context.fillStyle = 'blue';
			}

			if (arr[i][j] !== 0) {
				c.context.fillRect(
					sizeBox.width * j,
					sizeBox.height * i,
					sizeBox.height,
					sizeBox.width,
				);
			}
		}
	}

	const resultMove = programSnake.move((type: number) => {
		programSnake.count += 1;
		isEatCreated = false;
	});

	if (! resultMove && refInterval) {
		clearInterval(refInterval);
	}

	if (! isEatCreated) {
		programSnake.createObject(-1);
		isEatCreated = true;
	}
};

refInterval = window.setInterval(throttle(render, 200), 0);

window.addEventListener('keydown', (e) => {
	const { LEFT, RIGHT, UP, DOWN, direction } = programSnake;
	switch (e.key) {
		case 'ArrowLeft': {
			if (direction !== RIGHT) {
				programSnake.direction = LEFT;
			}
			break;
		}
		case 'ArrowRight': {
			if (direction !== LEFT) {
				programSnake.direction = RIGHT;
			}
			break;
		}
		case 'ArrowUp': {
			if (direction !== DOWN) {
				programSnake.direction = UP;
			}
			break;
		}
		case 'ArrowDown': {
			if (direction !== UP) {
				programSnake.direction = DOWN;
			}
			break;
		}
	}
});
