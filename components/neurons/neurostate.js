// Neurostate Controller Class
// A class for controlling animation flow throughout neurons

function Neurostate (args = {}) {
	this.slide = args.slide || 0;
	this.forward_animations = args.forward_animations || [];
	this.reverse_animations = args.reverse_animations || [];
}

module.exports = Neurostate;