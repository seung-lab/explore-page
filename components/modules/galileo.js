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

		let _this = this;

		this.slides = [
			{
				text: "This question has puzzled scientists for centuries",
				format: "caps",
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				big: {
					number: 80,
					high: "Your brain contains",
					medium: "billion",
					low: "neurons",
				},
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				big: {
					number: 100,
					high: "Connected through",
					medium: "trillion",
					low: "synapses",
				},
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "Working together these cells make you, you.",
				format: "italics",
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "However, most of their circuits are still uncharted.",
				format: "italics",
				enter: "fs-enter",
				enter_reverse: "fs-enter-reverse",
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
			}
		];

		this.duration = utils.nvl(args.duration, this.slides.length);

		// this.view.story.container.hide();
		// this.view.bignumber.container.hide();
		this.view.story.container.addClass('transition-none');
		this.view.bignumber.container.addClass('transition-none');

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

	afterExit () {
		this.removeNeurons();
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
		let prev_slide = this.slideAt(prev_t);

		// let transition_end = 'transitionend webkitTransitionEnd oTransitionEnd'; // Browser Prefixes

		let text_container = _this.view.story.container,
			number_container = _this.view.bignumber.container;

		// Animate Exit
		if ((prev_t > t) && (prev_slide.exit)) { // Reverse
			let element;
			prev_slide.text ? element = text_container : element = number_container;

		   element
				.addClass(prev_slide.exit_reverse)
				.removeClass('transition-show');

		   setTimeout(function() {
		   		element
		   			.removeClass('transition-state')
					.removeClass(prev_slide.exit)
					.removeClass(prev_slide.enter)
					.removeClass(prev_slide.exit_reverse)
					.removeClass(prev_slide.enter_reverse);
				
				setTimeout(function() {
					updateText("reverse");
				}, 250);


			}, 1000);
		}
		else if (prev_slide.exit && slide.index !== 0) { // Forward
			let element;
			prev_slide.text ? element = text_container : element = number_container;

		   element
				.addClass(prev_slide.exit)
				.removeClass('transition-show');

		   setTimeout(function() {
		   		element
		   			.removeClass('transition-state')
					.removeClass(prev_slide.exit)
					.removeClass(prev_slide.enter)
					.removeClass(prev_slide.exit_reverse)
					.removeClass(prev_slide.enter_reverse);
				
				setTimeout(function() {
					updateText();
				}, 250);


			}, 1000);

		} 
		else if (slide.index === 0) { // Starting
			setTimeout(function() {
				updateText();
			}, 1000);
		} 
		else { // No Transition
			updateText();
		}
		
		function updateText(direction = "forward") {
			if (slide.text) {
				// Update Text Content
				_this.view.story.text
					.removeClass('caps italics')
					.addClass(slide.format);

					if ((slide.format === 'italics') && (!slide.enter)) {
						_this.animateTextScamble(slide);
					}
					else {
						_this.view.story.text.html(
							splitter(slide.text, true)
						);
					}

				// Animate Entrance
				if (slide.enter) {
					let transition;
					direction === "forward"
						? transition = slide.enter 
						: transition = slide.enter_reverse;
					text_container
						.addClass('transition-state')
						.addClass(transition)
						.addClass('transition-show');
				} 

				_this.view.story.counter.text(`${slide.index + 1}/${_this.slides.length}`);
			
			}
			else if (slide.big) {
				// Update Text Content
				_this.view.bignumber.number.text(slide.big.number).removeClass('hundred');

				if (slide.big.number >= 100) {
					_this.view.bignumber.number.addClass('hundred');
				}

				_this.view.bignumber.high.text(slide.big.high);
				_this.view.bignumber.medium.text(slide.big.medium);
				_this.view.bignumber.low.text(slide.big.low);

				// Animate Entrance
				if (slide.enter) {
					let transition;
					direction === "forward"
						? transition = slide.enter 
						: transition = slide.enter_reverse;
					number_container
						.addClass('transition-state')
						.addClass(transition)
						.addClass('transition-show');
				} 

				_this.view.bignumber.counter.text(`${slide.index + 1}/${_this.slides.length}`);

			}
		}

		if (slide.big || slide.text) return; // Hacky, Love Alex

		throw new Error("slide did not specify text or big.");

	}

	removeNeurons () {
		if (this.sketch) {
			this.sketch.noLoop();
			this.sketch.noCanvas();
			this.sketch = null;
		}
	}

	renderNeurons (prev_t, t) {
		let _this = this; 

		let slide = this.slideAt(t);
		let prevslide = this.slideAt(prev_t);

		if (_this.sketch) {
			console.log('Running Sketch');
			NNNSketch.updateState(slide.index);
		}

		if (prevslide.index === 1 && slide.index === 0) {
			console.log('already running');
			return;
		}

		if (slide.index === 0) {

			_this.removeNeurons();

			_this.sketch = NNNSketch.init({
				anchor: _this.view.action[0],
				width: _this.view.action.width(),
				height: _this.view.action.height(),
				slide_count: _this.slides.length,
			});

			NNNSketch.canvas().done(function (canvas) {
				_this.view.canvas = $(canvas);
				_this.view.canvas.addClass('neural-network');
			});
		}
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



