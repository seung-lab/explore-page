	// Neurostate Controller Class

// A class for controlling animation flow throughout neurons

function Neurostate (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	this.name = args.name || "Guliver";

	this.duration = args.duration || 30;

	this.forward_update = args.forward_update || function () {};
	this.reverse_update = args.reverse_update || function () {};

	this.forward_render = args.forward_render || function () {};
	this.reverse_render = args.reverse_render || function () {};

	this.forward_init = args.forward_init || function() {};
	this.reverse_init = args.reverse_init || function() {};

	this.forward_slide = args.forward_slide || 0;
	this.reverse_slide = args.reverse_slide || 0;

	this.forward_loop = args.forward_loop || false;
	this.reverse_loop = args.reverse_loop || false;

	this.normed_duration;
	this.begin;

	let _this = this;
	
}

module.exports = Neurostate;