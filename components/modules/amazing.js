let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js');
	
class Amazing {
	constructor(args = {}) {
		this.t = 0;
		this.name = 'Amazing';
		this.begin = null;
		this.parent = args.parent;

		this.allegience = 'light';

		this.mobile = args.mobile;

		this.visible = false;

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

		this.anchor = args.anchor;
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
			});
		}
		else {
			video = $('<video>').attr({
				src: slide_one.video,
				controls: true,
			});
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

	enter (from) {
		if (this.visible) {
			return $.Deferred().resolve();
		}

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		this.view.next.drop({
			msec: 5050,
			easing: Easing.bounceFactory(0.5),
			side: 'bottom',
			displacement: 25,
		});

		return $.Deferred().resolve();
	}

	exit (from) {
		if (!this.visible) {
			return $.Deferred().resolve();
		}

		this.view.module.hide();
		this.view.module.detach();

		this.view.text.text("");

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
	let tokens = txt.split(" ").filter(function (str) { return str !== "" });

	if (tokens.length < 4) {
		return txt;
	}

	if (inverted) {
		return ipyramid_splitter(txt);
	}

	return pyramid_splitter(txt);
}

function ipyramid_splitter (txt) {
	let tokens = txt.split(" ");
	let html = "";

	let midpt = txt.length / 2;
	let len = 0;

	let broken = false;

	for (let i = 0; i < tokens.length; i++) {
		html += tokens[i];
		len += tokens[i].length;

		if (!broken && len > midpt) {
			html += '<br>';
			broken = true;
		}
		else {
			html += " ";
			len++;
		}
	}

	return html;
}

function pyramid_splitter (txt) {
	let tokens = txt.split(" ");
	let html = "";

	let midpt = txt.length / 2;
	let len = 0;

	let broken = false;

	for (let i = tokens.length - 1; i >= 0; i--) {
		html += utils.sreverse(tokens[i]);
		len += tokens[i].length;

		if (!broken && len > midpt) {
			html += utils.sreverse('<br>');
			broken = true;
		}
		else {
			html += " ";
			len++;
		}
	}

	return utils.sreverse(html);
}


module.exports = Amazing;



