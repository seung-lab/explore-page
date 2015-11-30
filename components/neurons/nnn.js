// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for controlling the interactions across the enire network
"use strict";

let p5 = require('p5'),
	Neuron = require('./neuron.js');

function NNN (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	// Public arguments from constructor
	this.num_neurons = args.num_neurons || 1;
	this.complexity = args.complexity  || 13;

	// Generic public array letiable : not an argument though
	this.neurons = [];
	// Array of all somas included in the NNN
	this.somas = [];

	this.max_depth;
	this.num_branches;

	this.initialized = false;

	this.initialize = function() {
		let _this = this;
		// Initialize Neuron
		_this.add_neuron(_this.num_neurons);
	}

	this.distribute = function() {
		let _this = this;

		// Once the MST is built...
		_this.neurons.forEach(function(neuron) {

			let soma = neuron.nodes[0];
				soma.render_soma();

			if (p.frameCount >= 250) {
				neuron.network_setup(); // Create seed branching
				return;
			}

			// Repel from center
			soma.space(_this.somas);

		});

	}
	
	// Simple method for running the neurons
	// Call this something like 'renderFrame'
	this.run = function() {
		let _this = this;
		_this.neurons.forEach(function(neuron) {

			neuron.render();

			if (_this.done()) {
				// console.log("NNN Complete");
				// console.log(_this.neurons.length);
				// p.noLoop();
				neuron.update();

				let radius = neuron.radius();
				
				neuron.nodes[0].spread(_this.somas, radius);
			} 
			else {
				neuron.grow();
			}

		});
	}

	this.done = function() {
		let _this = this;

		let n;
		for (let i = 0; i < _this.neurons.length; i++) {
			n = _this.neurons[i];
			if (!n.done()) {
				return false;
			}
		}

		return true;

	}

	// Add neuron to the network --> Accepts P5.Vector for Arg
	this.add_neuron = function(count) {
		let _this = this;
		let x, y;

		for (let i = 0; i < count; i++) {
			// Set Neuron Soma Position (Root)
			x = (window.innerWidth / 2) + p.random(-1,1);
			y = (window.innerHeight / 2) + p.random(-1,1);

			// Create Neurons with similar general levels of complexity
			_this.num_branches = p.round(p.random(6,8));
			_this.max_depth = _this.complexity - _this.num_branches;
			// Given a constant branching speed, this controls neuron size
			// does not effect morphology.
			// Grow time is inversely proportional to num_branches
			let neuron_timer = 1000 / _this.num_branches;

			_this.neurons.push(
				new Neuron ({
					x: 				x,
					y: 				y,
					num_branches: 	_this.num_branches,
					neuron_timer: 	_this.neuron_timer,
					max_depth: 		_this.max_depth,
					p: 				p,
				})	
			);

			// Get the soma setup
			let soma = _this.neurons[_this.neurons.length - 1]; // --> 1st soma in [0] position
				soma.neuron_start();
				_this.somas.push(soma.nodes[0]);

		}
	}

	// Remove neuron to the network
	this.remove_neuron = function(count) {
		let _this = this;
		let j;
		// splice() is a javascript method to working on arrays
		for (let i = 0; i < count; i++) {
			j = p.floor(p.random(_this.neurons.length));
			_this.neurons.splice(j, 1);
		}
	}

	// Calculate initial separation forces for NNN
	this.spread = function() {
		let _this = this;

		_this.somas.forEach(function (soma) {
			// Find soma for each neuron
			soma.separate(_this.somas);
		});
	}
}

module.exports = NNN;

