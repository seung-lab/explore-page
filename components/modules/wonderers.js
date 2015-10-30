let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js');

class Wonderers {
	constructor(args = {}) {
		this.t = 0;
		this.name = 'Wonderers';
		this.begin = null;
		
		this.parent = args.parent;

		this.allegience = 'light';

		this.mobile = args.mobile;

		this.visible = false;

		this.anchor = args.anchor;
		this.view = this.generateView();

		this.slides = [
			{
				supertext: "gamers * students * teachers * scientists",
				text: "We are Wonderers"
			},
		];

		this.duration = utils.nvl(args.duration, this.slides.length);
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let bg = d('wonderers bg-light module');

		let image = $('<img>').attr({
			src: '/images/Wonderers.png',
		});

		let supertext = d('super-text');
		let textcontainer = d('story-text');
		let text = d('text');
		let counter = d('counter');

		let next = d('next').ion('click', function () {
			_this.next();
		});

		textcontainer.append(supertext, text, counter);

		bg.append(
			image,
			textcontainer,
			next
		);

		return {
			module: bg,
			next: next,
			container: textcontainer,
			supertext: supertext,
			text: text,
			counter: counter,
		};
	}

	storyPoints () {
		let counter = -1,
			N = this.slides.length;

		return this.slides.map(function () {
			counter++;
			return counter / N;
		});
	}

	next () {
		let N = this.slides.length;

		if (this.last() - this.t < 0.0001) {
			this.parent.moduleComplete();
			return;
		}

		let slide = this.slideAt(this.t);
		let index = utils.clamp(slide.index + 1, 0, this.slides.length - 1);

		this.seek(index / this.slides.length);
	}

	previous () {
		if (this.t === 0) {
			this.parent.moduleUncomplete();
			return;
		}

		let slide = this.slideAt(this.t);
		let index = utils.clamp(slide.index - 1, 0, this.slides.length - 1);

		this.seek(index / this.slides.length);
	}

	last () {
		let N = this.slides.length;
		return (N - 1) / N;
	}

	slideAt (t) {
		let N = this.slides.length;

		let index = Math.floor(t * N);

		let slide = this.slides[index]
		slide.index = index;

		return slide;
	}

	enter (transition, frm) {
		if (this.visible) {
			return $.Deferred().resolve();
		}

		let _this = this;

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		_this.view.next.hide();

		_this.view.next.drop({
			msec: 5050,
			easing: Easing.bounceFactory(0.5),
			side: 'bottom',
			displacement: 25,
		});

		_this.view.next.show();

		return $.Deferred().resolve();
	}

	exit (transition, frm) {
		if (!this.visible) {
			return $.Deferred().resolve();
		}

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		return $.Deferred().resolve();
	}

	seek (t) {
		let t_prev = this.t;
		this.t = t;
		this.parent.sub_t_update(this.name, t);
		return this.render(t_prev, t);
	}

	render (t_prev, t) {
		let _this = this; 

		let slide = this.slideAt(t);

		_this.view.text.text(slide.text);
		_this.view.supertext.text(slide.supertext);

		_this.view.counter.text(`${slide.index + 1}/${this.slides.length}`);
	}

}

module.exports = Wonderers;