// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for controlling the interactions across the enire network
"use strict";

window.NNNCount = 0;

let $ = require('jquery'),
	p5 = require('p5'),
	Spring = require('./spring.js'),
	Neuron = require('./neuron.js'),
	Node = require('./node.js'),
	Easings = require('../../clientjs/easing.js');

function NNN (args = {}) {
	// Private arguments from constructor
	this.p = args.p;
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
	
	this.dendrites = [];
	this.roots = [];
	this.dendrite_id = 0;

	this.initialized = false;

	let _this = this;


	this.brainiac = (function() {

		let center = new p5.Vector(p.width/2, p.height/2),
			vertices = _this.brain.vertices,
			pos = p.createVector(),
			probability,
			stroke_val,
			alpha = 0,
			speed = 100;

		vertices = vertices.map(function(v) { // Make our thot objects
			return new Node ({
				position: 	center,
				brain_pos:  v,
				velocity: 	p.createVector(1,1),
				mass: 		1,
				p: 			p,
			});
		});

		setup_dendrite(); // Call once

		function animate() {
			p.noStroke()
			p.fill(115,135,150);

			if (speed > 3) speed -= 3;

			vertices.forEach((v) => {
				v.maxspeed = speed;
				v.arrive(v.brain_pos);
				v.update();
				v.render_soma(5);
			});
		}

		function rebound_brain() {
			p.noStroke()
			p.fill(115,135,150);

			speed = 100;

			vertices.forEach((v) => {
				v.maxspeed = speed;
				v.arrive(center);
				v.update();
				v.render_soma(5);
			});
		}

		function render_svg() {
			// Draw Brain SVG	
			p.noFill();
			p.strokeWeight(2);

			_this.brain.render.connect();
		}

		function fade_svg_lines() {
			// Fade Brain SVG	
			p.noFill();
			p.strokeWeight(2);

			_this.brain.render.fade_beziers();
			_this.brain.render.points();
		}

		function setup_dendrite() { // Dendrite Set Up
			for (let i = 0; i < vertices.length; i++) {

				if (i % 3 !== 0) continue; // keep things evenly(ish) spaced

				let v = _this.brain.vertices[i];

				pos.x = v.x;
				pos.y = v.y;

				let heading = p5.Vector.sub(pos, center);  // A vector pointing from the center to the vertex 
					heading.normalize();

				let velocity = p.createVector();
					velocity.x = heading.x;
					velocity.y = heading.y;

					heading = p.degrees(heading.heading());
				
				// heading.mult(5);
				// let tan_vec = p5.Vector.add(heading, pos); // translate vector to position

				_this.add_dendrite(pos, heading, velocity); // Create a simplified neuron

			}
		}

		function done() { // Is dendrite done growing?
			let d;

			for (let i = 0; i < _this.dendrites.length; i++) {
				d = _this.dendrites[i];
				if (!d.done()) {
					return false;
				}
			}

			return true;
		}

		function grow() { // Grow the dendrites

			_this.dendrites.forEach((dendrite) => {
				if (done()) {
					return; 
				}

				dendrite.grow2();

			});
		}

		function render_dendrite() { // Render the dendrites
			_this.dendrites.forEach((dendrite) => {
				dendrite.render();
			});
		}

		//--------------- Closure Exports

		return { 
			animate: function() {
				animate();
			},
			render_svg: function() {
				render_svg();
			},
			fade_svg_lines: function() {
				fade_svg_lines();
			},
			rebound_brain: function() {
				rebound_brain();
			},
			grow: function() {
				grow();
			},
			render_dendrite: function() {
				render_dendrite();
			}
		};

	})();

	// Run => Neurons
	this.grow = (function() {
		let active = false;
		function grow() {

			if (!active) {
				this.activate();
				active = true;
			}
			this.render();

			this.active_neurons.forEach((neuron) => {
				if (this.done()) {
					return; 
				}

				neuron.grow();

			});
		}

		return grow;

	})();

}

// Private Globals

let _scatter_multiplier_1,
	_scatter_multiplier_2,
	_scatter_multiplier_3;



