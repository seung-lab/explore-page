	// Neurostate Controller Class

// A class for controlling animation flow throughout neurons

function Neurostate (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	this.name = args.name || "Guliver";

	this.duration = args.duration || 30;

	this.forward = args.forward || function () {};
	this.reverse = args.reverse || function () {};

	this.slide = args.slide || 0;
	this.loop = args.loop || false;

	this.normed_duration;
	this.begin;

	let _this = this;

	this.forward_progress = function () {
		_this.forward();		// Call animation
	}

	this.reverse_progress = function () {
		_this.reverse();
	}
}

module.exports = Neurostate;