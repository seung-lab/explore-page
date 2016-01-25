
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

	if (!NC.initialized) {
		NC.setAnimations(neurostates);
		NC.initialized = true;
	}

	console.log(neurostates);
};

NeuronCoordinator.updateT = function (t) {
	_previous_slide = _current_slide;
	_current_slide = t;

	let neurostates = NeuronCoordinator.neurostates;

	_forward = NeuronCoordinator.direction(t); // Boolean 

	// Update global queue
	neurostates.forEach(function(neurostate) {
		if (neurostate.slide == _current_slide) {
			if (_forward) {
				_tg += neurostate.normed_duration;
			} else {
				_tg -= neurostate.normed_duration;
			}
		}
	});

	console.log("_previous_slide: " + _previous_slide);
	console.log("_current_slide: " + _current_slide);

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
		if (_t >= current.begin && _t < current.begin + current.normed_duration) {
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

NeuronCoordinator.animate = function () {
	let animation = NeuronCoordinator.currentAnimation();

	if (_forward) {
		if (_t < _tg) { // If some delta (queue) exists
			console.log("animating " + animation.name);
			_p.clear();
			animation.forward();
			_t += _step;

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
		if (_t > _tg) {
			console.log("animating " + animation.name);
			_p.clear();
			animation.reverse();
			_t -= _step;

			return;
		}
		else if (animation.loop) {
			console.log("looping " + animation.name);
			_p.clear();
			animation.reverse(); // Loop without incrementing _tg | _t

			return;	
		}
	}

	console.log("No Loop");
	_p.noLoop(); // Shut er' down

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
