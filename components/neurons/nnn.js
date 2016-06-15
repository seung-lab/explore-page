
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

	this.neurons = [];
	this.active_neurons = []; 	// Bounded Neurons
	this.somas = []; 			// Array of all somas included in the NNN
	this.time_power; 			// Power Multiplier

	this.max_depth;
	this.num_branches;
	this.neuron_timer;
	this.neuron_id = 0;
	
	this.dendrites = [];
	this.roots = [];
	this.dendrite_id = 0;

	this.growing = true;
	this.buffer = false;

	this.initialized = false;

	let _this = this;

	this.brainiac = (function() {

		let center = new p5.Vector(p.width/2, p.height/2),
			vertices = _this.brain.vertices,
			pos = p.createVector(),
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

		function animate() {
			if (speed > 3) speed -= 3;

			vertices.forEach((v) => {
				v.maxspeed = speed;
				v.arrive(v.brain_pos);
				v.update();
			});
		}

		function points() {
			p.push();
				p.noStroke();
				p.fill(115,135,150);
				vertices.forEach((v) => {
					v.render_soma(5);
				});
			p.pop();
		}

		function lines() {
			p.push();
				p.noFill();
				p.strokeWeight(2);
				p.stroke(115,135,150);
				_this.brain.render.lines();
			p.pop();
		}

		function connect() {
			p.push();
				p.noFill();
				p.strokeWeight(2);
				_this.brain.render.connect();
			p.pop();
		}

		function rebound_brain_update() {
			vertices.forEach((v) => {
				v.rebound();
			});				
		}

		function rebound_brain_render() {
			let center = p.createVector(p.width/2, p.height/2),
				dist_sq,
				alpha;

			p.push();
				p.noStroke(); // Soma Style
				vertices.forEach((v) => {
					dist_sq = _this.distance_sq(center, v.position);
					
					if (dist_sq < 10000) {
						alpha = p.map(dist_sq, 0, 10000, 0, 1);
					} else {
						alpha = 1;
					}

					let fill_val = 'rgba(115,135,150,' + p.str(alpha) + ')';
					p.fill(fill_val);

					v.render_soma(5);
				});				
			p.pop();
		}

		function fade_svg_lines() {
			// Fade Brain SVG	
			p.noFill();
			p.strokeWeight(2);
			_this.brain.render.fade_beziers();
			_this.brain.render.points();
		}

		//--------------- Closure Exports

		return { 
			reset: function() {
				alpha = 0,
				speed = 100;
			},
			animate: function() {
				animate();
			},
			connect: function() {
				connect();
			},
			points: function() {
				points();
			},
			lines: function() {
				lines();
			},
			fade_svg_lines: function() {
				fade_svg_lines();
			},
			rebound_brain_update: function() {
				rebound_brain_update();
			},
			rebound_brain_render: function() {
				rebound_brain_render();
			},
		};

	})();

	// Setup => Image Buffer
	this.drawMan = (function() {

		let canvas = _this.p.canvas;
		let image,
			imageData,
			alphaData,
			alpha;

		let ctx = canvas.getContext('2d');
		let w = canvas.width,
			h = canvas.height;

		function createBuffer() {
			image = ctx.getImageData(0,0,w,h);
			imageData = image.data;

			alphaData = new Uint8ClampedArray(imageData.length);

			// set every fourth value -> alpha to new value
			for (let i = imageData.length - 1; i >= 3; i -= 4) {
			    alphaData[i] = imageData[i]; // Reference original value
			}

			alpha = 1;
		}

		function fadeIn() {
			if (typeof image === "undefined") {
			    return; // Be aware this needs to be defined
			}
			// set every fourth value -> alpha to new value
			for (let i = imageData.length - 1; i >= 3; i -= 4) { 
				imageData[i] = Math.trunc(alphaData[i] * (1 - alpha));
			}

			alpha *= 0.75; // experimentally determined

			if (alpha < 0.0001) {
				alpha = 0;
			}

			alpha = Math.max(alpha, 0);
		}

		function fadeOut() {
			if (typeof image === "undefined") {
			    return; // Be aware this needs to be defined
			}

			// set every fourth value -> alpha to new value
			for (let i = imageData.length - 1; i >= 3; i -= 4) { 
				imageData[i] = Math.trunc(imageData[i] * alpha);
			}

			alpha *= 0.975; // experimentally determined

			if (alpha < 0.0001) {
				alpha = 0;
			}

			alpha = Math.max(alpha, 0);
		}

		return {
			createBuffer: function() {
				createBuffer(); // Closure Stuffs
			},
			drawBuffer: function() {
				if (typeof image === "undefined") {
				    return; // Be aware this needs to be defined
				}

				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.putImageData(image, 0, 0);
			},
			clearBuffer: function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			},
			fadeIn: function() {
				fadeIn();
			},
			fadeOut: function() {
				fadeOut();
			},
			fade_reset: function() {
				alpha = 1;
			},
			zero_alpha: function() {
				if (typeof image === "undefined") {
				    return; // Be aware this needs to be defined
				}
				// set every fourth value -> alpha to 0
				for (let i = imageData.length - 1; i >= 3; i -= 4) { 
					imageData[i] = 0;
				}
			},
			isEmpty: function() {
				if (typeof image === "undefined") {
				    return true;
				}
				else {
					return false;
				}
			}
		}

	})();	 
}

