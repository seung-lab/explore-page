let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js'),
	TeaTime = require('../teatime.js'),
	GLOBAL = require('../../clientjs/GLOBAL.js');
	
class Amazing extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Amazing';
		this.allegience = 'light';

		this.frameRateMsec = 83;

		this.slides = [
			{
				video: "",
				text: "Your brain makes you amazing!",
				ipyramid: true,
				lastFrame: 14,
				lastRepeatFrame: 18,
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				supertext: "it allows you to:",
				text: "Learn intricate skills",
				ipyramid: true,
				lastFrame: 46,
				lastRepeatFrame: 62,
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "Dream fantastic dreams",
				ipyramid: true,
				lastFrame: 87,
				lastRepeatFrame: 94,
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "Even laugh at goofy cat videos",
				ipyramid: false,
				lastFrame: 112,
				lastRepeatFrame: 116,
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
			{
				text: "But how?",
				ipyramid: true,
				lastFrame: 144,
				lastRepeatFrame: 148,
				enter: "fs-enter",
				exit: "fs-exit",
				enter_reverse: "fs-enter-reverse",
				exit_reverse: "fs-exit-reverse",
			},
		];

		this.duration = utils.nvl(args.duration, this.slides.length);

		$('story-text').addClass('transition-none');

		this.animations = {
			video: $.Deferred().resolve(),
			load: null,
			text: {
				current: $.Deferred().resolve(),
				exit_slide: this.slides[0],
				next: null,
			},
		};

		this.view = this.generateView();
	}

	enqueueTextAnimation (fn) {
		let _this = this;

		if (_this.animations.text.current.state() !== 'pending') {
			_this.animations.text.current = fn()
				.always(function () {
					if (_this.animations.text.next) {
						_this.animations.text.current = _this.animations.text.next();
					}

					_this.animations.text.next = null;
				});

			_this.animations.text.next = null; 
		}
		else {
			_this.animations.text.next = fn;
		}
	}

	generateView () {
		let _this = this;

		let slide_one = this.slideAt(0);

		let bg = $('<div>').addClass('amazing bg-light module');

		let videoContainer = $('<div>');

		let frames = [];

		// opt = optimal, came from these bash commands:
		// for i in *.jpg; do convert $i pnm:- | mozcjpeg -quality 70 > opt-$i; done
		// for i in $(seq 1 49); do base64 -in f$i.png | xargs printf "\"%s\"," >> concat.json; done 
		_this.animations.load = $.getJSON(GLOBAL.base_url + '/animations/amazing/sequence.json', function (json) {
			var frame = 0;

			for (let i = 0; i < _this.slides.length; i++) {
				let slide = _this.slides[i];

				let slideFrameContainer = $('<div>', { id: `slide${i}`});

				for (; frame <= slide.lastRepeatFrame; frame++) {
					var img = $('<img>', {
						src: 'data:image/jpeg;base64,' + json[frame],
					}).addClass('frame');

					slideFrameContainer.append(img);
					frames.push(img);
				};

				videoContainer.append(slideFrameContainer);
			};
		});		

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let supertext = d('super-text');
		let textcontainer = d('story-text invisible');
		let text = d('text');
		let counter = d('counter');

		let next = d('next')
			.append(d('arrow'))
			.ion('click', function () {
				_this.next();
			});

		textcontainer.append(supertext, text); // --> Trying no Counter

		bg.append(
			videoContainer,
			textcontainer,
			next
		);

		return {
			module: bg,
			videoContainer: videoContainer,
			textcontainer: textcontainer,
			text: text,
			supertext: supertext,
			counter: counter,
			next: next,
			frames: frames,
		};
	}

	afterEnter (transition) {
		let _this = this;

		_this.view.next.hide();

		transition.done(function () {
			_this.view.next.drop({
				msec: 1500,
				easing: Easing.bounceFactory(0.5),
				side: 'bottom',
				displacement: 25,
			});
			_this.view.next.show();

			_this.view.textcontainer.removeClass("invisible")

			_this.playVideo();


		});
	}

	afterExit () {
		this.view.text.text("");
		this.animations.video.reject();
	}

	// Makes the cat blink seemingly naturally
	blink () {
		let _this = this;

		if (!_this.view.frames.length) {
			_this.animations.load.done(function () {
				_this.blink();
			});
			return;
		}

		var blink_frames = Utils.range(145, 149);

		var index = 0;
		var delta = 1;

		_this.view.frames[
			blink_frames[0]
		].css('visibility', 'visible');

		let interval = setInterval(function () {
			if (index === 0 && delta < 0) {
				def.resolve();
				return;
			}

			if (index === blink_frames.length - 1) {
				delta *= -1;
			}

			_this.view.frames[blink_frames[index]].css('visibility', 'hidden');
			index += delta;
			_this.view.frames[blink_frames[index]].css('visibility', 'visible');

		}, this.frameRateMsec);

		var def = $.Deferred().always(function () {
			clearInterval(interval);
		});

		return def;
	}

	playCatBlinking () {
		let _this = this;

		if (!_this.view.frames.length) {
			_this.animations.load.done(function () {
				_this.playCatBlinking();
			});
			return;
		}

		let slide = this.slideAt(this.t);

		let beforeSlide = this.slides[slide.index - 1];
		let frame = beforeSlide 
			? beforeSlide.lastRepeatFrame 
			: 0;

		let interval = setInterval(function () {
			_this.view.frames[frame].css('visibility', 'hidden');
			frame++;
			_this.view.frames[frame].css('visibility', 'visible');

			if (frame === slide.lastFrame + 1) {
				_this.animations.video.resolve();

				let min = 200;
				let max = 3000;

				let timeout = null;

				let randomDeferred = $.Deferred().fail(function () {
					if (timeout !== null) {
						clearTimeout(timeout);
					}
				});

				(function randomBlinkWait () {
					var wait = Math.random() * (max - min) + min;

					timeout = setTimeout(function () {
						_this.animations.video = _this.blink().done(randomBlinkWait);
					}, wait);

					_this.animations.video = randomDeferred;
				})();
			}

		}, this.frameRateMsec);

		_this.animations.video = $.Deferred().always(function () {
			clearInterval(interval);
		});
	}

	playVideo () {
		let _this = this;

		if (!_this.view.frames.length) {
			_this.animations.load.done(function () {
				_this.playVideo();
			});
			return;
		}

		let slide = this.slideAt(this.t);

		// play video
		// ensure all frames are hidden
		$('.amazing .frame').css('visibility', 'hidden');

		var beforeSlide = this.slides[slide.index - 1];
		var frame = beforeSlide 
			? beforeSlide.lastRepeatFrame 
			: 0;

		_this.view.frames[frame].css('visibility', 'visible');

		_this.animations.video.reject();

		if (slide.index === 4) {
			_this.playCatBlinking();
		} 
		else {
			let interval = setInterval(function () {
				_this.view.frames[frame].css('visibility', 'hidden');

				frame++;
				if (frame === slide.lastRepeatFrame + 1) {
					frame = slide.lastFrame + 1;
				}

				_this.view.frames[frame].css('visibility', 'visible');
			}, this.frameRateMsec);

			_this.animations.video = $.Deferred().fail(function () {
				clearInterval(interval);
			});
		}
	}

	renderText (prev_t, t) {
		let _this = this;

		let slide = this.slideAt(t);
		let prev_slide = this.slideAt(prev_t);

		if (!slide.big && !slide.text) {
			throw new Error("slide did not specify text or big.");
		}
		
		if (prev_t > t) { // Reverse,  Animate Exit
			_this.animateText(prev_slide, slide, 'reverse');
		}
		else if (slide.index === _this.slides.length - 1 && prev_slide.index !== _this.slides.length - 2) { // Rear Entry
			_this.setText(slide);			
			_this.animateTextEnter(slide, 'reverse');
		}
		else if (slide.index !== 0) { // Forward
			_this.animateText(prev_slide, slide, 'forward');
		} 
		else { // Entering from previous section
			_this.setText(slide);			
			_this.animateTextEnter(slide, 'forward');
		}
	}

	animateText (prev_slide, slide, direction) {
		let _this = this;

		this.enqueueTextAnimation(function () {
			return _this.animateTextExit(_this.animations.text.exit_slide, direction) 
				.then(function () {
					_this.setText(slide);
					
					_this.animations.text.exit_slide = slide;
					return _this.animateTextEnter(slide, direction);
				});
		})
	}
	
	animateTextEnter (slide, direction) {
		let _this = this;
		
		let element = this.view.textcontainer;

		let transition = direction === "forward"
			? slide.enter 
			: slide.enter_reverse;

		if (!transition) {
			return $.Deferred().resolve();
		}

		let deferred = $.Deferred();

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

		let element = this.view.textcontainer;

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

		// Replace with update TEXT
		if (!slide.supertext) {
			_this.view.supertext.hide();
			_this.view.textcontainer.removeClass('visible-supertext');
		}
		else {
			_this.view.supertext.text(slide.supertext).show();
			_this.view.textcontainer.addClass('visible-supertext');
		}

		_this.view.text.html(splitter(slide.text, slide.ipyramid));
	}

	render (t_prev, t) {
		let _this = this; 

		_this.renderText(t_prev, t);
		
		if (this.entered) {
			this.playVideo();
		}
	}
}

function splitter (txt, inverted) {
	let tokens = txt.split(" ").filter((str) => { return str !== "" });

	if (tokens.length < 4) {
		return txt;
	}

	if (inverted) {
		return utils.invertedPyramidLineBreak(txt);
	}

	return utils.pyramidLineBreak(txt);
}

module.exports = Amazing;



