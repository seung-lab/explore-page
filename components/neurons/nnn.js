// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for controlling the interactions across the enire network
"use strict";

let $ = require('jquery'),
	p5 = require('p5'),
	Spring = require('./spring.js'),
	Neuron = require('./neuron.js'),
	Easings = require('../../clientjs/easing.js');

function NNN (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	// Public arguments from constructor
	this.num_neurons = args.num_neurons || 1;
	this.complexity  = args.complexity  || 13;
	this.brain 		 = args.brain || {};
	this.kruskal 	 = args.kruskal  || {};

	this.neurons = []; 		// Generic public array letiable : not an argument though
	this.active_neurons = []; 	// Bounded Neurons
	this.somas = []; 			// Array of all somas included in the NNN
	this.springs = []; 			// Spring system array
	this.time_power; 			// Power Multiplier

	this.max_depth;
	this.num_branches;
	this.neuron_timer;
	this.neuron_id = 0;

	this.initialized = false;

	let _this = this;

	let _scatter_multiplier_1,
		_scatter_multiplier_2,
		_scatter_multiplier_3;

	// Private Methods


	// Public Methods

	this.initialize = Utils.onceify(function() {
		// Calculate power offset
		// During scatter_2 --> Ensure consistant neuron density
		// across different displays
		_scatter_multiplier_1 = 20;
		_scatter_multiplier_3 = 20;

		_scatter_multiplier_2 = p.map(p.width, 0, 2000, 0, 1); // 3000px based on max 4K screen resolution (x)
		_scatter_multiplier_2 = 1 - p.pow(Easings.parabolic(_scatter_multiplier_2), 2);
		_scatter_multiplier_2 = Math.max(_scatter_multiplier_2, 0.1);
		_scatter_multiplier_2 *= 250;

		_this.time_power = p.map(window.innerWidth, 500, 2500, 1500, 2000);

		// Initialize Neuron
		_this.add_neuron(_this.num_neurons);
	});

	this.rebound_1 = function() {
		let ret = false;

		// Once the MST is built...
		_this.render_particles(1);
	}

	this.scatter = function() {
		_this.neurons.forEach(function(neuron) {
			let soma = neuron.nodes[0];
				soma.space(_this.somas, _scatter_multiplier_1); // Repel from center
		});

		_this.render_particles(1);
	}

	this.scatter_2 = function() {

		_this.neurons.forEach(function(neuron) {
			let soma = neuron.nodes[0];
				soma.reset_pow_1();
				soma.space(_this.somas, _scatter_multiplier_2); // Repel from center
		});

		_this.render_particles(1);

		function calc_mst() {
			_this.mst(); 
			// Update spring positions --> Run through array
			_this.springs.forEach(function(s) {
				// s.update();
				// s.display();
			});
		}
	}

	// Check if neuron is off the screen
	this.check_bounds = function(soma) {
		
		if ((soma.position.x < 0) || (soma.position.x > p.width)) {
			return false
		}
		if ((soma.position.y < 0) || (soma.position.y > p.height)) {
			return false;
		}

		return true;
	}

	this.activate = Utils.onceify(function() {

		// console.log('activate');

		for (let i = 0; i < _this.neurons.length; i++) {
			let neuron = _this.neurons[i]
			let soma = neuron.nodes[0];

			// Add only bounded nodes that to our neuron array
			if (_this.check_bounds(soma)) {
				_this.active_neurons.push(neuron);
			}

			if (i == _this.neurons.length - 1) {
				// Create seed branching
				_this.active_neurons.forEach(function(active_neuron) {
					// console.log('neuron_setup');
					active_neuron.network_setup(); 
				});

				return true;
			}
		}
	});
	
	// Simple method for running the neurons
	// Call this something like 'renderFrame'
	this.grow = function() {
		// Setup Neurons
		_this.activate();

		_this.render();

		_this.active_neurons.forEach(function(neuron) {
			if (_this.done()) {
				return; 
			}

			neuron.grow();

		});
	}

	this.render = function() {
		_this.active_neurons.forEach(function(neuron) {
			neuron.render();
		});
	}

	this.render_soma = function() {
		_this.active_neurons.forEach(function(neuron) {
			neuron.render_soma();
		});
	}

	this.render_particles = function(a) {
		_this.neurons.forEach(function(neuron) {
			neuron.render_particle(a);
		});
	}


	this.done = function() {
		let n;

		for (let i = 0; i < _this.active_neurons.length; i++) {
			n = _this.active_neurons[i];
			if (!n.done()) {
				return false;
			}
		}

		return true;

	}

	this.twinkle = function() {
		let step = p.PI / 30;
		let threshold;
		let a;

		neuro_loop: // label
		for (let i = _this.neurons.length - 1; i >= 0; i--) {
			let neuron = _this.neurons[i];
			let soma = neuron.nodes[0];
				
			if (soma.twinkle_bool) {
				soma.twinkle_angle += step; 
				a = p.abs(p.cos(soma.twinkle_angle)); // a == alpha (0-1)
				a = p.constrain(a, 0.01, 1); // P5 doesn't like opacity ~= 0

				neuron.render_particle(a); // Effect Opacity here?

				if (a == 1) {
					soma.twinkle_angle = 0;      	// Reset angle
					soma.twinkle_bool = false;       	// Reset State
				}
			} 
			else {
				
				neuron.render_particle(1);

			}
		
			threshold = p.random(1); // Set threshold

			if ((soma.twinkle_bool == false) && (threshold > 0.85)) {
				soma.twinkle_bool = true;
			}
		}
	}

	this.synapse = function() {
		let threshold; 

		_this.render(); // Render neurons

		for (let i = _this.active_neurons.length - 1; i >= 0; i--) { // Use active_neurons
		// for (let i = 0; i >= 0; i--) { // Use active_neurons
			let neuron = _this.active_neurons[i];
			let soma = neuron.nodes[0];

			if (neuron.propagate_bool) {
				neuron.propagate(soma);
			}

			threshold = p.random(1); // Set threshold

			if ((neuron.propagate_bool == false) && (threshold > 0.991)) {
				neuron.propagate_bool = true;
			}
		}
	}

	this.fadeIn = function() {
		_this.active_neurons.forEach(function(neuron) { 
			neuron.fadeIn();
		});

		_this.render(); // Render neurons	
	}

	this.fadeOut = function() {
		_this.active_neurons.forEach(function(neuron) {
			neuron.fadeOut();
		});
		
		_this.render(); // Render neurons	
	}

	this.rebound2 = function() {	
		_this.active_neurons.forEach(function(neuron) {
			neuron.rebound();
		});
		
		_this.render_soma(); // Render Soma	
	}

	this.last_position = function() {
		_this.active_neurons.forEach(function(neuron) {
			neuron.last_position();
		});
		
		_this.render_soma(); // Render Soma	
	}

	this.stary_night = function() {
		for (let i = 0; i < _this.neurons.length/2; i++) { // Use 1/2 total neurons
			let soma = _this.neurons[i].nodes[0];
				soma.reset_pow_3();
				soma.space(_this.somas, _scatter_multiplier_3); // Repel from center
		}

		_this.render_particles(1);
	}

	this.twinkle_2 = function() {
		let step = p.PI / 30;
		let threshold;
		let a;

		neuro_loop: // label
		for (let i = _this.neurons.length/2 - 1; i >= 0; i--) {
			let neuron = _this.neurons[i];
			let soma = neuron.nodes[0];
				
			if (soma.twinkle_bool) {
				soma.twinkle_angle += step; 
				a = p.abs(p.cos(soma.twinkle_angle)); // a == alpha (0-1)
				a = p.constrain(a, 0.01, 1); // P5 doesn't like opacity ~= 0

				neuron.render_particle(a); // Effect Opacity here?

				if (a == 1) {
					soma.twinkle_angle = 0;      	// Reset angle
					soma.twinkle_bool = false;       	// Reset State
				}
			} 
			else {
				
				neuron.render_particle(1);

			}
		
			threshold = p.random(1); // Set threshold

			if ((soma.twinkle_bool == false) && (threshold > 0.85)) {
				soma.twinkle_bool = true;
			}
		}
	}

	this.brainiac = function() {
		let v = _this.brain.vertices;
		v.forEach(function(vertex) {

		});

	}

	this.kruskal = function() {

	}

	this.plague = function() {
		
	}



	// Add neuron to the network
	this.add_neuron = function(count) {
		let x, y;

		for (let i = 0; i < count; i++) {
			// Set Neuron Soma Position (Root)
			// For some reason the y value must lean towards less?
			x = (window.innerWidth / 2) + p.random(-10,10);
			y = (window.innerHeight / 2) + p.random(-15,0);

			// Create Neurons with similar general levels of complexity
			// _this.num_branches = p.round(p.random(6,8));
			_this.num_branches = 7;
			// Exception for new idea -->
			// if (_this.num_neurons > 50) {
			// 	_this.complexity = 10;
			// }
			_this.max_depth = _this.complexity - _this.num_branches;
			// Given a constant branching speed, this controls neuron size
			// does not effect morphology.
			// Grow time is inversely proportional to num_branches
			if (window.innerWidth < 500) {
				_this.neuron_timer = 1000 / _this.num_branches;	
			} 
			else {
				_this.neuron_timer = this.time_power / _this.num_branches;
			}

			_this.neurons.push(
				new Neuron ({
					x: 				x,
					y: 				y,
					num_branches: 	_this.num_branches,
					neuron_timer: 	_this.neuron_timer,
					max_depth: 		_this.max_depth,
					id:  			_this.neuron_id,
					p: 				p,
				})	
			);

			// Increase the id counter each loop
			_this.neuron_id++;

			// Get the soma setup
			let soma = _this.neurons[_this.neurons.length - 1]; // --> 1st soma in [0] position
				soma.neuron_start();
				_this.somas.push(soma.nodes[0]);

		}
	}

	// Remove neuron + soma from the network
	this.remove_neuron = function(id) {
		for (let i = 0; i < _this.neurons.length; i++) {
			let neuron = _this.neurons[i];
			if (neuron.id == id) {
				_this.neurons.splice(i, 1);
				_this.somas.splice(i, 1);
			}
		}
	}

	// Calculate initial separation forces for NNN
	this.spread = function() {

		_this.somas.forEach(function (soma) {
			// Find soma for each neuron
			soma.separate(_this.somas);
		});
	}

	// Create MST --> Kruskal
	// Additionally create spring connections
	this.mst = Utils.onceify(function() {
		let graph = {
			V: [],
			E: [],
		};

		// Calculate distance from/to every Soma
		// Build MST input graph
		_this.somas.forEach(function(soma) {
			let soma_pos = soma.position;
			graph.V.push(
				soma.neuron_id.toString()
			);
			_this.somas.forEach(function(other_soma) {
				// Check for recurrent connections <cycles>
				if (soma.neuron_id === other_soma.neuron_id) {
					return;
				}

				let other_soma_pos = other_soma.position;
				let d = soma_pos.dist(other_soma_pos);
				let edge = [
					soma.neuron_id.toString(),
					other_soma.neuron_id.toString(),
					d
				];

				graph.E.push(edge);
			});
		});

		// Create + Add a Spring object to springs array
		function getSprung(edge) {
			let n1 = _this.somas[edge[0]];
			let n2 = _this.somas[edge[1]];
			// Make new Spring object
			let s = new Spring ({
				node1: n1,
				node2: n2,
				p: p,
			});
			// Add a new spring 
			_this.springs.push(s);
		}

		let mst = _this.kruskal.mst(graph.V, graph.E);

		let vertices = mst[0]; // Array of Edge objects
		let edges = mst[1]; // Array of Vertex objects

		edges.forEach(function(edge) {
			getSprung(edge);
		});
	});
}

module.exports = NNN;