// Private Globals
let _scatter_multiplier_1,
	_scatter_multiplier_2,
	_scatter_multiplier_3;

// ------------------------------------------------
// Animation | Scatter

NNN.prototype.scatter_update = function() {
	this.neurons.forEach((neuron) => {
		let soma = neuron.nodes[0];
			soma.space(this.somas, _scatter_multiplier_1); // Repel from center
			neuron.first_position.set(soma.position); // Continously set starting position
	});
}

NNN.prototype.scatter_render = function() {
	this.render_particles();
}

NNN.prototype.scatter_init = function() {
	this.neurons.forEach((neuron) => {
		let soma = neuron.nodes[0];
			soma.reset_power();
			soma.distribute = true;
		
		let x = this.p.width / 2 + this.p.random(-2,2);
		let y = this.p.height / 2 + this.p.random(-2,2); 

			neuron.position.set(x,y); 	// Tightly pack neurons for better spread
			soma.position.set(x,y); 	// Align neuron & soma
	});
}

// ------------------------------------------------
// Animation | Scatter_2

NNN.prototype.scatter_2_update = function() {
	this.neurons.forEach((neuron) => {
		let separation = 250; // Experimentally determined
		let soma = neuron.nodes[0];
			soma.space(this.somas, _scatter_multiplier_2, separation); // Repel from center + eachother
	});
}

NNN.prototype.scatter_2_render = function() {
	this.render_particles();
}

NNN.prototype.scatter2_init = function() {
	this.neurons.forEach((neuron) => {
		let soma = neuron.nodes[0];
			soma.reset_power();
			soma.distribute = true;
	});
}

// ------------------------------------------------
// Animation | Grow

NNN.prototype.grow_update = function() {	
	this.active_neurons.forEach((neuron) => {
		if (this.done()) {
			return; 
		}

		neuron.grow(); // Run => Neurons
	});
}

NNN.prototype.grow_render = function() {
	this.render();
}

NNN.prototype.grow_init = function() {

	this.activate(); // Set up Neurons

	// Reset Active states
	this.active_neurons.forEach((neuron) => {
		neuron.has_boutons = false;
		neuron.boutons.length = 0;

		let soma = neuron.nodes[0];
			soma.distribute = false;
	});

	this.drawMan.clearBuffer();

	this.buffer = false; // Reset Canvas buffer
	this.growing = true; // Here we go again
}

// ------------------------------------------------
// Animation | Twinkle

NNN.prototype.twinkle_update = function() {
	// ?
}