// Public Methods
NNN.prototype.empty_fn = function() {

}


NNN.prototype.initialize = function() {
	// Calculate power offset
	// During scatter_2 --> Ensure consistant neuron density
	// across different displays
	_scatter_multiplier_1 = 20;
	_scatter_multiplier_3 = 20;

	_scatter_multiplier_2 = this.p.map(this.p.width, 0, 2000, 0, 1); // 3000px based on max 4K screen resolution (x)
	_scatter_multiplier_2 = 1 - this.p.pow(Easings.parabolic(_scatter_multiplier_2), 2);
	_scatter_multiplier_2 = Math.max(_scatter_multiplier_2, 0.1);
	_scatter_multiplier_2 *= 250;

	this.time_power = this.p.map(window.innerWidth, 500, 2500, 1500, 2000);

	// Initialize Neuron
	this.add_neuron(this.num_neurons);
}

NNN.prototype.scatter = function() {
	this.neurons.forEach((neuron) => {
		let soma = neuron.nodes[0];
			soma.space(this.somas, _scatter_multiplier_1); // Repel from center
			neuron.first_position.set(soma.position); // Continously set starting position
	});

	this.render_particles(1);
}

NNN.prototype.scatter_2 = function() {
	this.neurons.forEach((neuron) => {
		let soma = neuron.nodes[0];
			soma.reset_prop.pow();
			soma.space(this.somas, _scatter_multiplier_2); // Repel from center
	});

	this.render_particles(1);

	// function calc_mst() {
	// 	this.mst(); 
	// 	// Update spring positions --> Run through array
	// 	this.springs.forEach((s) => {
	// 		// s.update();
	// 		// s.display();
	// 	});
	// }
}

// Check if neuron is off the screen
NNN.prototype.check_bounds = function(soma) {
	if ((soma.position.x < 0) || (soma.position.x > this.p.width)) {
		return false
	}
	if ((soma.position.y < 0) || (soma.position.y > this.p.height)) {
		return false;
	}

	return true;
}

NNN.prototype.activate = function() {
	for (let i = 0; i < this.neurons.length; i++) {
		let neuron = this.neurons[i]
		let soma = neuron.nodes[0];

		// Add only bounded nodes that to our neuron array
		if (this.check_bounds(soma)) {
			this.active_neurons.push(neuron);
		}

		if (i == this.neurons.length - 1) {
			// Create seed branching
			this.active_neurons.forEach((active_neuron) => {
				// console.log('neuron_setup');
				active_neuron.network_setup(); 
			});

			return true;
		}
	}
}

NNN.prototype.render = function() {
	this.active_neurons.forEach((neuron) => {
		neuron.render();
	});
}

NNN.prototype.render_soma = function() {
	this.active_neurons.forEach((neuron) => {
		neuron.render_soma();
	});
}

NNN.prototype.render_particles = function(a) {
	this.neurons.forEach((neuron) => {
		neuron.render_particle(a);
	});
}


NNN.prototype.done = function() {
	let n;

	for (let i = 0; i < this.active_neurons.length; i++) {
		n = this.active_neurons[i];
		if (!n.done()) {
			return false;
		}
	}

	return true;

}

NNN.prototype.twinkle = function() {
	let step = this.p.PI / 30;
	let threshold;
	let a;

	neuro_loop: // label
	for (let i = this.neurons.length - 1; i >= 0; i--) {
		let neuron = this.neurons[i];
		let soma = neuron.nodes[0];
			
		if (soma.twinkle_bool) {
			soma.twinkle_angle += step; 
			a = this.p.abs(this.p.cos(soma.twinkle_angle)); // a == alpha (0-1)
			a = this.p.constrain(a, 0.01, 1); // P5 doesn't like opacity ~= 0

			neuron.render_particle(a); // Effect Opacity here?

			if (a == 1) {
				soma.twinkle_angle = 0;      	// Reset angle
				soma.twinkle_bool = false;       	// Reset State
			}
		} 
		else {
			
			neuron.render_particle(1);

		}
	
		threshold = this.p.random(1); // Set threshold

		if ((soma.twinkle_bool == false) && (threshold > 0.85)) {
			soma.twinkle_bool = true;
		}
	}
}

