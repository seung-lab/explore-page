// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for defining the spring interactions between nodes

let p5 = require('p5');

// Constructor
function Spring (args = {}) {
	let p = args.p || p5;

	// Initialize spring with 2 Nodes and a resting length
	// For now, we'll precalculate
	// No, calculate resting length on instantiation
	this.node1 = args.node1 || {};
	this.node2 = args.node2 || {};

	// Spring constant
	let _k = 0.2;

	// console.log("1: " + this.node1.id + " + 2: " + this.node2.id);

	this.delta_position = function() {
		let _this = this;
		return p5.Vector.sub(_this.node1.position, _this.node2.position);
	} 

	// Starting delta (p5.Vector)
	this.rest_delta = this.delta_position();

	// Calculate spring force between neighbors
	this.neighbor = function() {
		let _this = this;
		// Vector pointing from anchor to bob location
		let force = _this.delta_position();
		// Compare our current force with rest_delta	
		let displacement = p5.Vector.sub(_this.rest_delta, force);

		// Calculate force according to Hooke's Law
		// F = _k * stretch
		// force.normalize();
		displacement.mult(_k);
		// force.mult(-1 * _k * displacement);

		_this.node1.applyForce(displacement);	//
		displacement.mult(-1); 			// Mult (-1) so they attract || repel !
		_this.node2.applyForce(displacement);
	}

	this.update = function() {
		let _this = this;
		// Update springs
		_this.neighbor();
	}

	this.display = function() {
		let _this = this;
		// some vector magic
		// create point halfway down line
		// let midpt = p5.Vector.lerp(_this.node1.position,_this.node2.position, 0.5);

		// let mid_heading = midpt.heading();

		p.push();
			p.strokeWeight(1);
			p.stroke(255, 0, 0, 100);
		
			// Direction Lines
			p.line(
				_this.node1.position.x,
				_this.node1.position.y,
				_this.node2.position.x,
				_this.node2.position.y
			);
		p.pop();
	}
}

module.exports = Spring;

