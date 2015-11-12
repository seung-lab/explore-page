let $ = require('jquery');
	
class Synapse {
	constructor(args = {}) {
		this.name = args.name;
		this.mobile = args.mobile;

		this.visible = false;
		this.entered = false;

		this.anchor = args.anchor ? $(args.anchor) : null;
	}

	generateView () {
		return {
			module: null,
		};
	}

	enter (transition, frm) { 
		let _this = this;

		transition = transition || $.Deferred().resolve();

		if (this.visible) {
			return this;
		}

		this.beforeEnter(transition, frm);

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		this.afterEnter(transition, frm);

		transition.done(function () {
			_this.entered = true;
		});

		return this;
	}

	beforeEnter () {}
	afterEnter () {}

	exit (transition, frm) {
		let _this = this;
		
		transition = transition || $.Deferred().resolve();

		if (!this.visible) {
			return this;
		}

		this.beforeExit(transition, frm);

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		this.afterExit(transition, frm);

		transition.done(function () {
			_this.entered = false;
		})

		return this;
	}

	beforeExit () {}
	afterExit () {}

	render () {
		return this;
	}
}


module.exports = Synapse;



