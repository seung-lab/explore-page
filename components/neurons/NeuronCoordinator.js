let Utils = require('../../clientjs/utils.js'),
		$ = require('jquery');

let _t,	// Current t
	_tg,  // Queue t
	_prev_t,
	_slide_count,
	_animation_count,
	_current_slide,
	_previous_slide,
	_previous_prev_slide,
	_skip,
	_step;

let _p; //P5 global

let _forward;

let NeuronCoordinator = {
	neurostates: [],
	initialized: false,
};

NeuronCoordinator.initialize = function (neurostates, slide_count, p) {
	let NC = NeuronCoordinator;
	_slide_count = slide_count;

	_p = p;

	// Reset Globals

	_t = 0;
	_tg = 0;
	_prev_t = 0;
	_slide_count = 0;
	_animation_count = 0;
	_current_slide = 0;
	_previous_slide = 0;
	_previous_prev_slide;
	_skip = false;
	_step = 0;

	_forward = true; // Forward

	NC.setAnimations(neurostates);
	NC.initialized = true;

};

NeuronCoordinator.updateT = function (t) {
	let NC = NeuronCoordinator,
		neurostates = NC.neurostates;
	
	_previous_prev_slide = _previous_slide;
	_previous_slide = _current_slide;
	_current_slide = t;


	_forward = NC.direction(t); // Boolean 

	// Update global queue
	if (_forward) {

		if (_current_slide - _previous_slide > 1) { // Skipping
			let diff = _current_slide - _previous_slide;

			for (let i = diff; i > 0; i--) {
				step_forward(i);
			}

			while (_t < (_tg - _step)) {
				NC.step();
				NC.update();

				/* Debug
					console.log('tracing time');
					console.log('_t ' + _t + " | _tg " + _tg);
				*/
			}

			return;

		}

		step_forward();

	}		
	else {
		
		if (_previous_slide - _current_slide > 1) { // Skipping
			let diff = _previous_slide - _current_slide;

			for (let i = diff; i > 0; i--) {
				step_backward(i);
			}
			
			while ((_tg - _step) < _t) {
				NC.step();
				NC.update();

				/* Debug
					console.log('tracing time');
					console.log('_t ' + _t + " | _tg " + _tg);
				*/
			}

			return;

		}

		step_backward();

	}

	function step_forward(skip = 0) {
		for (let i = 0; i < neurostates.length; i++) {
			let neurostate = neurostates[i];
			let look_up = skip > 0 
				? _previous_slide + skip 
				: _current_slide;

			if (neurostate.forward_slide === look_up) {
				_tg += neurostate.normed_duration;
			}			
		}

		//  Special case syncing Initialize
		if ((_current_slide === 1) && (_previous_slide === 0) && (_previous_prev_slide === 1)) {
			
			_t = 0;

			_t += neurostates[0].normed_duration; 
			_tg += neurostates[0].normed_duration;
		}

		// Fresh start sync
		if (_current_slide === 0 && _previous_slide !== 1) {

			_t = 0;
			_tg = 0;

			_t += neurostates[0].normed_duration;
			_tg += neurostates[0].normed_duration;
		}
	}

	function step_backward(skip = 0) {

		for (let i = neurostates.length - 1; i >= 0 ; i--) { // Loop backwards through array for reverse
			let neurostate = neurostates[i];
			let look_up = skip > 0 
				? _previous_slide - skip 
				: _current_slide;

			// Sync to beginning of slide
			if (_previous_prev_slide === _current_slide) {
				if (neurostate.reverse_slide === _previous_slide) {
					if ((neurostate.name === "Synapse") || (neurostate.name === "Grow")) {
						_t -= neurostate.normed_duration; // Fix Grow difference? 
						_tg -= neurostate.normed_duration;
					}
				}
			}

			if (neurostate.reverse_slide === (look_up)) {
				/*
					Debugging
					console.log('adding ' + neurostate.name);
					console.log('subtracting ' + neurostate.normed_duration);
					console.log('new _t ' + _t);
					console.log('new _tg ' + _tg);
				*/

				if (neurostate.name === "Initialize") { // Restart the simulation
					_tg = 0; // Reset goal
					return;
				}

				_tg -= neurostate.normed_duration; 
			}	
		}
	}

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

// Have we started a new animation?
NeuronCoordinator.transition = function (delta) {
	let current = NeuronCoordinator.animationAt(_t);
	let previous = NeuronCoordinator.animationAt(_t - delta);

	if (current.name !== previous.name) {
		// console.log(current.name);
		// console.log(current.begin);
		// console.log(current.normed_duration);
		let fn = delta > 0 
			? current.forward_init
			: current.reverse_init;

		fn();
	}
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
		_t = 1;
		return neurostates[neurostates.length - 1];
	}

	// if (Math.abs(_t) < 0.0001) {
	// 	_t = 0;
	// 	_tg = 0;
	// 	return neurostates[0];
	// }

	for (let i = 0; i < neurostates.length; i++) {
		let current = neurostates[i];
		if (_t >= current.begin && _t <= current.begin + current.normed_duration) {
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

NeuronCoordinator.animate_deprecated = function () {
	let animation = NeuronCoordinator.currentAnimation();
	if (_forward) {
		if (_t < _tg - _step) { // If some delta (queue) exists
			_t += _step;
			animation = NeuronCoordinator.currentAnimation();
			NeuronCoordinator.transition(_step); // Check for transition
			// console.log("animating " + animation.name);
			_p.clear();
			animation.forward();

			return;
		}
		else if (animation.forward_loop) {
			// console.log("looping " + animation.name);
			_p.clear();
			animation.forward(); // Loop without incrementing _tg | _t

			// console.log("tg " + _tg + " _t " + _t);

			return;
		}
	}
	else {
		if (_t > _tg + _step) {
			_t -= _step;
			animation = NeuronCoordinator.currentAnimation();
			NeuronCoordinator.transition(-_step); // Check for transition
			// console.log("animating " + animation.name);
			_p.clear();
			animation.reverse();

			return;
		}
		else if (animation.reverse_loop) {
			// console.log("looping " + animation.name);
			_p.clear();
			animation.reverse(); // Loop without incrementing _tg | _t

			// console.log("tg " + _tg + " _t " + _t);

			return;	
		}
	}

	// console.log("_t:" + _t);
	// console.log("_tg:" + _tg);

	// console.log("Sketch is paused..");
	_p.noLoop(); // Shut er' down

}

// Simulation Router
NeuronCoordinator.animate = function () {
	NeuronCoordinator.step();
	NeuronCoordinator.update();
	
	if (_skip) {
		return;
	}

	NeuronCoordinator.render();

}

// Move forward in time
NeuronCoordinator.step = function () {
	let animation = NeuronCoordinator.currentAnimation();

	if (_forward) {
		if (_t < _tg - _step) { // If some delta (queue) exists
			_t += _step;
			return Utils.clamp(_t, 0, 1);
		}
		else if (animation.forward_loop) {
			return; // Loop without incrementing _tg | _t
		}
	}
	else {
		if (_t > _tg + _step) {
			_t -= _step;
			return Utils.clamp(_t, 0, 1);
		}
		else if (animation.reverse_loop) {
			return;	// Loop without incrementing _tg | _t
		}
	}

	_p.noLoop(); // If _t ~ _tg | Shut er' down

}

// Update position, state, etc
NeuronCoordinator.update = function () {	
	let animation = NeuronCoordinator.currentAnimation();
	
	if (_forward) {
		NeuronCoordinator.transition(_step); // Check for transition
		animation.forward_update();
	}
	else {
		NeuronCoordinator.transition(-_step); // Check for transition
		animation.reverse_update();
	}
}

// Render elements
NeuronCoordinator.render = function () {
	let animation = NeuronCoordinator.currentAnimation();

	_p.clear();
	
	if (_forward) {
		NeuronCoordinator.transition(_step); // Check for transition
		animation.forward_render();
	}
	else {
		NeuronCoordinator.transition(-_step); // Check for transition
		animation.reverse_render();
	}
}

module.exports = NeuronCoordinator;