NNN.prototype.synapse = function() {
	let threshold; 

	this.render(); // Render neurons

	for (let i = this.active_neurons.length - 1; i >= 0; i--) { // Use active_neurons
	// for (let i = 0; i >= 0; i--) { // Use active_neurons
		let neuron = this.active_neurons[i];
		let soma = neuron.nodes[0];

		if (neuron.propagate_bool) {
			neuron.propagate(soma);
		}

		threshold = this.p.random(1); // Set threshold

		if ((neuron.propagate_bool == false) && (threshold > 0.991)) {
			neuron.propagate_bool = true;
		}
	}
}

NNN.prototype.fadeIn = function() {
	this.active_neurons.forEach((neuron) => {
		neuron.fadeIn();
	});

	this.render(); // Render neurons	
}

NNN.prototype.fadeOut = function() {
	this.active_neurons.forEach((neuron) => {
		neuron.fadeOut();
	});
	
	this.render(); // Render neurons	
}

NNN.prototype.rebound_1 = function() {
	this.neurons.forEach((neuron) => {
		neuron.rebound();
	});
	
	this.render_particles(1);
}

NNN.prototype.rebound_2 = function() {	
	this.active_neurons.forEach((neuron) => {
		neuron.rebound();
	});
	
	this.render_soma(); // Render Soma	
}

NNN.prototype.last_position = function() {
	this.active_neurons.forEach((neuron) => {
		neuron.last_position();
	});
	
	this.render_soma(); // Render Soma	
}

NNN.prototype.start_position = function() {
	this.neurons.forEach((neuron) => {
		neuron.start_position();
	});
	
	this.render_particles(1);	
}

NNN.prototype.stary_night = function() {
	for (let i = 0; i < this.neurons.length/2; i++) { // Use 1/2 total neurons
		let soma = this.neurons[i].nodes[0];
			soma.reset_prop.pow_center();
			soma.space(this.somas, _scatter_multiplier_3); // Repel from center
	}

	this.render_particles(1);
}

NNN.prototype.twinkle_2 = function() {
	let step = this.p.PI / 30;
	let threshold;
	let a;

	neuro_loop: // label
	for (let i = this.p.floor(this.neurons.length / 2 - 1); i >= 0; i--) {
		let neuron = this.neurons[i];
		let soma = neuron.nodes[0];
			
		if (soma.twinkle_bool) {
			soma.twinkle_angle += step; 
			a = this.p.abs(this.p.cos(soma.twinkle_angle)); // a == alpha (0-1)
			a = this.p.constrain(a, 0.01, 1); // P5 doesn't like opacity ~= 0

			neuron.render_particle(a); // Effect Opacity here?

			if (a == 1) {
				soma.twinkle_angle = 0;      	// Reset angle
				soma.twinkle_bool = false;       	// Reset State
			}
		} 
		else {
			
			neuron.render_particle(1);

		}
	
		threshold = this.p.random(1); // Set threshold

		if ((soma.twinkle_bool == false) && (threshold > 0.85)) {
			soma.twinkle_bool = true;
		}
	}
}

NNN.prototype.rebound_3 = function() {	
	for (let i = this.p.floor(this.neurons.length / 2 - 1); i >= 0; i--) {
		let neuron = this.neurons[i];
		neuron.rebound();
		neuron.render_particle(1);
	}
}

NNN.prototype.rebound_4 = function() {	
	this.brainiac.rebound_brain();
}

NNN.prototype.render_brain = function() {
	this.brainiac.animate();
}

NNN.prototype.render_brain_lines = function() {
	this.brainiac.animate();
	this.brainiac.render_svg();
}

NNN.prototype.plague = function() {
	this.brainiac.animate();
	this.brainiac.render_svg();
	this.brainiac.grow();
	this.brainiac.render_dendrite();	
}

