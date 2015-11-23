let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	TeaTime = require('../teatime.js'),
	Hammer = require('hammerjs'),
	propagating = require('propagating-hammerjs');

Hammer = propagating(Hammer);


var SLIDE_COUNT = 49 + 1;

var SLIDE_UP_SLIDE = 1;

var MS_PER_FRAME = 83;

function tForSlide(slideIdx) {
	return slideIdx / SLIDE_COUNT;
}

class MeltMobile extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Melt';
		this.allegience = 'dark';
		this.manual_timeline = true;

		let path = function (name) {
			return "/animations/melt/" + name;
		};

		this.duration = 10; // seconds

		this.slides = utils.range(SLIDE_COUNT).map(x => { return {}; });

		this.view = this.generateView();

		this.recurseTimeout = $.Deferred().resolve();



		let slideUp = this.slides[SLIDE_UP_SLIDE].el;
		// slideUp.addClass('return');
		var img = slideUp.children().first().get(0);
		// img.css('top', '0');


		let mc = new Hammer.Manager(img);
		mc.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL, threshold: 0, pointers: 0 }));
		mc.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_VERTICAL })).recognizeWith(mc.get('pan')); // todo, what does this do?


		let _this = this;

		mc.on('swipeup', function (evt) {
			evt.stopPropagation();
		});

		mc.on('panstart panmove', function (evt) {
			if (evt.deltaY > 0) {
				return;
			}

			evt.stopPropagation();

			var current = _this.slideAt(_this.t).el;

			if (current.hasClass('fresh')) {
				current.removeClass('fresh');
				current.addClass('active');
				$('#meltMobile2').addClass('visible');
			} else if (!current.hasClass('active')) {
				return;
			}

			current.removeClass('return');

			var img = current.children().first();

			img.css('top', evt.deltaY + 'px');

			var t = Math.max(0, Math.min(1, -evt.deltaY / (window.innerHeight / 1.5)));

			if (t > 0.4) {
				current.removeClass('active');
				$('#meltMobile2').removeClass('visible');
				_this.next();
			}
		});

		$(window).ion('liftoff.melt', function (e, evt) {
			var current = _this.slideAt(_this.t);

			if (current.index === SLIDE_UP_SLIDE) {
				let slideUpEl = current.el;

				slideUpEl.addClass('return');

				let img = slideUpEl.children().first();
				img.css('top', '0');
			}
		});
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let container = $('<div>').addClass('melt-mobile bg-dark module');


		let bg = $('<img>', {
			id: 'meltMobileBg',
			src: './animations/Melt_Sequence/mobile/neuron_bg_light.png'
		});

		let whitePart = $('<div>', {
			id: 'meltMobileWhitePart'
		});

		let supertext = d('super-text').html("as you solve puzzles");
		let textcontainer2 = d('story-text white-space visible-supertext');
		let text2 = d('text caps').html(splitter("You're mapping the brain", true));
		let counter2 = d('counter');
		textcontainer2.append(supertext, text2); // --> Trying no Counter
		whitePart.append(textcontainer2);

		let vidContainer = $('<div>', { id: 'slideContainer' });

		container.append(
			bg,
			whitePart,
			vidContainer
		);

		// first slide
		let slide0 = $('<div>', { id: 'meltMobile' + 0, class: 'meltSlide' });

		let textcontainer = d('story-text');
		let text = d('text caps').html(splitter("EyeWire is the first of its kind", true));
		let counter = d('counter');
		textcontainer.append(text); // --> Trying no Counter

		slide0.append(textcontainer);
		this.slides[0].el = slide0;
		vidContainer.append(slide0);

		for (let i = 1; i < SLIDE_COUNT; i++) {
			let slide = $('<div>', { id: 'meltMobile' + i, class: 'meltSlide' });
			let img = $('<img>');
			slide.append(img);
			img.css('z-index', SLIDE_COUNT - i + 10);
			this.slides[i].el = slide;

			if (i === SLIDE_UP_SLIDE) {
				let textcontainer2 = d('story-text');
				let text2 = d('text caps').html(splitter("It's a 3D puzzle game", true));
				let counter2 = d('counter');
				textcontainer2.append(text2); // --> Trying no Counter
				slide.append(textcontainer2);
			}

			vidContainer.append(slide);
		}

		$.getJSON('./animations/melt/mobile/concat.json', function (json) {
			for (let i = 1; i < SLIDE_COUNT; i++) {
				_this.slides[i].el.children().first().attr('src', 'data:image/png;base64,' + json[i - 1]);
			}
		});

		return {
			module: container,
			vidContainer: vidContainer
		};
	}

	afterEnter (transition) {
		var _this = this;

		transition.done(function () {
			
			_this.recurseTimeout.reject();

			if (_this.slideAt(_this.t).index === 0) {// && t_prev <= _this.t) {
				_this.recurseTimeout = utils.timeoutDeferred(2000).done(function () {
					 _this.next();
				});
			}
		});
	}

	beforeExit () {
		this.recurseTimeout.reject();
		// clearTimeout(this.recurseTimeout);
		this.clearClasses();
	}

	clearClasses () {
		for (var i = 0; i < SLIDE_COUNT; i++) {
			var el = this.slides[i].el;
			el.removeClass();
			el.addClass('meltSlide');
		}
	}

	next () {
		var last = this.slideAt(this.t);

		super.next();

		var current = this.slideAt(this.t);

		if (current.index === last.index) {
			return;
		}

		last.el.addClass('exit forward');

		current.el.addClass('forward');

		if (current.index > SLIDE_UP_SLIDE && current.index < SLIDE_COUNT - 1) {
			let delay = current.index === SLIDE_UP_SLIDE + 1 ? 500 : MS_PER_FRAME;
			let _this = this;
			this.recurseTimeout = utils.timeoutDeferred(delay).done(function () {
				_this.next();
			});
		}


	}

	previous () {
		var last = this.slideAt(this.t);

		super.previous();

		var current = this.slideAt(this.t);

		if (current.index === last.index) {
			return;
		}

		last.el.addClass('exit reverse');

		current.el.addClass('reverse');

		if (current.index > SLIDE_UP_SLIDE) {
			let _this = this;
			this.recurseTimeout = utils.timeoutDeferred(MS_PER_FRAME).done(function () {
				_this.previous();
			});
			// this.recurseTimeout = setTimeout(this.previous.bind(this), MS_PER_FRAME);
		}
	}

	render (t_prev, t) {
		let _this = this;

		this.clearClasses();

		this.recurseTimeout.reject();

		var currentSlide = this.slideAt(t);

		currentSlide.el.addClass('enter');

		this.view.vidContainer.removeClass().addClass(`slide${currentSlide.index}`);

		if (currentSlide.index === SLIDE_UP_SLIDE) {
			currentSlide.el.children().first().css('top', '');
		}

		var FRAMES_FOR_WHITE = 10;
		var heightStart = 30;
		var heightEnd = 50;

		var delta = currentSlide.index - (SLIDE_COUNT - FRAMES_FOR_WHITE - 1);

		if (delta > 0) {
			var t = delta / FRAMES_FOR_WHITE;
			$('#meltMobileWhitePart').css('opacity', t);
			$('#meltMobileWhitePart').css('height', (heightStart + (heightEnd - heightStart) * t) + "%");

			$('#meltMobileBg').css('opacity', t);
		} else {
			$('#meltMobileWhitePart').css('opacity', 0);
			$('#meltMobileWhitePart').css('height', heightStart + "%");
			$('#meltMobileBg').css('opacity', 0.05); // this fixes a stutter HACK!
		}

		if (currentSlide.index === SLIDE_UP_SLIDE) {
			currentSlide.el.addClass('fresh');
		}
	}
}

function splitter (txt, inverted) {
	let tokens = txt.split(" ").filter(function (str) { return str !== "" });

	if (tokens.length < 4) {
		return txt;
	}

	if (inverted) {
		return utils.invertedPyramidLineBreak(txt);
	}

	return utils.pyramidLineBreak(txt);
}


module.exports = MeltMobile;