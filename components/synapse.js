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

	enter () {
		if (this.visible) {
			return $.Deferred().resolve();
		}

		this.beforeEnter(...arguments);

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		this.afterEnter(...arguments);

		return $.Deferred().resolve();
	}

	beforeEnter () {}
	afterEnter () {}

	exit () {
		if (!this.visible) {
			return $.Deferred().resolve();
		}

		this.beforeExit(...arguments);

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		this.afterExit(...arguments);

		return $.Deferred().resolve();
	}

	beforeExit () {}
	afterExit () {}

	render () {
	
	}
}


module.exports = Synapse;



