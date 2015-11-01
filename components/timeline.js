let utils = require('../clientjs/utils.js'),
	$ = require('jquery');

class Timeline {
	constructor (args = {}) {
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

	exit () {
		this.view.module.detach();
		this.view.module.hide();

		this.visible = false;

		return $.Deferred().resolve();
	}

	enter () {
		this.view.module.detach();

		this.anchor.append(this.view.module);

		this.view.module.show();

		this.visible = true;

		return $.Deferred().resolve();
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