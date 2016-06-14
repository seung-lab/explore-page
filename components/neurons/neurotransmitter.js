// Neurotransmitter Controller Class
// A class for controlling animation flow throughout neurons

let $ = require('jquery');

class Neurotransmitter {
	constructor(args = {}) {
		this.duration = args.duration 	|| 0;
		this.update = args.update  		|| function(){};
		this.render = args.render  		|| function(){};
		this.initialize = args.init  	|| function(){};
		this.loop = args.loop 			|| false;

		this.deferred = $.Deferred().resolve();
		this.counter  = 0;
		this.initialized = false; 

		let _this = this;
	}

	init () { // Initialize + Reset Animation
		let _this = this;

		_this.deferred = $.Deferred();
		_this.counter = 0;
		_this.initialized = true;	

		_this.initialize(); // Set up animation
	}

	update () {
		let _this = this;

		_this.update();
	}

	render () {
		let _this = this;
		_this.render();
	}
}

module.exports = Neurotransmitter;