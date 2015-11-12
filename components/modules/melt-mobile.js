let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	TeaTime = require('../teatime.js'),
	Hammer = require('hammerjs');


var SLIDE_COUNT = 1;//49 + 1;

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


		$.getJSON('./animations/Melt_Sequence/mobile/realgood/xt/concat.json', function (json) {
			console.log('got json', json.length);
			SLIDE_COUNT += json.length;

			_this.slides = _this.slides.concat(utils.range(_this.slides.length, SLIDE_COUNT).map(x => { return {}; }));


			for (let i = 1; i < SLIDE_COUNT; i++) {
				let slide = $('<div>', { id: 'meltMobile' + i, class: 'meltSlide' });

				let img = $('<img>', {
					src: 'data:image/png;base64,' + json[i - 1],
				});

				img.css('z-index', SLIDE_COUNT - i + 10);

				slide.append(img);

				if (i === SLIDE_UP_SLIDE) {
					let textcontainer2 = d('story-text');
					let text2 = d('text caps').html(splitter("It's a 3D puzzle game", true));
					let counter2 = d('counter');
					textcontainer2.append(text2, counter2);
					slide.append(textcontainer2);
				}

				_this.slides[i].el = slide;
				vidContainer.append(slide);
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

		var mc = new Hammer.Manager(this.view.module.get()[0]);
		mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));

		mc.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_VERTICAL })).recognizeWith(mc.get('pan')); // todo, what does this do?

		mc.on('panstart panmove', function (evt) {
			console.log('panmove');

			var current = this.slideAt(_this.t).el;

			if (current.hasClass('fresh')) {
				current.removeClass('fresh');
				current.addClass('active');
			} else if (!current.hasClass('active')) {
				return;
			}

			var img = current.children[0];

			img.removeClass('return');

			img.css('top', evt.deltaY + 'px');

			// var negative = evt.deltaY < 0;

			// if (current.donedone || next === null) {
			// 	return;
			// }

			var t = Math.max(0, Math.min(1, Math.abs(evt.deltaY) / (window.innerHeight / 1.5)));

			if (t > 0.5) {
				current.removeClass('active');
				_this.next();
			}
		});

		mc.on("hammer.input", function(ev) {
			if (ev.isFinal) {
				let slideUp = $(`#meltMobile${SLIDE_UP_SLIDE}.current`);


				if (!slideUp.hasClass('active')) {
					return;
				}

				slideUp.addClass('return');

				var img = slideUp.children[0];
				img.css('top', null);
			}
		});
	}

	clearClasses (classes) {
		for (var i = 0; i < SLIDE_COUNT; i++) {
			var el = this.slides[i].el;
			el.removeClass('reverse');
			el.removeClass('forward');
			el.removeClass('exit');
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
		// var prevSlide = this.slideAt(t_prev);
		var currentSlide = this.slideAt(t);

		this.clearEnter();


		// currentSlide.el.removeClass('exit');
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

		// $('#meltMobile' + prevSlide).css('opacity', 0);

		// $('#meltMobile' + slide).css('opacity', 1);

		// function addClass (el, name) {
		// 	el.addClass(name);
		// }

		// function removeClass (el, name) {
		// 	el.removeClass(name);
		// }

		// function doNeighbors(slide, remove) {
		// 	var foo = remove ? removeClass : addClass;

		// 	var beforeSlideEl = $('#meltMobile' + (slide - 1));
		// 	var afterSlideEl = $('#meltMobile' + (slide + 1));

		// 	foo(beforeSlideEl, 'before');
		// 	foo(afterSlideEl, 'after');
		// }

		// prevSlide.el.removeClass('current');
		// currentSlideEl.addClass('current');

		// doNeighbors(prevSlide, true);
		// doNeighbors(currentSlide, false);

		// for (var i = 0; i < SLIDE_COUNT; i++) {
		// 	var el = this.slides[i].el;

		// 	el.removeClass('rev');
		// 	el.removeClass('after');
		// 	el.removeClass('before');

		// 	if (i < currentSlide.index) {
		// 		el.removeClass('after');
		// 		el.addClass('before');
		// 	} else if (i > currentSlide.index) {
		// 		el.addClass('after');
		// 		el.removeClass('before');
		// 	} else {
		// 		el.removeClass('after');
		// 		el.removeClass('before');
		// 		el.addClass('current');
		// 		if (t_prev > t) {
		// 			el.addClass('rev');
		// 		}
		// 	}
		// };

		// if (currentSlide.index === SLIDE_COUNT - 1) {
		// 	var bg = $('#meltMobileBg').addClass('lastSlide');
		// 	var whitePart = $('#meltMobileWhitePart').addClass('lastSlide');
		// } else if (prevSlide.index === SLIDE_COUNT - 1) {
		// 	var bg = $('#meltMobileBg').removeClass('lastSlide');
		// 	var whitePart = $('#meltMobileWhitePart').removeClass('lastSlide');
		// }

		// if (prevSlide.index === SLIDE_UP_SLIDE) {
		// 	prevSlide.el.removeClass('active');
		// 	prevSlide.el.css('top', '');
		// }

		// if (currentSlide.index === SLIDE_UP_SLIDE) {
		// 	currentSlide.el.addClass('fresh');
		// }
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

	// recurse(forward) {
	// 	console.log('recurse', this.slideAt(this.t));
	// 	// console.log('recurse', this.t);

	// 	var userTriggered = false;
	// 	if (forward) {
	// 		super.next(userTriggered);
	// 	} else {
	// 		super.previous();
	// 	}

	// 	var current = this.slideAt(this.t).index;

	// 	if (current < SLIDE_COUNT - 1 && current > SLIDE_UP_SLIDE) {
	// 		clearTimeout(this.recurseTimeout);
	// 		this.recurseTimeout = setTimeout(this.recurse.bind(this, forward), 83);
	// 	} else {
	// 		console.log('done with recurse');
	// 		this.recurseTimeout = undefined;
	// 	}
	// }
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