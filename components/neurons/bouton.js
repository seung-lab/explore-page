// Recursive Tree (w/ ArrayList)

// A class for a leaf that gets placed at the position of 
// the last branches

"use strict";

function Bouton (args = {}) {
	// Private arguments from constructor
	let p = args.p;
	
	this.position = args.position || 0;

	// Method to display the leaves :: "Boutons"
		
		// Should be improved to stochastically distribute the boutons along
		// the length of 'distal' zone --> Monte Carlo
		
		// By placing 'this' infront of the function name 'display'  it is now
		// accessible outside of the scope of the object.

	this.display = function () {
		p.ellipse(
			this.position.x,
			this.position.y,
			3,
			3
		);   
	}
}

module.exports = Bouton;