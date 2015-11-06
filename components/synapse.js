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
		arguments[0] = arguments[0] || $.Deferred().resolve();

		if (this.visible) {
			return this;
		}

		this.beforeEnter(...arguments);

		this.view.module.detach();
		this.anchor.append(this.view.module);
		this.view.module.show();

		this.visible = true;

		console.log("Enter: ", arguments)

		this.afterEnter(...arguments);

		return this;
	}

	beforeEnter () {}
	afterEnter () {}

	exit (transition) {
		arguments[0] = arguments[0] || $.Deferred().resolve();

		if (!this.visible) {
			return this;
		}

		this.beforeExit(...arguments);

		this.view.module.hide();
		this.view.module.detach();

		this.visible = false;

		this.afterExit(...arguments);

		return this;
	}

	beforeExit () {}
	afterExit () {}

	render () {
		return this;
	}
}


module.exports = Synapse;



