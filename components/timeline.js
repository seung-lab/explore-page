let utils = require('../clientjs/utils.js'),
	Synapse = require('./synapse.js'),
	$ = require('jquery');

class Timeline extends Synapse {
	constructor (args = {}) {
		super(args);

		this.t = args.t || 0;
		this.parent = args.parent;
		this.view = this.generateView();
		this.anchor = args.anchor;
		this.visible = false;
	}

	generateView () {
		let _this = this;
		let container = $('<div>').addClass('timeline');

		let progress = $('<div>').addClass('progress');
		let module = container.append(progress);

		container
			.drag(function (evt) {
				_this.onClick(this, evt);
			})
			.ion('click', function (evt) {
				_this.onClick(this, evt);
			})

		return {
			module: module,
			progress: progress,
		};
	}

	fullManual (manual = true) {
		if (manual) {
			this.view.module.addClass('manual');
		}
		else {
			this.view.module.removeClass('manual');
		}
	}

	attachEnlargeListener () {
		let _this = this;
		let win = $(window);

		win.ion('mousemove.timeline', function (evt) {
			let pos = Utils.UI.eventOffset(win, evt);
			let height = win.height();
			let width = win.width();

			let hfraction = pos.y / height;
			let wfraction = pos.x / width;

			let space = 50 / width;

			let aroundArrow = function () {
				return ((wfraction >= 0.5 - space
				   		&& wfraction <= 0.5 + space)
					&& hfraction < 0.95);
			};

			_this.view.module.removeClass('large');
			if (hfraction > 0.85 
				&& !aroundArrow()) {

				_this.view.module.addClass('large');
			}
		});
	}

	onClick (elem, evt) {
		let coords = utils.ui.eventOffset(elem, evt);
		let fract = coords.x / this.view.module.width();

		if (fract < 0.02) {
			fract = 0;
		}
		else if (fract > 0.98) {
			fract = 1;
		}

		this.parent.seek(fract);
	}

	afterEnter (transition) {
		let _this = this;

		transition.done(function () { 
			_this.anchorToBody();

			_this.attachEnlargeListener();
		})
	}

	beforeExit (transition) {
		this.anchorToAnchor();

		$(document).off('mousemove.timeline');
	}

	anchorToBody () {
		let _this = this;

		_this.view.module.detach();
		$('body').append(_this.view.module);
	}

	anchorToAnchor () {
		let _this = this;
		_this.view.module.detach();
		_this.anchor.append(_this.view.module);
	}

	seek (t) {
		let prev_t = this.t;
		this.t = t;
		return this.render(prev_t, t);
	}

	render (prev_t, t) {
		this.view.progress.css('width', (t * 100) + '%');

		return $.Deferred().resolve();
	}
}

module.exports = Timeline;
