let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	Easing = require('../../clientjs/easing.js');
	
class Galileo {
	constructor(args = {}) {
		this.t = 0;
		this.name = 'Galileo';
		this.begin = null;
		this.duration = utils.nvl(args.duration, 1);
		this.parent = args.parent;

		this.mobile = args.mobile;

		this.visible = false;

		this.anchor = args.anchor;
		this.view = this.generateView();
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let bg = d('amazing bg-dark module');

		let next = d('next').ion('click', function () {
			_this.next();
		});

		return {
			module: bg,
			transition: d('transition'),
			next: next,
		};
	}

	storyPoints () {
		let counter = -1,
			N = this.slides.length - 1;

		return this.slides.map(function () {
			counter++;
			return counter / N;
		});
	}

	next () {
		let N = this.slides.length - 1;
		let index = Math.floor(this.t * N);

		if (index < N) {
			index += 1;
		}

		this.seek(index / N);
	}

	slideAt (t) {
		let N = this.slides.length - 1;

		let index = Math.floor(t * N);

		let slide = this.slides[index]
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

		return this.view.next.drop({
			msec: 5050,
			easing: Easing.bounceFactory(0.5),
			side: 'bottom',
			displacement: 25,
		});
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

		let splitter = function (txt) {
			let tokens = txt.split(" ");
			let html = "";
			for (let i = 0; i < tokens.length; i++) {
				html += tokens[i] + " ";

				if (i % 3 === 2) {
					html += "<br>";
				}
			}

			return html;
		};

		if (!slide.supertext) {
			this.view.supertext.hide();
			this.view.textcontainer.removeClass('visible-supertext');
		}
		else {
			this.view.supertext.text(slide.supertext).show();
			this.view.textcontainer.addClass('visible-supertext');
		}

		this.view.video.attr('src', slide.gif);

		this.view.text.html(
			splitter(slide.text)
		);

		this.view.counter.text(`${slide.index + 1}/${this.slides.length}`);
	}

}


module.exports = Galileo;



