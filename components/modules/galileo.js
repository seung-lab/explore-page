let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js'),
	TeaTime = require('../teatime.js'),
	NNNSketch = require('./neurons/sketch.js');
	
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

		this.animations = {
			text: $.Deferred().resolve(),
		};
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

	afterEnter (transition, frm) {
		let _this = this;
		
		_this.view.next.hide();

		let dropfn = function () {
			_this.view.next.drop({
				msec: 2000,
				easing: Easing.bounceFactory(0.5),
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
			dropfn();
		}
	}

	animateTextScamble (slide) {
		let _this = this;
		let elem = _this.view.story.text;

		this.animations.text.reject();

		if (elem.text()) {
			this.animations.text = elem.scrambleText({
				begin: elem.html(),
				end: slide.text,
				msec: 2000,
				tick: 50,
				update: function (txt) {
					elem.html(
						utils.invertedPyramidLineBreak(txt)
					)
				}
			});
		}
		else {
			elem.html(
				utils.invertedPyramidLineBreak(slide.text)
			);
		}
	}

	render (t_prev, t) {
		let _this = this; 

		let slide = this.slideAt(t);

		_this.view.story.container.hide();
		_this.view.bignumber.container.hide();

		if (slide.text) {
			_this.view.story.container.show();

			_this.view.story.text
				.removeClass('caps italics')
				.addClass(slide.format);

				if (slide.format === 'italics') {
					_this.animateTextScamble(slide);
				}
				else {
					_this.view.story.text.html(
						utils.invertedPyramidLineBreak(slide.text)
					);
				}

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



