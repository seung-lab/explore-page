// Neurostate Class
// A class for aggregating animation flow per / slide

let $ = require('jquery');

class Neurostate {
	constructor (args = {}) {
		this.slide = args.slide || 0;
		this.forward_animations = args.forward_animations || [];
		this.reverse_animations = args.reverse_animations || [];

		this.deferred = $.Deferred().resolve();
		this.counter  = 0; 

		let _this = this;

	}

	init() {
		let _this = this;

		_this.deferred = $.Deferred();
		_this.counter = 0;
	}
}

module.exports = Neurostate;