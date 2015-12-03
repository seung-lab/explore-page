// Recursive Tree (w/ ArrayList)

// A class for a leaf that gets placed at the position of 
// the last branches

// Contructor: P5.Vector, P5.p
"use strict";

let _img

function Bouton (args = {}) {
	// Private arguments from constructor
	let p = args.p;
	if (_img === undefined) {
		// debugger;
		_img = p.loadImage(GLOBAL.base_url + "/images/test.jpg");
	}

	// 'this' keyword sets the variable to public visibility
	this.position = args.position || 0;

	// Method to display the leaves :: "Boutons"
	// 
	// Should be improved to stochastically distribute the boutons along
	// the length of 'distal' zone --> Monte Carlo
	// 
	// By placing 'this' infront of the function name 'display'  it is now
	// accessible outside of the scope of the object.
	this.display = function () {
		p.noStroke();
		p.fill(115,135,150);
		p.ellipse(
			this.position.x,
			this.position.y,
			3,
			3
		);   
		// p.image(_img, this.position.x, this.position.y);
	};
}

module.exports = Bouton;