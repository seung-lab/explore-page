// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for extending a Neuron with Sum Weighted Forces across nodes
	// Contructor: 
		//  P5.Vector: 	position
		//	P5.Vector: 	velocity 
		// 	Float: 		neuron_timer
		//  Integer: 	depth --> Current depth
		// 	Integer:  	max_depth
		//  P5, 	p --> instance
	// 
"use strict";

let Utils = require('../../clientjs/utils.js'),
	p5 = require('p5'),
	Spring = require('./spring.js');

function Node (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	// Public P5.Vector objects
	this.start = args.position.copy() || p.createVector();
	this.position = args.position.copy() || p.createVector();
	this.velocity = args.velocity.copy() || p.createVector();
	
	// Public floats
	this.neuron_timer = args.neuron_timer || 0;
	this.max_depth = args.max_depth || 7;
	this.depth = args.depth || 0;
	this.mass = args.mass || 5;

	// Node ID
	this.id = args.id || 0;
	
	// Not in constructor
	this.acceleration = p.createVector(0,0);
	this.timer = this.neuron_timer;
	
	// Setup public arrays for children Nodes and Adjacency List
	this.children = [];
	this.adj_list = [];
	this.springs = [];
	
	// Public array of vectors to contain coordinates for Catmull Rom paths
	this.curve_pts = []; // 4 pts
	
	// Node Object :: Can only ever have a single parent
	this.parent == null;

	// Public Booleans
	this.leaf = true;
	this.size = false;
	this.start_point = false;
	this.dw = false; // Debugging Vel
	this.sprung = false;
	this.distribute = false;

	// Private variables
	let _radius = 0;
	let _wandertheta = 0;
	let _wan_const = 0;
	let _maxspeed = 1.5;       // Default 2
	let _maxforce = p.random(0.8, 1);    // Default 0.05
	let _damping = 0.85;
	let _pow = 5000; // Huge starting multipliers!

	// Increment for each instantiation at a branch event
	this.depth++;

	// Ensures that the definition of leaf is fresh
	this.isLeaf = function () {
		let _this = this;
		return _this.children.length === 0;
	};

	// let n :: Node()
	this.addChild = function(n) {
		let _this = this;
		n.parent = _this;
		_this.children.push(n);
	} 

	// let n :: Node()
	this.addParent = function(n) {
		let _this = this;
		n.addChild(_this);
	}

	// Set curve points
	this.pt_0 = function() {
		let _this = this;
		let p_0 = p.createVector();
		if (_this.depth == 1 || _this.depth == 2) {
			p_0 = _this.position; 
			return p_0;
		} 
		else {
			return p_0.set(_this.parent.parent.position.x,_this.parent.parent.position.y);
		}
	}

	this.pt_1 = function() {
		let _this = this;
		let p_1 = p.createVector();
		let isAlone =  _this.parent instanceof Node;
		if (!isAlone) {
			p_1 = _this.start.copy(); 
			return p_1;
		} 
		else {
			return p_1.set(_this.parent.position.x,_this.parent.position.y);
		}
	}

	this.pt_2 = function() {
		let _this = this;
		let p_2 = p.createVector();
		return p_2.set(_this.position.x, _this.position.y);
	}

	this.pt_3 = function() {
		let _this = this;
		let p_3 = p.createVector();
		if (_this.children.length == 1) {
			return p_3.set(_this.children[0].position.x,_this.children[0].position.y);
		} 
		else if (this.children.length > 1) {
			for (let i = 0; i < _this.children.length; i++) {
				p_3.add(_this.children[i].position);
			}
			p_3.div(_this.children.length);
			return p_3;
		} 
		else { // While we're growing
			return p_3.set(_this.position.x,_this.position.y);
		}

	}

	this.wander = function() {
		let _this = this;
		let wanderR = 25;         						// Radius for our "wander circle"
		let wanderD = 80;         						// Distance for our "wander circle"
		let change = 0.3;
		
		_wandertheta += p.random(-change,change);   // Randomly change wander theta

		// Now we have to calculate the new position to steer towards on the wander circle
		let circleloc = _this.velocity.copy();    		// Start with velocity
			circleloc.normalize();            			// Normalize to get heading
			circleloc.mult(wanderD);          			// Multiply by distance
			circleloc.add(_this.position);               // Make it relative to boid's position

		let h = _this.velocity.heading();        		// We need to know the heading to offset _wandertheta

		let circleOffSet = p.createVector(
			wanderR * p.cos(_wandertheta + h), 
			wanderR * p.sin(_wandertheta + h)
		);
		let target = p5.Vector.add(circleloc, circleOffSet);

		// Render wandering circle, etc. 
		if (_this.dw) _this.drawWanderStuff(_this.position, circleloc, target, wanderR);

		// Returns call to seek() and a vector object
		return _this.seek(target);

	}

	// A method just to draw the circle associated with wandering
	 this.drawWanderStuff = function(loc,circle,target,rad) {
		p.push();
			p.stroke(100); 
			p.noFill();
			p.ellipseMode(p.CENTER);
			// Outter Circle
			p.ellipse(circle.x,circle.y,rad*2,rad*2); 
			// Inner Circle
			p.ellipse(target.x,target.y,4,4);
			// Line At target location
			p.line(loc.x,loc.y,circle.x,circle.y);
			// Line from center of Circle to Target
			p.line(circle.x,circle.y,target.x,target.y);
		p.pop();
	}  

	// A method that calculates and applies a steering force towards a target
	// STEER = DESIRED MINUS VELOCITY
	// Consider using to attract towards another cell or synapse
	// Accepts P5.Vector for argument

	this.seek = function(target) {
		let _this = this;
		let _target = target.copy();
		
		_target.sub(_this.position);  // A vector pointing from the position to the _target

		// Normalize _target and scale to maximum speed
		_target.normalize();

		// if (_this.distribute) {
		// 	// Calculate distance from center
		// 	let center = p.createVector(p.width/2, p.height/2);
		// 	let cd = p.abs(p5.Vector.dist(_this.position, center));
		// 	target.div(cd*cd); // Weight by distance
		// }

		_target.mult(_maxspeed);
		// Steering = Desired minus Velocity
		_target.sub(_this.velocity);
		_target.limit(_maxforce);  // Limit to maximum steering force

		return _target;
	}

	// Separation
	// Method checks for nearby nodes and steers away
	// Accepts Array as input
	// If called as spring, accepts neighbor_nodes object

	this.separate = function(nodes) {
		let _this = this;
		let desiredseparation = 25.0;
		let steer = p.createVector(0,0);
		let count = 0;
		let node;

		// For every node in the system that is a leaf, check if it's too close
		nodes.forEach(function(other) {

		  	if (_this.distribute) {
		  		// If we're in spring mode, desired separation = distance from this to other
		  		// Update desiredseparation to match starting position of adjacency list
		  		desiredseparation = _radius;
		  	}
	  		
	  		// Calc distance from growing nodes
	  		// Or the displacement of the system given a window resize event
	  		// Maybe even a mouse over c:
			let d = p5.Vector.dist(_this.position, other.position);	
			
			// If the distance is greater than 0 and less than an arbitrary amount (0 when you are yosurself)
			if ((d > 0) && (d < desiredseparation)) {
				// Calculate vector pointing away from neighbor
				let diff = p5.Vector.sub(_this.position,other.position);
					diff.normalize();
					diff.div(d*d);        				// Weight by distance
				steer.add(diff);
				count++;             					// Keep track of how many
			}
		});
		// Average -- divide by how many
		if (count > 0) {
			steer.div(count);
		}
		// As long as the vector is greater than 0
		// Using magSq() --> to avoid square root
		if (steer.magSq() > 0) {
			// Implement Reynolds: Steering = Desired - Velocity
			steer.normalize();
			steer.mult(_maxspeed);
			steer.sub(_this.velocity);
			steer.limit(_maxforce);
		}

		return steer;
	}

	// Calculate force away from area
	// Weight by Distance
	// Inverse Square
	this.check_edges = function() {
		let _this = this;
		let x,
			y;
		let force = p.createVector();
		let mult_x = 1;
		let mult_y = 1;

		// Calculate 'x' edge offset
		if (_this.position.x < p.width / 2) {
			// x = (_this.position.x - _radius);
			x = _this.position.x;
		}
		else {
			// x = p.width - _this.position.x + _radius;
			x = p.width - _this.position.x;
			mult_x = -1;
		}

		// Calculate 'y' edge offset
		if (_this.position.y < p.height / 2) {
			// y = (_this.position.y - _radius);
			y = _this.position.y;
		}
		else {
			// y = p.height - _this.position.y + _radius;
			y = p.height - _this.position.y;
			mult_y = -1;
		}

		x = x / (p.width / 2);
		y = y / (p.height / 2);

		x = Math.max(x, 0.001);
		y = Math.max(y, 0.001);

		x = Math.min(x, p.width);
		y = Math.min(y, p.height);

		// Inverse Square
		let force_x = mult_x / (x*x);
		let force_y = mult_y / (y*y);

		// Set position
		force.set(force_x,force_y);

		return force;
	}

	// Calculate force away from area
	// Weight by Distance
	// Inverse Square
	/*
	this.check_area = function(u,v) {
		let _this = this;
		let x,y;
		let force = p.createVector();

		// Calculate 'x' edge offset
		if (_this.position.x < p.width / 2) {
			x = _this.position.x;
		}
		else {
			x = p.width - _this.position.y;
		}

		// Calculate 'y' edge offset
		if (_this.position.y < p.height / 2) {
			y = _this.position.y;
		}
		else {
			y = p.height - _this.position.y;
		}

		// Inverse Square
		x = 1 / (x * x);
		y = 1 / (y * y);

		// Set position
		force.set(x,y);

		// Apply the force!
		_this.applyForce(force);
	}
	*/

	// Calculate initial distribution forces
	// !Important --> Must be called outside of node 
	// !Important --> Requires list of nodes
	this.spread = function(somas, rad) {
		let _this = this;
		let center = p.createVector(p.width/2, p.height/2); // Center point
		
		_radius = rad;

		// Set distribute to true
		_this.distribute = true;

		// Test Radius
		_this.render_radius();
		
		let cen = _this.seek(center).mult(-1); // Simply seek away from center
		let edg = _this.check_edges(); // Move away from edges
		let sep = _this.separate(somas); // Move away from eachother

		// Carefully weight these forces
		cen.mult(_pow);
		edg.mult(_pow / 10);
		sep.mult(_pow);

		// Add the force vectors to acceleration
		_this.applyForce(cen);
		_this.applyForce(edg);
		_this.applyForce(sep);

		_pow *= 0.85;
		if (_pow <= 1) {
			_pow = 0;
			console.log('stop');
		}
	}

	// We accumulate a new acceleration each time based on three rules
	// Accepts an Array of Node objects
	this.expand = function(nodes) {
		let _this = this;
		let sep = _this.separate(nodes);      				// Separation
		let ini = _this.seek(_this.findRoot(_this)).mult(-1); 	// Root Node (multiply by -1 to repel)
		let wan = _this.wander();             				// Wander

		// Carefully weight these forces
		sep.mult(1);
		ini.mult(1);
		wan.mult(_wan_const);

		// Add the force vectors to acceleration
		_this.applyForce(sep);
		_this.applyForce(ini);
		_this.applyForce(wan);
	}

	// Simple method to sum forces
	// Accepts P5.Vector
	this.applyForce = function(force) {
		let _this = this;
		let _force = force;
		// In spring mode, weight each nodes response by mass
		if (_this.sprung) {
			// _force.div(_this.mass);
		}
		_this.acceleration.add(_force);
	}

	// Method to update position
	this.update = function() {
		let _this = this;
		// Update velocity
		_this.velocity.add(_this.acceleration);
		// If we are a spring, at friction (lower energy)
		if (_this.sprung) {
			_this.velocity.mult(_damping);
			_maxspeed = 100;
		}

		if (_this.distribute) {
			_this.velocity.mult(_damping);
			_maxspeed = 10;
		}

		if (_this.velocity.magSq() < 0.1)  _this.velocity.mult(0); 

		// Limit speed
		_this.velocity.limit(_maxspeed);
		_this.position.add(_this.velocity);
		// Reset accelertion to 0 each cycle
		_this.acceleration.mult(0);
	}

	// Draw a dot at position
	this.render = function() {
		let _this = this;
		// Basic Fractal Lines
		// p.stroke(41,59,73); // blue
		p.stroke(200); // white
		p.strokeWeight(2);
		p.noFill();
			
		// p.line(_this.start.x, _this.start.y, _this.position.x, _this.position.y);
		// Render Curves
		p.curve(
			_this.pt_0().x, _this.pt_0().y,
			_this.pt_1().x, _this.pt_1().y,
			_this.pt_2().x, _this.pt_2().y,
			_this.pt_3().x, _this.pt_3().y
		);

		// p.curve(
		// 	pts[0].x, pts[0].y,
		// 	pts[1].x, pts[1].y,
		// 	pts[2].x, pts[2].y,
		// 	pts[3].x, pts[3].y
		// );

		// For fun:
		// pts = pts
		// 	.map(function (v) {
		// 		return [v.x, v.y]
		// 	})
		// 	.reduce(function (arr, vec) {
		// 		arr.push(vec[0], vec[1])
		// 		return arr;
		// 	}, [])

		// p.curve.apply(p, pts);

		// Render Path Home
		if (_this.size) {
			p.noStroke();
			// p.fill(41,59,73); // blue
			p.fill(200); // white
			p.ellipse(
				_this.pt_1().x,
				_this.pt_1().y,
				5,
				5
			);
			p.ellipse(
				_this.position.x,
				_this.position.y,
				5,
				5
			);
		}

		if (_this.start_point) {
			p.noStroke();
			p.fill(200,0,0);
			p.ellipse(
				_this.position.x,
				_this.position.y,
				5,
				5
			);
		}

		// Debug Neighborhood
		p.push();
			// p.noStroke();
			// p.fill(255,10);
			// p.ellipse(_this.position.x,_this.position.y,50,50);
			// p.fill(255,255);
		p.pop();

	}

	this.render_soma = function() {
		let _this = this;
		// Draw Soma
		p.push();
			p.noStroke();
			// p.fill(41,59,73); // blue
			p.fill(200); // white
			p.ellipse(_this.pt_2().x,_this.pt_2().y,15,15);
		p.pop();
	}

	this.render_radius = function() {
		let _this = this;

		// Render Radius
		// console.log(_radius);
		p.push();
			p.fill(200,100);
			p.ellipse(_this.position.x, _this.position.y, _radius, _radius);
		p.pop();
	}

	// Accepts an Array of Node Objects
	this.grow = function(nodes) {
		let _this = this;
		if (_this.isGrowing()) {
			_this.tick();
			_this.expand(nodes);
			_this.update();
			// Display Wandering Debug

			// Make leaves go crazy on final level
			if (_this.depth == (_this.max_depth - 1)) {
				_wan_const = 0.5;
			}
		} else  {
			_this.dw = false;
		}
	}

	// Accepts an Array of Node Objects
	this.space = function(nodes) {
		let _this = this;
			_this.spread(nodes, 300);
			_this.update();
	}

	// Recurse through nodes to root
	// Accepts Node object
	// Returns p5.Vector object
	this.findRoot = function(n) {
		let _this = this;
		if (n.parent == null) {
			return n.position;
		}
		else {
			return _this.findRoot(n.parent);
		}
	}

	// Recurse through nodes to root
	// Accepts Node object
	// Returns Node object
	this.findSoma = function(n) {
		let _this = this;
		if (n.parent == null) {
			return n;
		}
		else {
			return _this.findSoma(n.parent);
		}
	}

	// Calc T(--)
	this.sub_t = function (mxd) {
		let tt = mxd / 1.5;
		return tt;
	}

	// Did the timer run out?
	// Returns boolean --> Growing?
	this.tick = function () {
		let _this = this;
		if ((_this.depth == 2) || (_this.depth == 3)) {
			_this.timer -= p.round(p.random(2,_this.sub_t(_this.max_depth)));;
		} 
		else {
			_this.timer--;
		}
	}

	this.isGrowing = function() {
		let _this = this;
		if (_this.timer >= 0) {
			// Set branch point
			return true;
		} 

		return false;
	}

	this.parentIdx = function() {
		let _this = this;

		if (_this.parent) {
			let c;
			for (let i = 0; i < _this.parent.children.length; i++) {
				c = _this.parent.children[i];
				if (c.id == _this.id) {
					return i;
				}
			}
		} 
		else {
			return "potato";
		}
	}

	this.meta = function() {
		let _this = this;
		// Render meta information on vertex
		let str_id = String(_this.id + ":" + _this.mass);
		p.push();
			p.fill(0,255,0).strokeWeight(0).textSize(10);
			p.text(str_id, _this.position.x, _this.position.y - 15);
		p.pop();
	}

	// Calculates adjacency list for generating tensive graph between a neighborhood of nodes
	// comprised of a parent, children and 2 closest non-related nodes
	/*

		There is a mini bug in here~!

	*/
	this.springify = function(nodes) {
		let _this = this;
		let ndist,
			n;
		let min1_ref = nodes[0]; 	// Inititial + Arbitrary Min Distance Values
		let min2_ref = nodes[1]; 	// Inititial + Arbitrary Min Distance Values

		// Set neuron to be a spring
		_this.sprung = true;

		// Create + Add a Spring object to springs array
		function getSprung(node) {
			// Make new Spring object
			let s = new Spring ({
				node1: _this,
				node2: node,
				p: p,
			});
			// Add a new spring 
			_this.springs.push(s);
		}

		// // Check for parent nodes, add to adjaceny list
		if (_this.parent) {
			// Create a new spring 
			getSprung(_this.parent);
		}		

		let new_spring = _this.leftNode();

		if (new_spring && new_spring.id !== _this.id) {
			getSprung(new_spring);
		}
		
	}

	this.leftNode = function (depthx) {

		if (this.id === 0) {
			return null;
		}

	    depthx = depthx === undefined ? 0 : depthx;

	    let parentsC = this.parent.children;
	    let parentIdx = null;

	    for (let i = 0; i < parentsC.length; i++) {
	        let other = parentsC[i];

	        if (other.id === this.id) {
	            parentIdx = i;
	        }
	    };

	    // left most = 0

	    if (parentIdx > 0 || this.parent.parent === undefined) {
	        let index = Utils.modulo((parentIdx - 1), parentsC.length);

	        return parentsC[index].rightMost(depthx);
	    }
	    else {
	        return this.parent.leftNode(depthx + 1);
	    }
	}

	this.rightMost = function (depthx) {
	    if (depthx === 0) {
	        return this;
	    }

	    return this.children[this.children.length - 1].rightMost(depthx - 1);
	}

	// Method to be called on window resize to keep nodes in tension
	// MousePos for debugging 
	this.repel = function() {
		let _this = this;
		if(p.mouseIsPressed) {
			let mousePos = p.createVector(p.mouseX, p.mouseY);

			// Move soma
			let soma = _this.findSoma(_this);
			soma.position = mousePos;

			return false;
		}
		
		// Update spring positions --> Run through array
		_this.springs.forEach(function(s) {
			s.update();
			s.display();
		});
	}

	// Method to shift nodes around
	// Only to be called once growing has completed!
	// Only to be called once springify has completed!
	this.relax = function() {
		let _this = this;
		_this.repel();
		_this.update();
		// _this.meta();
		// Find position, then stop moving! --> Each resize event
		// if (_damping > 0.1) _damping *= 0.98;
	}

	// Create a new dendrite at the current position, but change direction by a given angle
	// Returns a new Node object
	this.branch = function(angle, id) {
		let _this = this;
		// What is my current heading
		let theta = _this.velocity.heading();

		// New mass = square root of previous (hopefully all single operations :)
		let new_mass = Math.max(1,(_this.mass /2));

		// What is my current speed
		// Can't see how this could be faster
		let mag = _this.velocity.mag();
		// Turn me
		theta += p.radians(angle);
		// Polar coordinates to cartesian!!
		let newvel = p.createVector(mag * p.cos(theta),mag * p.sin(theta));

		// Create a new Node instance
		let node = new Node ({
			neuron_timer: 	_this.neuron_timer * p.random(0.8,0.85),
			max_depth: 		_this.max_depth,
			position: 		_this.position,
			velocity: 		newvel,
			depth: 			_this.depth,
			mass: 			1,
			id:   			id,
			p: 				p,
		});
		
		_this.addChild(node);
		_this.leaf = false;
		// Return a new Node
		return node;
	}
}

module.exports = Node;


