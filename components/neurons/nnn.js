// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for controlling the interactions across the enire network
"use strict";

let $ = require('jquery'),
	p5 = require('p5'),
	Spring = require('./spring.js'),
	Neuron = require('./neuron.js');

function NNN (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	// Public arguments from constructor
	this.num_neurons = args.num_neurons || 1;
	this.complexity = args.complexity  || 13;
	this.kruskal = args.kruskal  || {};

	// Generic public array letiable : not an argument though
	this.neurons = [];
	// Bounded Neurons
	this.active_neurons = [];
	// Array of all somas included in the NNN
	this.somas = [];
	// Spring system array
	this.springs = [];

	this.max_depth;
	this.num_branches;
	this.neuron_timer;
	this.neuron_id = 0;

	this.initialized = false;

	let _this = this;

	let _scale_power_1,
		_scale_power_2;

	this.initialize = function() {
		// Initialize Neuron
		_this.add_neuron(_this.num_neurons);

		// Calculate power offset
		// During scatter_2 --> Ensure consistant neuron density
		// across different displays
		if (p.width < 500) {
			_scale_power_1 = 0.95;
			_scale_power_2 = 1.07;
		} else {
			_scale_power_1 = 1.02;
			_scale_power_2 = p.map(p.width, 3000, 400, 1, 1.1);
		}
	}

	this.rebound = function() {
		let ret = false;

		// Once the MST is built...
		_this.neurons.forEach(function(neuron) {

			let soma = neuron.nodes[0];
				soma.render_soma(5);

		});
	}

	this.scatter = function() {
		_this.neurons.forEach(function(neuron) {
			let soma = neuron.nodes[0];
				soma.render_soma(5);
				soma.space(_this.somas, _scale_power_1); // Repel from center
		});
	}

	this.scatter_2 = function() {
		_this.neurons.forEach(function(neuron) {
			let soma = neuron.nodes[0];
				soma.render_soma(5);
				soma.reset_pow();
				soma.space(_this.somas, _scale_power_2); // Repel from center

			// _this.mst(); 
			// Update spring positions --> Run through array
			// _this.springs.forEach(function(s) {
			// 	// s.update();
			// 	// s.display();
			// });

		});
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

		console.log('activate');

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
					console.log('neuron_setup');
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

	}

	this.fadeIn = function() {
		
	}

	this.fadeOut = function() {

	}

	this.synapse = function() {

	}

	this.rebound2 = function() {

	}

	this.lastPosition = function() {

	}

	this.staryNight = function() {

	}

	this.brainiac = function() {

	}

	this.kruskal = function() {

	}

	this.plague = function() {
		
	}



	// Add neuron to the network --> Accepts P5.Vector for Arg
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
			} else {
				_this.neuron_timer = 2000 / _this.num_branches;
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

