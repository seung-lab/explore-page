let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	TeaTime = require('../teatime.js');


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

		let path = function (name) {
			return "/animations/melt/" + name;
		};

		this.duration = 10; // seconds

		this.slides = utils.range(SLIDE_COUNT).map(x => { return {}; });

		this.view = this.generateView();
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
		let textcontainer2 = d('story-text visible-supertext');
		let text2 = d('text caps').html(splitter("You're mapping the brain", true));
		let counter2 = d('counter');
		textcontainer2.append(supertext, text2, counter2);
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
		let text = d('text caps').html(splitter("EyeWire is the first of it's kind", true));
		let counter = d('counter');
		textcontainer.append(text, counter);

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
				textcontainer2.append(text2, counter2);
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

	afterEnter (from) {
		var _this = this;

		console.log('melt-mobile after enter');

		$(window).ion('panmove', function (e, evt) {
			console.log('panmove');

			var current = _this.slideAt(_this.t).el;

			if (current.hasClass('fresh')) {
				current.removeClass('fresh');
				current.addClass('active');
			} else if (!current.hasClass('active')) {
				return;
			}

			current.removeClass('return');

			var img = current.children().first();

			img.css('top', evt.deltaY + 'px');

			var t = Math.max(0, Math.min(1, -evt.deltaY / (window.innerHeight / 1.5)));

			if (t > 0.5) {
				current.removeClass('active');
				_this.next();
			}
		});

		$(window).ion('liftoff', function (e, evt) {
			let slideUp = $(`#meltMobile${SLIDE_UP_SLIDE}`);

			slideUp.addClass('return');

			var img = slideUp.children().first();
			img.css('top', '0');
		});
	}

	clearClasses (classes) {
		for (var i = 0; i < SLIDE_COUNT; i++) {
			var el = this.slides[i].el;
			el.removeClass('reverse');
			el.removeClass('forward');
			el.removeClass('exit');
			el.removeClass('active');
		}
	}

	clearEnter () {
		for (var i = 0; i < SLIDE_COUNT; i++) {
			var el = this.slides[i].el;
			el.removeClass('enter');
		}
	}

	next () { // next slide
		console.log('next');
		this.clearClasses();

		var last = this.slideAt(this.t);

		super.next();

		var current = this.slideAt(this.t);

		console.log('current', current.index);

		if (current.index === last.index) {
			return;
		}

		last.el.addClass('exit forward');

		// current.el.removeClass('reverse');
		current.el.addClass('forward');

		if (current.index > SLIDE_UP_SLIDE && current.index < SLIDE_COUNT - 1) {
			let delay = current.index === SLIDE_UP_SLIDE + 1 ? 1000 : MS_PER_FRAME;
			this.recurseTimeout = setTimeout(this.next.bind(this, true), delay);
		}
	}

	previous () { // previous slide
		console.log('previous');
		this.clearClasses();

		var last = this.slideAt(this.t);

		// last.el.removeClass('enter forward');

		super.previous();

		var current = this.slideAt(this.t);

		if (current.index === last.index) {
			return;
		}

		last.el.addClass('exit reverse');

		// current.el.removeClass('forward');
		current.el.addClass('reverse');
		// current.el.addClass('rev');

		if (current.index > SLIDE_UP_SLIDE) {
			// this.recurse(true);
			this.recurseTimeout = setTimeout(this.previous.bind(this), MS_PER_FRAME);
		}
	}

	render (t_prev, t) {
		console.log('render', this.slideAt(t));
		var currentSlide = this.slideAt(t);

		this.clearEnter();


		currentSlide.el.addClass('enter');

		var FRAMES_FOR_WHITE = 10;
		var heightStart = 30;
		var heightEnd = 50;

		var delta = currentSlide.index - (SLIDE_COUNT - FRAMES_FOR_WHITE - 1);

		if (delta >= 0) {
			var t = delta / FRAMES_FOR_WHITE;
			$('#meltMobileWhitePart').css('opacity', t);
			$('#meltMobileWhitePart').css('height', (heightStart + (heightEnd - heightStart) * t) + "%");

			$('#meltMobileBg').css('opacity', t);
		} else {
			$('#meltMobileWhitePart').css('opacity', 0);
			$('#meltMobileWhitePart').css('height', heightStart + "%");
			$('#meltMobileBg').css('opacity', 0);
		}

		if (currentSlide.index === SLIDE_UP_SLIDE) {
			currentSlide.el.addClass('fresh');
		}
	}

	seek (t) {
		console.log('seek', t);
		let t_prev = this.t;
		this.t = t;
		this.parent.sub_t_update(this.name, t);


		clearTimeout(this.recurseTimeout);

		if (this.slideAt(this.t).index === 0 && t_prev <= this.t) {
			this.recurseTimeout = setTimeout(this.next.bind(this), 2000);
		}

		return this.render(t_prev, t);
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