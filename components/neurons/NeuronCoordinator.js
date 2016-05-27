let Utils = require('../../clientjs/utils.js'),
		$ = require('jquery');

let _t = 0;	// Current t
let _tg = 0;  // Queue t
let _prev_t = 0;
let _slide_count = 0;
let _animation_count = 0;
let _current_slide = 0;
let _previous_slide = 0;
let _step = 0;

let _p; //P5 global

let _forward = true; // Forward

let NeuronCoordinator = {
	neurostates: [],
	initialized: false,
};

NeuronCoordinator.initialize = function (neurostates, slide_count, p) {
	let NC = NeuronCoordinator;
	_slide_count = slide_count;

	_p = p;

	NC.setAnimations(neurostates);
	NC.initialized = true;

};

NeuronCoordinator.updateT = function (t) {
	let NC = NeuronCoordinator;
	_previous_slide = _current_slide;
	_current_slide = t;

	let neurostates = NeuronCoordinator.neurostates;

	_forward = NeuronCoordinator.direction(t); // Boolean 

	// Update global queue
	if (_forward) {

		if (_current_slide - _previous_slide > 1) {
			console.log('fastforward');
			let diff = _current_slide - _previous_slide;

			for (let i = diff; i > 0; i--) {
				step_forward(i);
			}

			while (_t < (_tg - _step)) {
				console.log('tracing time');
				console.log('_t ' + _t + " | _tg " + _tg);
				NC.animate();
			}

			return;

		}

		step_forward();

	}		
	else {
		
		if (_previous_slide - _current_slide > 1) {
			console.log('rapidreverse');
			while (_tg > _t) {
				step_backward();
				NC.animate();
			}
			_p.loop();
			return;
		}

		step_backward();

	}

	function step_forward(skip = 0) {
		for (let i = 0; i < neurostates.length; i++) {
			let neurostate = neurostates[i];
			let look_up;

			// Special Cases
			if ((neurostate.name === "Initialize") && (_current_slide === 0)) {
				_t = 0;
				_tg = 0;
				// Run internal loop to fix difference 
				for (let j = 0; j < neurostate.duration; j++) {
					_t += _step; // ReSync
					_tg += _step;
					// console.log("Syncing " + neurostate.name + "..");
				}

				return;

			}

			skip > 0 ? look_up = _previous_slide + skip : look_up = _current_slide

			console.log(look_up);

			if (neurostate.forward_slide == (look_up)) {
				_tg += neurostate.normed_duration;
			}			
		}
	}

	function step_backward() {
		for (let i = neurostates.length - 1; i >= 0 ; i--) { // Loop backwards through array for reverse
			let neurostate = neurostates[i];

			if (neurostate.reverse_slide == _current_slide) {
				_tg -= neurostate.normed_duration;
			}

			// Special Cases
			if ((neurostate.name === "Scatter2") && (_current_slide === 1)) {
				// Run internal loop to fix difference 
				for (let j = 0; j < neurostate.duration - 30; j++) {
					_t -= _step; // ReSync
					console.log("Syncing " + neurostate.name + "..");
				}
			}
		}
	}

	// Debugging
	// console.log("_previous_slide: " + _previous_slide);
	// console.log("_current_slide: " + _current_slide);
	// console.log("Sketch is running..");

	_p.loop();

};

NeuronCoordinator.direction = function (t) {

	let prev = _prev_t;
	_prev_t = t;

	if (t >= prev) {
		return true; // Forward
	} 
	
	return false; // Reverse
};

NeuronCoordinator.setAnimations = function (neurostates) {
	NeuronCoordinator.neurostates = neurostates || [];
	let normalization = computeNormalization(neurostates); // Total duration of all animations
		_step = 1 /normalization; // Animation step

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

NeuronCoordinator.animationAt = function (_t) {
	let neurostates = NeuronCoordinator.neurostates;

	if (!neurostates.length) {
		throw new Error("No neurostates were defined for this timeline.");
	}

	if (Math.abs(1 - _t) < 0.00001) {
		return neurostates[neurostates.length - 1];
	}

	for (let i = 0; i < neurostates.length; i++) {
		let current = neurostates[i];
		if (_t > current.begin && _t < current.begin + current.normed_duration) {
			return current;
		}
	}

	throw new Error(`Something got out of sync. _t = ${_t}, neurostates: ${neurostates.length}`);
};

NeuronCoordinator.toAnimationT = function (neurostate, _t) {
	_t = (_t - neurostate.begin) / neurostate.normed_duration;
	return Utils.clamp(_t, 0, 1);
}

function computeNormalization (neurostates) {
	return neurostates.map(function (neurostate) {
		return neurostate.duration;
	})
	.reduce(function (a, b) {
		return a + b;
	}, 0);
}

// To be run with updateT, to sync up forward + reverse
NeuronCoordinator.specialCases = function () {

}

NeuronCoordinator.animate = function () {
	let animation = NeuronCoordinator.currentAnimation();
	if (_forward) {
		if (_t < _tg - _step) { // If some delta (queue) exists
			_t += _step;
			animation = NeuronCoordinator.currentAnimation();
			console.log("animating " + animation.name);
			_p.clear();
			animation.forward();

			return;
		}
		else if (animation.loop) {
			console.log("looping " + animation.name);
			_p.clear();
			animation.forward(); // Loop without incrementing _tg | _t

			return;
		}
	}
	else {
		if (_t >= _tg + _step) {
			_t -= _step;
			animation = NeuronCoordinator.currentAnimation();
			// console.log("animating " + animation.name);
			_p.clear();
			animation.reverse();

			return;
		}
		else if (animation.loop) {
			// console.log("looping " + animation.name);
			_p.clear();
			animation.reverse(); // Loop without incrementing _tg | _t

			return;	
		}
	}

	// console.log("_t:" + _t);
	// console.log("_tg:" + _tg);

	// console.log("Sketch is paused..");
	_p.noLoop(); // Shut er' down

}

module.exports = NeuronCoordinator;
