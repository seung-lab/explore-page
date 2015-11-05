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
			return $.Deferred().resolve();
		}

		this.beforeEnter(transition);

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		this.afterEnter(transition);

		return $.Deferred().resolve();
	}

	beforeEnter () {}
	afterEnter () {}

	exit (transition) {
		transition = transition || $.Deferred().resolve();
		
		if (!this.visible) {
			return $.Deferred().resolve();
		}

		this.beforeExit(transition);

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		this.afterExit(transition);

		return $.Deferred().resolve();
	}

	beforeExit () {}
	afterExit () {}

	render () {
	
	}
}


module.exports = Synapse;



