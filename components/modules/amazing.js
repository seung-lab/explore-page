let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js'),
	TeaTime = require('../teatime.js');
	
class Amazing extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Amazing';
		this.allegience = 'light';

		let path = function (name) {
			return "/animations/amazing/" + name;
		};

		this.frameRateMsec = 83;

		this.slides = [
			{
				video: "",
				text: "Your brain makes you amazing!",
				ipyramid: true,
				lastFrame: 15,
				lastRepeatFrame: 19,
			},
			{
				supertext: "it allows you to:",
				text: "Learn intricate skills",
				ipyramid: true,
				lastFrame: 47,
				lastRepeatFrame: 63,
			},
			{
				text: "Dream fantastic dreams",
				ipyramid: true,
				lastFrame: 88,
				lastRepeatFrame: 95,
			},
			{
				text: "Even laugh at goofy cat videos",
				ipyramid: false,
				lastFrame: 113,
				lastRepeatFrame: 117,
			},
			{
				text: "But how?",
				ipyramid: true,
				lastFrame: 145,
				lastRepeatFrame: 149,
			},
		];

		this.duration = utils.nvl(args.duration, this.slides.length);
		this.view = this.generateView();

		this.animations = {
			text: $.Deferred().resolve(),
		};
	}

	generateView () {
		let _this = this;

		let slide_one = this.slideAt(0);

		let bg = $('<div>').addClass('amazing bg-light module');

		let videoContainer = $('<div>');

		var count = 0;
		var frame = 1;

		var thisisnew = 1;

		for (let i = 0; i < this.slides.length; i++) {
			let slide = this.slides[i];

			let slideFrameContainer = $('<div>', { id: `slide${count}`});

			while (frame <= slide.lastRepeatFrame) {
				var img = $('<img>', {
					src: `./animations/amazing/opt/opt-f${frame}.jpg`,
					class: 'frame',
					id: 'frame' + frame,
				});
				slideFrameContainer.append(img);

				frame++;
			};

			videoContainer.append(slideFrameContainer);

			count++;
		};

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let supertext = d('super-text');
		let textcontainer = d('story-text');
		let text = d('text');
		let counter = d('counter');

		let next = d('next').ion('click', function () {
			_this.next();
		});

		textcontainer.append(supertext, text, counter);

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
		};
	}

	afterEnter () {
		this.view.next.drop({
			msec: 2000,
			easing: Easing.bounceFactory(0.5),
			side: 'bottom',
			displacement: 25,
		});
	}

	afterExit () {
		this.view.text.text("");

		this.clearAsync();
	}

	blink () {
		var frames = [146, 147, 148, 149];

		var index = 0;
		var delta = 1;

		$('#frame' + frames[index]).css('visibility', 'visible');

		let interval = setInterval(function () {
			if (index === 0 && delta < 0) {
				def.resolve();
				return;
			}

			if (index === frames.length -1) {
				delta *= -1;
			}

			$('#frame' + frames[index]).css('visibility', 'hidden');
			index += delta;
			$('#frame' + frames[index]).css('visibility', 'visible');

		}, this.frameRateMsec);

		var def = $.Deferred().always(function () {
			clearInterval(interval);
		});

		return def;
	}

	clearAsync () {
		if (this.animationPromise !== undefined) {
			this.animationPromise.reject();
		}
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
				msec: 2000,
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


		// play video
		// ensure all frames are hidden
		$('.amazing .frame').css('visibility', 'hidden');

		var beforeSlide = this.slides[slide.index - 1];
		var frame = beforeSlide ? beforeSlide.lastRepeatFrame : 0;

		$('#frame' + frame).css('visibility', 'visible');
		_this.clearAsync();

		if (slide.index === 4) {

			let interval = setInterval(function () {
				$('#frame' + frame).css('visibility', 'hidden');
				frame++;
				$('#frame' + frame).css('visibility', 'visible');

				if (frame === slide.lastFrame + 1) {
					_this.animationPromise.resolve();

					var min = 200;
					var max = 4000;

					let timeout = null;

					let randomInterval = $.Deferred().fail(function () {
						if (timeout !== null) {
							clearTimeout(timeout);
						}
					});

					function loop() {
						var wait = Math.random() * (max - min) + min;

						timeout = setTimeout(function () {
							_this.animationPromise = _this.blink().done(loop);
						}, wait);

						_this.animationPromise = randomInterval;
					}

					loop();
				}

			}, this.frameRateMsec);

			_this.animationPromise = $.Deferred().always(function () {
				clearInterval(interval);
			});
		} else {
			let interval = setInterval(function () {
				$('#frame' + frame).css('visibility', 'hidden');
				frame++;
				if (frame === slide.lastRepeatFrame + 1) {
					frame = slide.lastFrame + 1;
				}
				$('#frame' + frame).css('visibility', 'visible');
			}, this.frameRateMsec);

			_this.animationPromise = $.Deferred().fail(function () {
				clearInterval(interval);
			});
		}
	}
}

function setIntervalRandom(f, min, max) {
	return {
		clear: clearTimeout(this.timeout),
		timeout: function loop () {
			var num = Math.random() * (max - min) + min;
			setTimeout(f, num);
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



