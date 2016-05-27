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
			text: $.Deferred().resolve(),
			video: $.Deferred().resolve(),
			load: null,
		};

		this.view = this.generateView();
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

	render (prev_t, t) {
		let _this = this; 

		let slide = this.slideAt(t);
		let prev_slide = this.slideAt(prev_t);

		// Replace with update TEXT
		if (!slide.supertext) {
			this.view.supertext.hide();
			this.view.textcontainer.removeClass('visible-supertext');
		}
		else {
			this.view.supertext.text(slide.supertext).show();
			this.view.textcontainer.addClass('visible-supertext');
		}

		// Animate Exit
		if ((prev_t > t) && (prev_slide.exit)) { // Reverse
			let element = this.view.textcontainerzx;

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

				if (_this.view.text.text()) {
					_this.view.text.html(splitter(slide.text, slide.ipyramid));
				}

				setTimeout(function() {
					updateText("reverse");
				}, 250);
			}, 1000);
		}
		else if (prev_slide.exit && slide.index !== 0) { // Forward
			let element = this.view.textcontainer;

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

				if (_this.view.text.text()) {
					_this.view.text.html(splitter(slide.text, slide.ipyramid));
				}
				
				setTimeout(function() {
					updateText();
				}, 250);
			}, 1000);
		} 
		else if (slide.index === 0) { // Starting

				_this.view.text.html(splitter(slide.text, slide.ipyramid));

			setTimeout(function() {
				updateText();
			}, 1000);
		} 
		else { // No Transition
			if (_this.view.text.text()) {
				_this.view.text.html(splitter(slide.text, slide.ipyramid));
			}
			updateText();
		}

		function updateText(direction = "forward") {
			if (_this.view.text.text()) {

				// Animate Entrance
				if (slide.enter) {
					let transition;
					direction === "forward"
						? transition = slide.enter 
						: transition = slide.enter_reverse;
					_this.view.textcontainer
						.addClass('transition-state')
						.addClass(transition)
						.addClass('transition-show');
				} 
			}
		}

		// else {
		// 	_this.view.text.html(splitter(slide.text, slide.ipyramid));
		// 	debugger;
		// }

		this.view.counter.text(`${slide.index + 1}/${this.slides.length}`);

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



