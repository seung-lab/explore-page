let $ = require('jquery'),
	utils = require('../../clientjs/utils.js');
	
class Amazing {
	constructor(args = {}) {
		this.t = 0;
		this.name = 'Amazing';
		this.begin = null;
		this.duration = utils.nvl(args.duration, 1);
		this.parent = args.parent;

		this.visible = false;

		this.slides = [
			{
				text: "Your brain makes you amazing!",
			},
			{
				supertext: "It allows you to:",
				text: "Learn intricate skills",
			},
			{
				text: "Dream fantastic dreams",
			},
			{
				text: "Even laugh at goofy cat videos",
			},
			{
				text: "But how?",
			},
		];

		this.anchor = args.anchor;
		this.view = this.generateView();
	}

	generateView () {
		let bg = $('<div>').addClass('amazing bg-light module');

		let video = $('<video>').attr({
			src: "/animations/out.mp4",
			controls: true,
		});

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let supertext = d('super-text');
		let textcontainer = d('story-text');
		let text = d('text');
		let counter = d('counter');

		let next = d('next').ion();

		textcontainer.append(text, counter);

		bg.append(
			video,
			supertext,
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

	slideAt (t) {
		let N = this.slides.length - 1;

		let index = Math.floor(t * N);

		let slide = this.slides[index];

		slide.index = index;

		return slide;
	}

	exit () {
		if (!this.visible) {
			return $.Deferred().resolve();
		}

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		return $.Deferred().resolve();
	}

	enter () {
		if (this.visible) {
			return $.Deferred().resolve();
		}

		this.view.module.detach();
		this.anchor.prepend(this.view.module);
		this.view.module.show();

		this.visible = true;

		return $.Deferred().resolve();
	}

	seek (t) {
		let t_prev = this.t;
		this.t = t;
		this.parent.sub_t_update(this.name, t);
		return this.render(t_prev, t);
	}

	render (t_prev, t) {
		let slide = this.slideAt(t);

		if (!slide.supertext) {
			this.view.supertext.hide();
			this.view.textcontainer.addClass('ellipses');
		}
		else {
			this.view.supertext.text(slide.supertext).show();
			this.view.textcontainer.removeClass('ellipses');
		}

		this.view.text.text(slide.text);

		// this.view.video.attr('src', wow)

		this.view.counter.text(`${slide.index + 1}/${this.slides.length}`);
	}

}


module.exports = Amazing;



