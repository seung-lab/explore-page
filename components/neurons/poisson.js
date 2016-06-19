// Poisson Disc Distribtion
// Alex Norton :: 2016

// Based on Jason Davies’ implementation of Bridson’s algorithm
// Based on Mike Bostock’s implementation of Davies’s algorithm

// Recursive Neuron (P5js)

class Poisson {
	constructor(args = {}) {    
		this.radius = args.radius 	|| 25;  // Space between samples
		this.height = args.height 	|| 0;
		this.width = args.width 	|| 0;
		this.rate = args.rate 		|| 10;
		this.k = args.k 			|| 30;  // maximum number of samples before rejection
		this.p = args.p 			|| {};  //P5 global

		this.sampler = this.poissonSampler(this.width, this.height, this.radius); // Initialize the PDD
		
		let _this = this;
	}

	// Based on https://www.jasondavies.com/poisson-disc/
	poissonSampler(width, height, radius) {
		let _this = this;

		let radius2 = radius * radius,
			R = 3 * radius2,

			cellSize = radius * Math.SQRT1_2,
			gridWidth = Math.ceil(width / cellSize),
			gridHeight = Math.ceil(height / cellSize),
			grid = new Array(gridWidth * gridHeight),

			queue = [],
			queueSize = 0,
			sampleSize = 0,
			center_dist = 0,

			center = {
				x: width / 2,
				y: height / 2,
			};

		return function() {
		
			if (!sampleSize) {
				return makeSample(width / 2, height / 2); // Grow from center | Set first sample
			} 

			while (queueSize) { // Pick a random existing sample and remove it from the queue.
				let i = Math.random() * queueSize | 0,
				s = queue[i];

				// Make a new candidate between [radius, 2 * radius] from the existing sample.
				for (let j = 0; j < _this.k; ++j) {
					let a = 2 * Math.PI * Math.random(),
					r = Math.sqrt(Math.random() * R + radius2),
					x = s[0] + r * Math.cos(a),
					y = s[1] + r * Math.sin(a);

					// Reject candidates that are outside the allowed extent,
					// or closer than 2 * radius to any existing sample.
					if (0 <= x && x < width && 0 <= y && y < height && far(x, y)){ 
						return makeSample(x, y);
					}
				}

				queue[i] = queue[--queueSize];
				queue.length = queueSize;
			}

			function far(x, y) {
				let i = x / cellSize | 0,
					j = y / cellSize | 0,
					i0 = Math.max(i - 2, 0),
					j0 = Math.max(j - 2, 0),
					i1 = Math.min(i + 3, gridWidth),
					j1 = Math.min(j + 3, gridHeight);

				let s;

				for (j = j0; j < j1; ++j) {
					let o = j * gridWidth;
					for (i = i0; i < i1; ++i) {
						if (s = grid[o + i]) {
							let dx = s[0] - x,
								dy = s[1] - y;
							if (dx * dx + dy * dy < radius2) {
								return false;
							}
						}
					}
				}

				return true;
			}

			function makeSample(x, y) {
				let _this = this;
				let s = [x, y];

				queue.push(s);
				grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;

				++sampleSize;
				++queueSize;

				return s;
			}
		}
	}

	construct() { // Call once construct entire PDD
		let _this = this;

		let sample = _this.sampler(),
			samples = [];

		while (sample) { // When done, 's' returns <undefined>
			sample = _this.sampler(); 
			if (!sample) {
				break;
			}
			samples.push(
				_this.p.createVector(sample[0], sample[1])
			);
		}

		return samples;
	}
}

module.exports = Poisson;