let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js'),
	TeaTime = require('../teatime.js');

class Wonderers extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Wonderers';
		this.allegience = 'light';

		this.view = this.generateView();

		this.slides = [
			{
				supertext: "gamers * students * teachers * scientists",
				text: "We are Wonderers",
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
			src: '/images/wonderers.png',
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

	afterEnter (transition, frm) {
		let _this = this; 
		
		_this.view.next.hide();

		_this.view.next.drop({
			msec: 5050,
			easing: Easing.bounceFactory(0.5),
			side: 'bottom',
			displacement: 25,
		});

		_this.view.next.show();
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