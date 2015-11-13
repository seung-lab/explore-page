// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Recursive Tree (w/ ArrayList)

// A class for a leaf that gets placed at the position of 
// the last branches

// Contructor: P5.Vector, P5.p
function Synapse(args) {
	args = args || {};

	// Private arguments from constructor
	var p = args.p;

	// 'this' keyword sets the variable to public visibility
	this.position = args.position.copy() || 0;

	// Method to display the leaves :: "Boutons"
	// 
	// Should be improved to stochastically distribute the boutons along
	// the length of 'distal' zone --> Monte Carlo
	// 
	// By placing 'this' infront of the function name 'display'  it is now
	// accessible outside of the scope of the object.
	this.display = function() {
		_this = this;
		p.noStroke();
		p.fill(200,200);
		p.ellipse(
			_this.position.x,
			_this.position.y,
			5,
			5
		);   
	}
}

