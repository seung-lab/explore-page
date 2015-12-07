let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js'),
	TeaTime = require('../teatime.js'),
	GLOBAL =require('../../clientjs/GLOBAL.js'),
	NNNSketch = require('../neurons/sketch.js');
	
class Galileo extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Galileo';
		this.allegience = 'dark';
		this.view = this.generateView();

		this.slides = [
			{
				text: "This question has puzzled scientists for centuries",
				format: "caps",
			},
			{
				big: {
					number: 80,
					high: "Your brain contains",
					medium: "billion",
					low: "neurons",
				},
			},
			{
				big: {
					number: 100,
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
		this.view.bignumber.container.addClass('invisible');

		this.animations = {
			text: $.Deferred().resolve(),
			count: $.Deferred().resolve(),
		};

		this.sketch = null; // p5 sketch for neurons
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let bg = d('galileo bg-dark module');

		if (_this.mobile) {
			bg.ion('click', function () {
				_this.next();
			});
		}

		let action = d('action');

		let next = d('next')
			.append(d('arrow'))
			.ion('click', function () {
				_this.next();
			});

		// Standard story container

		let textcontainer = d('story-text');
		let text = d('text');
		let counter = d('counter');

		textcontainer.append(text);  // --> Trying no Counter

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
			lowtext
		);

		container2.append(
			bignumber, 
			innercontainer
		);

		action.append(
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
			canvas: null,
		};
	}

	afterEnter (transition, frm) {
		let _this = this;
		
		_this.view.next.hide();

		let dropfn = function () {
			_this.view.next.drop({
				msec: 1500,
				easing: Easing.bounceFactory(11),
				side: 'bottom',
				displacement: 25,
			});

			_this.view.next.show();
		};

		if (frm === 'Amazing') {
			this.view.module.prepend(this.view.transition);

			let sigmoid = Easing.sigmoidFactory(12, -0.5);

			transition.done(function () {
				_this.view.module.scrollTo(_this.view.action, {
					msec: 1000,
					easing: function (t) {
						return 2 * sigmoid(t) - 1; // finish what was started in modulecoordinator.moduleComplete
					},
				})
				.done(function () {
					dropfn();
				})
				.always(function () {
					_this.view.transition.detach();
				})
			})
			.fail(function () {
				_this.view.transition.detach();
			});
		}
		else {
			transition.done(function () {
				dropfn();
			});
		}

	}

	afterExit () {

	}

	// Reenable if we decide to go for the ticking animation

	// next () {
	// 	let slide = this.slideAt(this.t);
	// 	let next_slide = this.slides[slide.index + 1];

	// 	if (next_slide && next_slide.big) {
	// 		this.animateNumberCount(slide, next_slide);
	// 	}

	// 	super.next()
	// }

	// previous () {
	// 	let slide = this.slideAt(this.t);
	// 	let prev_slide = this.slides[slide.index + 1];

	// 	if (prev_slide && prev_slide.big) {
	// 		this.animateNumberCount(prev_slide, slide);
	// 	}

	// 	super.previous()
	// }

	animateNumberCount (slide_from, slide_to) {
		let _this = this;

		_this.animations.count.reject();

		if (!slide_from.big || !slide_to.big) {
			return;
		}

		let begin = slide_from.big.number,
			end = slide_to.big.number;

		let delta = (end - begin);

		let deferred = $.Deferred();

		let start_time = window.performance.now();

		let msec = 1000,
			tick = 50;

		let timeout = setInterval(function () {
			let now = window.performance.now();

			let t = (now - start_time) / msec;

			if (t >= 1) {
				deferred.resolve();
				return;
			}

			let proportion = Easing.parabolic(t);
			let ct = begin + Math.floor(proportion * delta);

			_this.view.bignumber.number.text(ct);
		}, tick);

		deferred
			.done(function () {
				_this.view.bignumber.number.text(end);
			})
			.always(function () {
				clearInterval(timeout);
			});

		_this.animations.count = deferred;

		return this;
	}

	animateTextScamble (slide) {
		let _this = this;
		let elem = _this.view.story.text;

		this.animations.text.reject();

		if (elem.text()) {
			this.animations.text = elem.scrambleText({
				begin: elem.html(),
				end: slide.text,
				msec: 1500,
				tick: 50,
				update: function (txt) {
					elem.html(
						splitter(txt, true)
					)
				}
			});
		}
		else {
			elem.html(
				splitter(slide.text, true)
			);
		}

		return this;
	}


	renderText (prev_t, t) {
		let _this = this;

		let slide = this.slideAt(t);

		_this.view.story.container.hide();
		_this.view.bignumber.container.addClass('invisible');

		if (slide.text) {
			_this.view.story.container.show();

			_this.view.story.container
				.removeClass('caps italics')
				.addClass(slide.format);

				if (slide.format === 'italics') {
					_this.animateTextScamble(slide);
				}
				else {
					_this.view.story.text.html(
						splitter(slide.text, true)
					);
				}

			_this.view.story.counter.text(`${slide.index + 1}/${this.slides.length}`);
		}
		else if (slide.big) {
			_this.view.bignumber.container.removeClass('invisible');

			_this.view.bignumber.number.text(slide.big.number).removeClass('hundred');

			if (slide.big.number >= 100) {
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

	renderNeurons (prev_t, t) {

	}

	render (t_prev, t) {
		let _this = this; 

		_this.renderText(t_prev, t);
		_this.renderNeurons(t_prev, t);
	}
}

function splitter (txt, inverted = false) {
	return txt; // Remove this line to enable splitter
	if (Utils.isMobile()) {
		return txt;
	}

	if (inverted) {
		return utils.invertedPyramidLineBreak(txt);
	}

	return utils.pyramidLineBreak(txt);
}

module.exports = Galileo;



