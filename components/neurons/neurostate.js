// Neurostate Controller Class

// A class for controlling animation flow throughout neurons

function Neurostate (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	this.name = args.name || "Guliver";

	this.duration = args.duration || 30;
	this.loop = args.loop || false;

	this.forward = args.forward || function () {};
	this.reverse = args.reverse || function () {};

	this.normed_duration;
	this.begin;
	this.progress = 0;
	this.done = false;

	let _this = this;

	this.forward_progress = function () {
		_this.forward();		// Call animation
   		_this.progress++;

   		if (_this.loop) {
   			return;
   		}

   		if (_this.progress >= _this.duration) {
   			_this.done = true;
   		} else {
   			_this.done = false;
   		}
	}

	this.reverse_progress = function () {
		_this.reverse();
   		_this.progress--;

   		if (_this.loop) {
   			return;
   		}

   		if (_this.progress <= 0) {
   			_this.done = true;
   		} else {
   			_this.done = false;
   		}
	}
}

module.exports = Neurostate;