NNN.prototype.twinkle_render = function() {
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

// ------------------------------------------------
// Animation | Synapse

NNN.prototype.synapse_update = function() {
	// ?
}

NNN.prototype.synapse_render = function() {
	let threshold;

	if (this.drawMan.isEmpty()) {
		this.render();
	}

	this.drawMan.drawBuffer();

	for (let i = this.active_neurons.length - 1; i >= 0; i--) { // Use active_neurons
		let neuron = this.active_neurons[i];
		let soma = neuron.nodes[0];

		if (neuron.propagate_bool) {
			neuron.propagate(soma);
		}

		threshold = this.p.random(1); // Set threshold

		if ((neuron.propagate_bool == false) && (threshold > 0.991)) { // Experimentally determined
			neuron.propagate_bool = true;
		}
	}
}

// Calculate ALP for Neurons
NNN.prototype.synapse_init = function() {
	// Reset Active states
	this.active_neurons.forEach((neuron) => {
		neuron.calculate_paths();
	});
}

// ------------------------------------------------
// Animation | Fade In

NNN.prototype.fadeIn_update = function() {
	this.drawMan.fadeIn();
}

NNN.prototype.fadeIn_render = function() {
	this.drawMan.drawBuffer();
	this.render_soma();
}

NNN.prototype.fade_init = function() {
	this.drawMan.fade_reset();
}

// ------------------------------------------------
// Animation | Fade Out

NNN.prototype.fadeOut_update = function() {
	this.drawMan.fadeOut();
}

NNN.prototype.fadeOut_render = function() {
	this.drawMan.drawBuffer();
	this.render_soma();
}

NNN.prototype.reverse_fade_init = function() {
	this.drawMan.fade_reset();
	this.drawMan.zero_alpha();
}

// ------------------------------------------------
// Animation | Rebound_1

NNN.prototype.rebound_1_update = function() {
	this.neurons.forEach((neuron) => {
		neuron.rebound();
	});
}

NNN.prototype.rebound_1_render = function() {	
	this.render_particles();
}

// ------------------------------------------------
// Animation | Rebound_2

NNN.prototype.rebound_2_update = function() {	
	this.active_neurons.forEach((neuron) => {
		neuron.rebound();
	});
}

NNN.prototype.rebound_2_render = function() {	
	this.render_soma(); // Render Soma	
}

// ------------------------------------------------
// Animation | Rebound_3

NNN.prototype.rebound_3_update = function() {	
	for (let i = this.p.floor(this.neurons.length / 2 - 1); i >= 0; i--) {
		let neuron = this.neurons[i];
		neuron.rebound();
	}
}

NNN.prototype.rebound_3_render = function() {	
	for (let i = this.p.floor(this.neurons.length / 2 - 1); i >= 0; i--) {
		let neuron = this.neurons[i];
		neuron.render_particle();
	}
}

// ------------------------------------------------
// Animation | Rebound_4

NNN.prototype.rebound_4_update = function() {	
	this.brainiac.rebound_brain_update();
}

NNN.prototype.rebound_4_render = function() {	
	this.brainiac.rebound_brain_render();
}

// ------------------------------------------------
// Animation | Last Position

NNN.prototype.last_position_update = function() {
	this.active_neurons.forEach((neuron) => {
		neuron.last_position();
	});
}

NNN.prototype.last_position_render = function() {
	this.render_soma(); // Render Soma	
}

// ------------------------------------------------
// Animation | Start Position

NNN.prototype.start_position_update = function() {
	this.neurons.forEach((neuron) => {
		neuron.start_position();
	});
}

NNN.prototype.start_position_render = function() {
	this.render_particles();	
}

// ------------------------------------------------
// Animation | Stary Night

NNN.prototype.stary_night_update = function() {
	for (let i = 0; i < this.neurons.length/2; i++) { // Use 1/2 total neurons
		let soma = this.neurons[i].nodes[0];
			soma.space(this.somas, _scatter_multiplier_3); // Repel from center
	}
}

NNN.prototype.stary_night_render = function() {
	this.render_particles();
}

NNN.prototype.stary_night_init = function() {
	// Reset Soma power & center multiplier for Stary_Night method
	this.neurons.forEach((neuron) => {
		neuron.nodes[0].reset_power();
		neuron.nodes[0].reset_pow_center();
	});
}

// ------------------------------------------------
// Animation | Twinkle 2

NNN.prototype.twinkle_2_update = function() {
	// ?
}

NNN.prototype.twinkle_2_render = function() {
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

// ------------------------------------------------
// Animation | Render Brain

NNN.prototype.render_brain_update = function() {
	this.brainiac.animate();
}

NNN.prototype.render_brain_render = function() {
	this.brainiac.points();
}

NNN.prototype.render_brain_init = function() {
	this.brainiac.reset();
}

// ------------------------------------------------
// Animation | Render Brain Lines

NNN.prototype.render_brain_lines_update = function() {
	this.brainiac.connect();
}

NNN.prototype.render_brain_lines_render = function() {
	this.brainiac.points();
}

// ------------------------------------------------
// Animation | Plague

NNN.prototype.plague_update = function() {
	this.brainiac.animate();
	this.brainiac.grow();
}

NNN.prototype.plague_render = function() {
	this.brainiac.connect();
	this.brainiac.render_dendrite();	
}

// ------------------------------------------------
// Animation | Fade Out Brain Lines

NNN.prototype.fadeOut_brain_lines_update = function() {
	// ?
}

NNN.prototype.fadeOut_brain_lines_render = function() {
	this.brainiac.fade_svg_lines(); // In this case update is render ? need more separation
}

// ------------------------------------------------
// Rendering

NNN.prototype.render = function() {
	
	if (!this.growing) {
		if (!this.buffer) {
			this.active_neurons.forEach((neuron) => { // Setup Canvas Buffer
				neuron.render();
			});

			this.drawMan.createBuffer();
			this.buffer = true;
		}

		this.drawMan.drawBuffer();
		return;
	}

	this.active_neurons.forEach((neuron) => {
		neuron.render();
	});
}

NNN.prototype.render_soma = function() {
	this.active_neurons.forEach((neuron) => {
		neuron.render_soma();
	});
}

NNN.prototype.render_particles = function() {
	this.neurons.forEach((neuron) => {
		neuron.render_particle();
	});
}

// ------------------------------------------------
// Methods | Utilies

// Pass in 2D Vector
NNN.prototype.distance_sq = function(v1, v2) {
	let x = Math.abs(v1.x-v2.x);
		x = Math.pow(x,2);
	let y = Math.abs(v1.y-v2.y);
		y = Math.pow(y,2);

	return x + y;
}

NNN.prototype.initialize = function() {
	// Calculate power offset
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
	this.active_neurons.length = 0; // Wipe out previous simulation

	for (let i = 0; i < this.neurons.length; i++) {

		let neuron = this.neurons[i];
			neuron.nodes.length = 1; // Wipe out previous simulation
		let soma = neuron.nodes[0];

		// Add only bounded nodes to our neuron array
		if (this.check_bounds(soma)) {
			this.active_neurons.push(neuron);
		}

		if (i === this.neurons.length - 1) {
			// Create seed branching
			this.active_neurons.forEach((active_neuron) => {
				// console.log('neuron_setup');
				active_neuron.network_setup(); 
			});

			return true;
		}
	}
}

NNN.prototype.done = function() {
	let neuron;

	for (let i = 0; i < this.active_neurons.length; i++) {
		neuron = this.active_neurons[i];
		if (!neuron.done()) {
			return false;
		}
	}

	this.growing = false;
	return true;

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
		let soma = this.neurons[this.neurons.length - 1]; // --> Set up most recent neuron created
			soma.neuron_start();
			this.somas.push(soma.nodes[0]); // --> 1st soma in [0] position

	}
}

module.exports = NNN;

