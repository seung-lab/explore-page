let $ = require('jquery'),
	utils = require('../clientjs/utils.js'),
	Synapse =require('./synapse.js');
	
class TeaTime extends Synapse {
	constructor(args = {}) {
		super(args);

		this.t = 0;
		this.begin = null;
		this.parent = args.parent;

		this.allegience = 'light';
		this.duration = 1;

		this.slides = [];
	}

	seek (t) {
		let t_prev = this.t;
		this.t = t;
		this.parent.sub_t_update(this.name, t);
		return this.render(t_prev, t);
	}

	storyPoints () {
		let counter = -1,
			N = this.slides.length;

		return this.slides.map(function () {
			counter++;
			return counter / N;
		});
	}

	next () {
		let N = this.slides.length;

		if (this.last() - this.t < 0.0001) {
			this.parent.moduleComplete();
			return;
		}

		let slide = this.slideAt(this.t);
		let index = utils.clamp(slide.index + 1, 0, this.slides.length - 1);

		this.seek(index / this.slides.length);
	}

	previous () {
		if (this.t === 0) {
			this.parent.moduleUncomplete();
			return;
		}

		let slide = this.slideAt(this.t);
		let index = utils.clamp(slide.index - 1, 0, this.slides.length - 1);

		this.seek(index / this.slides.length);
	}

	last () {
		let N = this.slides.length;
		return (N - 1) / N;
	}

	slideAt (t) {
		let N = this.slides.length;

		let index = Math.floor(utils.round(t * N, 5));

		let slide = this.slides[index]
		slide.index = index;

		return slide;
	}
}


module.exports = TeaTime;



