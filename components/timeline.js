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

		container.on('click', function (evt) {
			_this.onClick(this, evt);
		});

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
			_this.view.module.detach();
			$('body').append(_this.view.module);
		})
	}

	beforeExit (transition) {
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
