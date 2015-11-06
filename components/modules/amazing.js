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

		this.slides = [
			{
				video: "",
				text: "Your brain makes you amazing!",
				ipyramid: true,
				gif: path("brain.gif"),
			},
			{
				supertext: "it allows you to:",
				text: "Learn intricate skills",
				ipyramid: true,
				video: "",
				gif: path("apple.gif"),
			},
			{
				text: "Dream fantastic dreams",
				ipyramid: true,
				video: "",
				gif: path("narhawk.gif"),
			},
			{
				text: "Even laugh at goofy cat videos",
				ipyramid: false,
				video: "",
				gif: path("cat.gif"),
			},
			{
				text: "But how?",
				ipyramid: true,
				video: "",
				gif: path("cat.gif"),
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

		let video;

		if (this.mobile) {
			video = $('<img>').attr({
				src: slide_one.gif,
			})
			.addClass('gif')
		}
		else {
			video = $('<video>').attr({
				src: slide_one.video,
				controls: true,
			})
			.addClass('video')
		}

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
			video,
			textcontainer,
			next
		);

		return {
			module: bg,
			video: video,
			textcontainer: textcontainer,
			text: text,
			supertext: supertext,
			counter: counter,
			next: next,
		};
	}

	afterEnter () {
		this.view.next.drop({
			msec: 5050,
			easing: Easing.bounceFactory(0.5),
			side: 'bottom',
			displacement: 25,
		});
	}

	afterExit () {
		this.view.text.text("");
	}

	render (t_prev, t) {
		let _this = this; 

		let slide = this.slideAt(t);
		let last_slide = this.slideAt(t_prev);

		if (!slide.supertext) {
			this.view.supertext.hide();
			this.view.textcontainer.removeClass('visible-supertext');
		}
		else {
			this.view.supertext.text(slide.supertext).show();
			this.view.textcontainer.addClass('visible-supertext');
		}

		this.view.video.attr('src', slide.gif);

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



