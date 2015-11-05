let $ = require('jquery');
	
class Synapse {
	constructor(args = {}) {
		this.name = args.name;
		this.mobile = args.mobile;

		this.visible = false;

		this.anchor = args.anchor ? $(args.anchor) : null;
	}

	generateView () {
		return {
			module: null,
		};
	}

	enter (transition) {
		transition = transition || $.Deferred().resolve();

		if (this.visible) {
			return this;
		}

		this.beforeEnter(transition);

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		this.afterEnter(transition);

		return this;
	}

	beforeEnter () {}
	afterEnter () {}

	exit (transition) {
		transition = transition || $.Deferred().resolve();

		if (!this.visible) {
			return this;
		}

		this.beforeExit(transition);

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		this.afterExit(transition);

		return this;
	}

	beforeExit () {}
	afterExit () {}

	render () {
		return this;
	}
}


module.exports = Synapse;



