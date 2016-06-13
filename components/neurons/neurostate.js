// Neurostate Class
// A class for aggregating animation flow per / slide

let $ = require('jquery');

class Neurostate {
	constructor (args = {}) {
		this.slide = args.slide || 0;
		this.forward_animations = args.forward_animations || [];
		this.reverse_animations = args.reverse_animations || [];

		this.deferred = $.Deferred();
		this.counter  = 0; 

		let _this = this;
	}

	init() {
		let _this = this;

		_this.deferred = $.Deferred();
		_this.counter = 0;
	}

	complete (direction = 'forward') {
		let _this = this,
			animations;

		if (direction === 'forward') {
			animations = _this.forward_animations;	
		}
		else {
			animations = _this.reverse_animations;
		}

		animations.forEach(function(animation) {
			if (animation.complete.state !== 'done') {
				return; // Continue?
			}

			_this.deferred.resolve();

		});

		return deferred;

	}
}

module.exports = Neurostate;