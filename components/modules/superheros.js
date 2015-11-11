let $ = require('jquery'),
	Utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js'),
	TeaTime = require('../teatime.js');

class Superheros extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Superheros';
		this.allegience = 'light';

		this.view = this.generateView();

		this.slides = [
			{
				text: "Collaborate and complete unlock achievements for science",
			},
		];

		this.duration = Utils.nvl(args.duration, this.slides.length);
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let bg = d('superheros bg-light module');

		let image = $('<img>').attr({
			src: '/images/wonderers.png',
		});

		let playnow = d('play-now');

		let supertext = d('super-text');
		let textcontainer = d('story-text');
		let text = d('text');
		let counter = d('counter');

		// let next = d('next').ion('click', function () {
		// 	_this.next();
		// });

		textcontainer.append(supertext, text, counter);

		bg.append(
			playnow,
			textcontainer//,
			//next
		);

		return {
			module: bg,
			play_now: playnow,
			// next: next,
			container: textcontainer,
			supertext: supertext,
			text: text,
			counter: counter,
		};
	}

	// afterEnter (transition, frm) {
	// 	let _this = this; 
		
	// 	_this.view.next.hide();

	// 	_this.view.next.drop({
	// 		msec: 5050,
	// 		easing: Easing.bounceFactory(0.5),
	// 		side: 'bottom',
	// 		displacement: 25,
	// 	});

	// 	_this.view.next.show();
	// }

	attachEventHandlers () {
		let _this = this;

		_this.view.play_now.ion('click', function () {
			Utils.UI.curtainFall(function () {
				document.location.href = 'https://eyewire.org/signup';
			});
		})
	}

	render (t_prev, t) {
		let _this = this; 

		this.attachEventHandlers();

		let slide = this.slideAt(t);

		_this.view.play_now.text("PLAY NOW");

		_this.view.text.html(Utils.pyramidLineBreak(slide.text));

		_this.view.counter.text(`${slide.index + 1}/${this.slides.length}`);
	}

}

module.exports = Superheros;