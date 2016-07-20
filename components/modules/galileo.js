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
					high: "Your brain contains",
					medium: "billions",
					preposition: "of",
					low: "neurons",
				},
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				big: {
					high: "Connected through",
					medium: "trillions",
					preposition: "of",
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
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "When Galileo first peered through his telescope it began a revolution in the way we see the world around us.",
				format: "italics",
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "Today, neuroscience is revolutionizing how we see the world within us.",
				format: "italics",
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "We’re calling on gamers to help connect the dots by creating a visual 3D map of the brain.",
				format: "italics",
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			}
		];

		this.duration = utils.nvl(args.duration, this.slides.length);

		this.view.story.container.addClass('transition-none');
		this.view.bignumber.container.addClass('transition-none');

		this.animations = {
			text: {
				current: $.Deferred().resolve(),
				exit_slide: this.slides[0],
				next: null,
			},
		};

		this.sketch = null; // p5 sketch for neurons
	}

	enqueueTextAnimation (fn) {
		let _this = this;

		if (_this.animations.text.current.state() !== 'pending') { // If done or nonexistent
			_this.animations.text.current = fn()
				.always(function () {
					if (_this.animations.text.next) {
						_this.animations.text.current = _this.animations.text.next(); // Queue up next animation
					}

					_this.animations.text.next = null;
				});

			_this.animations.text.next = null; 
		}
		else {
			_this.animations.text.next = fn; // If in progress, queue next animation
		}
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

		textcontainer.append(text);  // --> Trying no Counter

		// Big number story

		let container2 = d('story-text-big'),
			innercontainer = d('inner'),
			hightext = d('high-text'),
			medtext = d('medium-text'),
			prepositiontext = d('preposition-text'),
			lowtext = d('low-text');

		innercontainer.append(
			hightext, 
			medtext,
			prepositiontext, 
			lowtext
		);

		container2.append(
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
			},
			bignumber: {
				container: container2,
				high: hightext,
				medium: medtext,
				preposition: prepositiontext,
				low: lowtext,
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

	renderText (prev_t, t) {
		let _this = this;

		let slide = this.slideAt(t);
		let prev_slide = this.slideAt(prev_t);

		if (!slide.big && !slide.text) {
			throw new Error("slide did not specify text or big.");
		}
		
		if (prev_t > t) { // Reverse,  Animate Exit
			_this.animateText(slide, 'reverse');
		}
		else if (slide.index === _this.slides.length - 1 && prev_slide.index !== _this.slides.length - 2) { // Rear Entry
			_this.setText(slide);			
			_this.animateTextEnter(slide, 'reverse');
		}
		else if (slide.index !== 0) { // Forward
			_this.animateText(slide, 'forward');
		} 
		else { // Entering from previous section
			_this.setText(slide);			
			_this.animateTextEnter(slide, 'forward');
		}
	}

	animateText (slide, direction) {
		let _this = this;

		this.enqueueTextAnimation(function () {
			return _this.animateTextExit(_this.animations.text.exit_slide, direction) 
				.then(function () {
					_this.setText(slide);
					
					_this.animations.text.exit_slide = slide;
					return _this.animateTextEnter(slide, direction);
				});
		});
	}
	
	animateTextEnter (slide, direction) {
		let _this = this;
		
		let element = slide.text 
			? _this.view.story.container 
			: _this.view.bignumber.container;

		let transition = direction === "forward"
			? slide.enter 
			: slide.enter_reverse;

		if (!transition) {
			return $.Deferred().resolve();
		}

		let deferred = $.Deferred();

		if (slide.index === 6 || slide.index ===  7) {
			element.addClass('story-text-mobile');
		} 
		else {
			element.removeClass('story-text-mobile');
		}

		element
			.addClass('transition-state')
			.addClass(transition)
			.addClass('transition-show')
			.transitionend(utils.onceify(function (transition) {
				setTimeout(function () {
					deferred.resolve();
				}, 0);
			}));

		return deferred;
	}

	animateTextExit (slide, direction) { // Needs to accept the slide index of the most recently completed animation
		let _this = this;
		let counter = 0;

		let element = slide.text 
			? _this.view.story.container 
			: _this.view.bignumber.container;

		let exit_direction = direction === 'forward'
			? slide.exit
			: slide.exit_reverse;

		let deferred = $.Deferred();

	    element
	    	.addClass('transition-state')
			.addClass(exit_direction)
			.removeClass('transition-show')
			.transitionend(function () {
				if (counter > 0) {
					return;
				}
				element
		   			.removeClass('transition-state')
					.removeClass(slide.exit)
					.removeClass(slide.enter)
					.removeClass(slide.exit_reverse)
					.removeClass(slide.enter_reverse)
						
				setTimeout(function () {
					deferred.resolve();
				}, 0);

				counter++;

			});

		return deferred;
	}

	setText (slide) {
		let _this = this;

		if (slide.text) {
			// Update Text Content
			_this.view.story.text
				.removeClass('caps italics')
				.addClass(slide.format)
				.html(slide.text);
		}
		else if (slide.big) {
			// Update Text Content
			_this.view.bignumber.high.text(slide.big.high);
			_this.view.bignumber.medium.text(slide.big.medium);
			_this.view.bignumber.preposition.text(slide.big.preposition);
			_this.view.bignumber.low.text(slide.big.low);
		}
	}

	clearText () {
		this.view.story.text.text('');
		this.view.bignumber.high.text('');
		this.view.bignumber.medium.text('');
		this.view.bignumber.preposition.text('');
		this.view.bignumber.low.text('');
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

		if (prevslide.index === 1 && slide.index === 0) {
			NNNSketch.updateState(slide.index);
			return;
		}

		if (slide.index === 0 || !_this.sketch) {

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

		if (_this.sketch) {
			NNNSketch.updateState(slide.index);
		}
	}

	render (t_prev, t) {
		let _this = this; 

		_this.renderText(t_prev, t);
		_this.renderNeurons(t_prev, t);
	}
}

module.exports = Galileo;



