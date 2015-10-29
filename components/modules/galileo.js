let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js');
	
class Galileo {
	constructor(args = {}) {
		this.t = 0;
		this.name = 'Galileo';
		this.begin = null;
		this.duration = utils.nvl(args.duration, 1);
		this.parent = args.parent;

		this.allegience = 'dark';

		this.mobile = args.mobile;

		this.visible = false;

		this.anchor = args.anchor;
		this.view = this.generateView();

		this.slides = [
			{
				text: "This question has puzzled scientists for centuries",
				format: "caps",
			},
			{
				big: {
					number: "80",
					high: "Your brain contains",
					medium: "billion",
					low: "neurons",
				},
			},
			{
				big: {
					number: "100",
					high: "Connected through",
					medium: "trillion",
					low: "synapses",
				},
			},
			{
				text: "Working together these cells make you, you.",
				format: "italics",
			},
			{
				text: "However, most of their circuits are still uncharted.",
				format: "italics",
			},
			{
				text: "When Galileo first peered through his telescope it began a revolution in the way we see the world around us.",
				format: "italics",
			},
			{
				text: "Today, neuroscience is revolutionizing how we see the world within us.",
				format: "italics",
			},
			{
				text: "We’re calling on gamers to help connect the dots by creating a physical, visual 3D map of the brain.",
				format: "italics",
			},
			{
				text: "What began at MIT has grown into a global community of hundreds of thousands.",
				format: "italics",
			}
		];

		this.duration = utils.nvl(args.duration, this.slides.length);

		this.view.story.container.hide();
		this.view.bignumber.container.hide();
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let bg = d('galileo bg-dark module');

		let action = d('action');

		let next = d('next').ion('click', function () {
			_this.next();
		});

		// Standard story container

		let textcontainer = d('story-text');
		let text = d('text');
		let counter = d('counter');

		textcontainer.append(text, counter);

		// Big number story

		let container2 = d('story-text-big'),
			innercontainer = d('inner'),
			bignumber = d('big-number'),
			hightext = d('high-text'),
			medtext = d('medium-text'),
			lowtext = d('low-text'),
			counter2 = d('counter');

		innercontainer.append(
			hightext, 
			medtext, 
			lowtext,
			counter2
		);

		container2.append(
			bignumber, 
			innercontainer
		);

		let canvas = $('<canvas>').addClass('neural-network');

		action.append(
			canvas,
			textcontainer,
			container2,
			next
		);

		bg.append(action);

		return {
			module: bg,
			transition: d('transition'),
			next: next,
			action: action,
			story: {
				container: textcontainer,
				text: text,
				counter: counter,
			},
			bignumber: {
				container: container2,
				number: bignumber,
				high: hightext,
				medium: medtext,
				low: lowtext,
				counter: counter2,
			},
			canvas: canvas,
		};
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

		let index = Math.floor(t * N);

		let slide = this.slides[index]
		slide.index = index;

		return slide;
	}

	enter (transition, frm) {
		if (this.visible) {
			return $.Deferred().resolve();
		}

		let _this = this;

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		_this.view.next.hide();

		let dropfn = function () {
			_this.view.next.drop({
				msec: 5050,
				easing: Easing.bounceFactory(0.5),
				side: 'bottom',
				displacement: 25,
			});

			_this.view.next.show();
		};

		if (frm === 'Amazing') {
			this.view.module.prepend(this.view.transition);

			transition.done(function () {
				_this.view.module.scrollTo(_this.view.action, {
					msec: 3000,
					easing: Easing.springFactory(0.9, 0),
				})
				.done(function () {
					dropfn();
				})
				.always(function () {
					_this.view.transition.detach();
				})
			});
		}
		else {
			dropfn();
		}

		return $.Deferred().resolve();
	}

	exit (transition, frm) {
		if (!this.visible) {
			return $.Deferred().resolve();
		}

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		return $.Deferred().resolve();
	}

	seek (t) {
		let t_prev = this.t;
		this.t = t;
		this.parent.sub_t_update(this.name, t);
		return this.render(t_prev, t);
	}

	render (t_prev, t) {
		let _this = this; 

		let slide = this.slideAt(t);

		_this.view.story.container.hide();
		_this.view.bignumber.container.hide();

		if (slide.text) {
			_this.view.story.container.show();

			_this.view.story.text
				.text(slide.text)
				.removeClass('caps italics')
				.addClass(slide.format);

			_this.view.story.counter.text(`${slide.index + 1}/${this.slides.length}`);

		}
		else if (slide.big) {
			_this.view.bignumber.container.show();

			_this.view.bignumber.number.text(slide.big.number).removeClass('hundred');

			if (slide.big.number.length > 2) {
				_this.view.bignumber.number.addClass('hundred');
			}

			_this.view.bignumber.high.text(slide.big.high);
			_this.view.bignumber.medium.text(slide.big.medium);
			_this.view.bignumber.low.text(slide.big.low);

			_this.view.bignumber.counter.text(`${slide.index + 1}/${this.slides.length}`);
		}
		else {
			throw new Error("slide did not specify text or big.");
		}

	}

}


module.exports = Galileo;



