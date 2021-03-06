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

		this.currentFrame = 0;

		this.slides = [
			{
				video: "",
				text: "Your brain makes you amazing!",
				ipyramid: true,
				firstFrame: 0,
				lastFrame: 14,
				lastRepeatFrame: 18,
			},
			{
				supertext: "it allows you to:",
				text: "Learn intricate skills",
				ipyramid: true,
				firstFrame: 19,
				lastFrame: 46,
				lastRepeatFrame: 62,
			},
			{
				text: "Dream fantastic dreams",
				ipyramid: true,
				firstFrame: 63,
				lastFrame: 87,
				lastRepeatFrame: 94,
			},
			{
				text: "Even laugh at goofy cat videos",
				ipyramid: false,
				firstFrame: 95,
				lastFrame: 112,
				lastRepeatFrame: 116,
			},
			{
				text: "But how?",
				ipyramid: true,
				firstFrame: 117,
				lastFrame: 144,
				lastRepeatFrame: 148,
			},
		];

		this.duration = utils.nvl(args.duration, this.slides.length);

		this.animations = {
			text: $.Deferred().resolve(),
			video: $.Deferred().resolve(),
			load: null,
		};

		this.view = this.generateView();
	}

	preload () {
		let _this = this;

		if (!_this.animations.load) {
			_this.animations.load = $.getJSON(GLOBAL.base_url + '/animations/amazing/sequence.json');
		}

		return _this.animations.load;
	}

	generateView () {
		let _this = this;

		let slide_one = this.slideAt(0);

		let bg = $('<div>').addClass('amazing bg-light module');

		if (_this.mobile) {
			bg.ion('click', function () {
				_this.next();
			});
		}

		let videoContainer = $('<div>');

		let frames = [];

		if (!_this.animations.load) {
			_this.preload();
		}

		// opt = optimal, came from these bash commands:
		// for i in *.jpg; do convert $i pnm:- | mozcjpeg -quality 70 > opt-$i; done
		// for i in $(seq 1 49); do base64 -in f$i.png | xargs printf "\"%s\"," >> concat.json; done 
		_this.animations.load.done(function (json) {
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
		})
		.always(function () {
			// throw away extra copy of data, it's like 2MB
			_this.animations.load = $.Deferred().resolve();
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
				easing: Easing.bounceFactory(11),
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

		_this.showFrame(blink_frames[0]);

		let interval = setInterval(function () {
			if (index === 0 && delta < 0) {
				def.resolve();
				return;
			}

			if (index === blink_frames.length - 1) {
				delta *= -1;
			}

			_this.hideFrame(blink_frames[index]);
			index += delta;
			_this.showFrame(blink_frames[index]);

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

		_this.currentFrame = frame;

		let interval = setInterval(function () {
			_this.hideFrame(frame);
			frame++;

			_this.currentFrame = frame;
			_this.showFrame(frame);

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

	playVideo (forward = true) {
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

		var jump = Math.abs(slide.lastFrame - _this.currentFrame) > (4000 / _this.frameRateMsec); // experimentally determined

		var frame = jump
			? slide.lastFrame
			: _this.currentFrame;

		_this.currentFrame = frame;

		_this.showFrame(frame);

		_this.animations.video.reject();

		let delta = forward ? 1 : -1;

		if (slide.index === 4) {
			_this.playCatBlinking();
		} 
		else {
			let interval = setInterval(function () {
				_this.hideFrame(frame);

				frame += delta;

				if (frame === slide.lastRepeatFrame + 1 
					|| (frame <= slide.lastFrame && delta < 0)) { // you shouldn't be able to make the brain go away

					delta = 1;
					frame = slide.lastFrame + 1;
				}

				frame = Utils.clamp(frame, 
					_this.slides[0].firstFrame, 
					_this.slides[_this.slides.length - 1].lastRepeatFrame
				);

				_this.currentFrame = frame;
				_this.showFrame(frame);
			}, _this.frameRateMsec);

			_this.animations.video = $.Deferred().fail(function () {
				clearInterval(interval);
			});
		}
	}

	showFrame (frame) {
		this.view.frames[frame].css('visibility', 'visible');
	}

	hideFrame (frame) {
		this.view.frames[frame].css('visibility', 'hidden');
	}

	render (t_prev, t) {
		let _this = this; 

		let slide = this.slideAt(t);

		if (!slide.supertext) {
			this.view.supertext.hide();
			this.view.textcontainer.removeClass('visible-supertext');
		}
		else {
			this.view.supertext.text(slide.supertext).show();
			this.view.textcontainer.addClass('visible-supertext');
		}

		this.animations.text.reject();

		if (_this.view.text.text()) {
			this.animations.text = _this.view.text.scrambleText({
				begin: _this.view.text.html(),
				end: slide.text,
				msec: 1500,
				tick: 50,
				update: function (txt) {
					_this.view.text.html(splitter(txt, slide.ipyramid))
				}
			});
		}
		else {
			_this.view.text.html(splitter(slide.text, slide.ipyramid));
		}

		this.view.counter.text(`${slide.index + 1}/${this.slides.length}`);

		if (this.entered) {
			this.playVideo(t > t_prev);
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



