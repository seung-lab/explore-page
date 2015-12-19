
let utils = require('../utils.js'),
		$ = require('jquery');

let _t = 0;

let NeuronCoordinator = {
	neurostates: [],
	initialized: false,
};

NeuronCoordinator.initialize = function (neurostates) {
	let NC = NeuronCoordinator;

	if (!NC.initialized) {
		NC.setAnimations(neurostates);
		NC.initialized = true;
	}
};

NeuronCoordinator.setAnimations = function (neurostates) {
	NeuronCoordinator.neurostates = neurostates || [];
	let normalization = computeNormalization(neurostates);

	let begin = 0;
	NeuronCoordinator.neurostates.forEach(function (neurostate) {
		neurostate.normed_duration = neurostate.duration / normalization;

		neurostate.begin = begin;
		begin += neurostate.normed_duration;
	});
};

NeuronCoordinator.currentAnimation = function () {
	return NeuronCoordinator.animationAt(_t);
};


NeuronCoordinator.nextAnimation = function () {
	let current_animation = NeuronCoordinator.currentAnimation();

	let neurostates = NeuronCoordinator.neurostates;

	let boundary = current_animation.begin;
		boundary += current_animation.normed_duration;

	for (let i = 0; i < neurostates.length; i++) {
		if (neurostates[i].begin >= boundary) {
			return neurostates[i];
		}
	}

	return current_animation; // we're at the end
};

NeuronCoordinator.previousAnimation = function () {
	let current_animation = NeuronCoordinator.currentAnimation();

	let neurostates = NeuronCoordinator.neurostates;

	let prev = neurostates[0];
	for (let i = 0; i < neurostates.length; i++) {
		if (neurostates[i].begin < current_animation.begin) {
			prev = neurostates[i];
		}
		else {
			break;
		}
	}

	return prev;
};

NeuronCoordinator.animationAt = function (t) {
	let neurostates = NeuronCoordinator.neurostates;

	if (!neurostates.length) {
		throw new Error("No neurostates were defined for this timeline.");
	}

	if (Math.abs(1 - t) < 0.00001) {
		return neurostates[neurostates.length - 1];
	}

	for (let i = 0; i < neurostates.length; i++) {
		let current = neurostates[i];
		if (t >= current.begin && t < current.begin + current.normed_duration) {
			return current;
		}
	}

	throw new Error(`Something got out of sync. t = ${t}, neurostates: ${neurostates.length}`);
};

NeuronCoordinator.toAnimationT = function (neurostate, t) {
	t = (t - neurostate.begin) / neurostate.normed_duration;
	return utils.clamp(t, 0, 1);
}

function computeNormalization (neurostates) {
	return neurostates.map(function (neurostate) {
		return neurostate.duration;
	})
	.reduce(function (a, b) {
		return a + b;
	}, 0);
}

/*

NeuronCoordinator.sub_t_update = function (module_name, sub_t) {
	var current = NeuronCoordinator.currentAnimation();

	if (module_name == current.name) {
		_t = (current.begin + (sub_t * current.normed_duration));
	}

	NeuronCoordinator.timeline.seek(_t);
};

NeuronCoordinator.t = function (tee) {
	if (tee !== undefined) {
		NeuronCoordinator.seek(_t);
	}

	return _t;
};

*/

module.exports = NeuronCoordinator;