NNN.prototype.fadeOut_brain_lines = function() {
	this.brainiac.fade_svg_lines();
}


// Add neuron to the network
NNN.prototype.add_neuron = function(count) {
		let x, y;

		for (let i = 0; i < count; i++) {
			// Set Neuron Soma Position (Root)
			// For some reason the y value must lean towards less?
			x = (window.innerWidth / 2) + this.p.random(-10,10);
			y = (window.innerHeight / 2) + this.p.random(-15,0);

			this.num_branches = 7;

			this.max_depth = this.complexity - this.num_branches;
			// Given a constant branching speed, this controls neuron size
			// does not effect morphology.
			// Grow time is inversely proportional to num_branches
			if (window.innerWidth < 500) {
				this.neuron_timer = 1000 / this.num_branches;	
			} 
			else {
				this.neuron_timer = this.time_power / this.num_branches;
			}

			this.neurons.push(
				new Neuron ({
					x: 				x,
					y: 				y,
					num_branches: 	this.num_branches,
					neuron_timer: 	this.neuron_timer,
					max_depth: 		this.max_depth,
					id:  			this.neuron_id,
					p: 				this.p,
				})	
			);

			// Increase the id counter each loop
			this.neuron_id++;

			// Get the soma setup
			let soma = this.neurons[this.neurons.length - 1]; // --> 1st soma in [0] position
				soma.neuron_start();
				this.somas.push(soma.nodes[0]);

		}
	}

// Remove neuron + soma from the network
NNN.prototype.remove_neuron = function(id) {
	for (let i = 0; i < this.neurons.length; i++) {
		let neuron = this.neurons[i];
		if (neuron.id == id) {
			this.neurons.splice(i, 1);
			this.somas.splice(i, 1);
		}
	}
}

// Calculate initial separation forces for NNN
NNN.prototype.spread = function() {

	this.somas.forEach( (soma) => {
		// Find soma for each neuron
		soma.separate(this.somas);
	});
}

// Add dendrite to the brain network
NNN.prototype.add_dendrite = function(pos, heading, velocity) {

	// Set Dendrite Position (Root)
	let x = pos.x,
		y = pos.y,
		num_branches = 1, // We're creating dendrites, so only [1] branch
		max_depth = 10,
		neuron_timer;

	// Given a constant branching speed, NNN.prototype controls dendrite size
	// does not effect morphology.
	// Grow time is inversely proportional to num_branches
	neuron_timer = 350;

	this.dendrites.push(
		new Neuron ({
			x: 				x,
			y: 				y,
			num_branches: 	num_branches,
			neuron_timer: 	neuron_timer,
			max_depth: 		max_depth,
			id:  			this.dendrite_id,
			p: 				this.p,
		})	
	);

	this.dendrite_id++;

	// Get the soma setup
	let root = this.dendrites[this.dendrites.length - 1]; // --> 1st root in [0] position
		root.neuron_start();
		root.dendrite_setup(heading, velocity);
		this.roots.push(root.nodes[0]);

}

// Create MST --> Kruskal
// Additionally create spring connections
// Use closure to onceify()
NNN.prototype.mst = function() {
	let graph = {
		V: [],
		E: [],
	};

	// Calculate distance from/to every Soma
	// Build MST input graph
	this.somas.forEach((soma) => {
		let soma_pos = soma.position;
		graph.V.push(
			soma.neuron_id.toString()
		);
		this.somas.forEach((other_soma) => {
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
		let n1 = this.somas[edge[0]];
		let n2 = this.somas[edge[1]];
		// Make new Spring object
		let s = new Spring ({
			node1: n1,
			node2: n2,
			p: this.p,
		});
		// Add a new spring 
		this.springs.push(s);
	}

	let mst = this.kruskal.mst(graph.V, graph.E);

	let vertices = mst[0]; // Array of Edge objects
	let edges = mst[1]; // Array of Vertex objects

	edges.forEach((edge) => {
		getSprung(edge);
	});

	function empty_fn() {

	}

	return empty_fn();

}

module.exports = NNN;

