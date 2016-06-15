// Growing Neurons
// Alex Norton :: 2016

// Recursive Neuron (P5js)


let Utils = require('../../clientjs/utils.js'),
	Neurotransmitter = require('./neurotransmitter.js'), // neurotransmitter
	$ = require('jquery');

class NeuronCoordinator {
	constructor(args = {}) {		
		this.p = args.p 	|| {};	//P5 global
		this._t = args._t 	|| 0;	// Current t
		this._t_queue = [];  			// Queue t
		this._t_prev;

		this.neurostates = [];
		this.initialized = false;

		this.animations = {
			neurostate: null,
			current: null,
		};

		let _this = this;

	}

	initialize (neurostates) {
		let _this = this;

		_this.neurostates = neurostates;

		_this._t_queue = [];
		_this._t = 0;
		_this._t_prev = 0;

		_this.initialized = true;
		_this.animations = {
			neurostate: _this.neurostates[0],
			current: {
				deferred: $.Deferred().resolve(),
			}
		};

	};

	updateQueue (t) {
		let _this = this;

		_this._t_prev = _this._t;
		_this._t = t;

		let direction = _this.direction(_this._t, _this._t_prev);

		_this._t_queue.push(_this.neurostates[_this._t]); // Add Neurostate for given slide

		// Check for direction change
		// If so, cancel current queue

		if (Math.abs(_this.t - _this.t_queue) > 2) {
			// If user is more than 2 slides ahead
			// Skip
		} else {
			_this.queueNeurostate(direction);
		}
	}

	direction (t, t_prev) {

		if (t >= t_prev) {
			return 'forward';
		} 
		
		return 'reverse';
	};

	queueNeurostate(direction) {
		let _this = this;

		if (_this._t_queue.length === 0) {
			_this.neurostate = null;
			return;
		}
		
		if (_this.animations.neurostate.deferred.state() !== 'pending') {
			_this.animations.neurostate = _this._t_queue[0];
			_this.animations.neurostate.init();
			_this.animations.neurostate.deferred
				.then(function() {
					_this._t_queue.shift();
					_this.queueNeurostate(direction);
				});

			// Kick off animations
			let animations = direction === 'forward'
				? _this.animations.neurostate.forward_animations
				: _this.animations.neurostate.reverse_animations; 

			if (animations.length === 0) {
				_this.animations.neurostate.deferred.resolve();
				return;
			}
				
			_this.queueAnimation(animations);
		}
	}

	// Complete Animations
	queueAnimation (animations, index = 0) {
		let _this = this;
		
		if (animations.length === 0) {
			return;
		}

		if (_this.animations.current.deferred.state() !== 'pending') {
			_this.animations.current = animations[index];

			_this.animations.current = new Neurotransmitter ({
				duration: _this.animations.current.duration,
				update: _this.animations.current.update,
				render: _this.animations.current.render,
				init: _this.animations.current.init,
				loop: _this.animations.current.loop,
			});

			_this.animations.current.init();
			_this.p.loop();

			_this.animations.current.deferred.then(function () {
				index++;

				if (index < animations.length) {
					_this.queueAnimation(animations, index);
					return;
				}

				_this.animations.neurostate.deferred.resolve();

			});
		}
	}

	// Simulation Router
	animate () {
		let _this = this,
			animation = _this.animations.current;

		if (!animation.initialized) {
			return;
		}

		_this.p.clear();

		_this.step(animation);
		_this.update(animation);
		_this.render(animation);
	}

	// No Render
	skip (animation) {
		let _this = this;

		_this.step(animation);
		_this.update(animation);
	}

	step (animation) {
		let _this = this,
			counter = animation.counter,
			duration = animation.duration;

		if (counter < duration) {
			animation.counter++;
			return;
		} else {
			animation.deferred.resolve();
		}

		if (animation.loop) {
			return;
		}

		if (_this._t_queue.length > 0) {
			return;
		}

		_this.p.noLoop();
	}

	// Update position, state, etc
	update (animation) {	
		let _this = this;
		animation.update();
	}

	// Render elements
	render (animation) {
		let _this = this;
		animation.render();
	}
}

module.exports = NeuronCoordinator;
