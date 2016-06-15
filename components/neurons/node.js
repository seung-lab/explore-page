// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for extending a Neuron with Sum Weighted Forces across nodes

"use strict";

let Utils = require('../../clientjs/utils.js'),
	p5 = require('p5'),
	Spring = require('./spring.js');

function Node (args = {}) {
	// Private arguments from constructor
	let p = args.p;


	// Public P5.Vector objects
	this.start = args.position.copy() 		|| p.createVector();
	this.position = args.position.copy() 	|| p.createVector();
	this.brain_pos = args.brain_pos 		|| p.createVector();
	this.velocity = args.velocity.copy() 	|| p.createVector();
	
	this.neuron_timer = args.neuron_timer 	|| 0;
	this.max_depth = args.max_depth 		|| 7;
	this.depth = args.depth 				|| 0;
	
	this.id = args.id 						|| 0;
	this.neuron_id = args.neuron_id 		|| 0;

	this.maxspeed = 2.5;       	  			// Default 2

	this.acceleration = p.createVector(0,0);
	this.timer = this.neuron_timer;

	// Neuro_star
	this.twinkle_angle = 0;
	this.twinkle_bool = false;
	
	// Setup public arrays for children Nodes and Adjacency List
	this.children = [];
	this.adj_list = [];
	this.springs = [];
	
	// Public array of vectors to contain coordinates for Catmull Rom paths
	this.curve_pts = []; // 4 pts
	this.p_0 = p.createVector();
	this.p_1 = p.createVector();
	this.p_2 = p.createVector();
	this.p_3 = p.createVector();

	this.alp; // Arc Length Parameterization for propagation of impulses
	this.t = 0 // Distance along segment
	
	// Node Object :: Can only ever have a single parent
	this.parent == null;

	// Public Booleans
	this.leaf = true;
	this.size = false;
	this.start_point = false;
	this.dw = false; // Debugging Vel
	this.bound = false;
	this.center = false;
	this.distribute = false;

	let _this = this;

	// Setup curve array
	_this.curve_pts[0] = _this.p_0;
	_this.curve_pts[1] = _this.p_1;
	_this.curve_pts[2] = _this.p_2;
	_this.curve_pts[3] = _this.p_3;

	// Private variables
	let _wandertheta = 0;
	let _wan_const = 0.5;
	let _reboundspeed = 10;       // Default 2
	let _maxforce = 0.85;

	let _center = p.createVector(p.width/2, p.height/2); // Center point

	this.pow = 1;
	let _damping = 0.85;

	// Increment for each instantiation at a branch event
	this.depth++;


	// --------------------------------------------
	// Method-Man

	// Reset power for Scatter methods
	this.reset_power = function() {
			_this.pow = 1;
	}

	// Reset position to center in case resize
	this.reset_pow_center = function() {
		_this.position.x = p.width / 2 + p.random(-2,2);
		_this.position.y = p.height / 2 + p.random(-2,2);
	}

	// Ensures that the definition of leaf is fresh
	this.isLeaf = function () {
		return _this.children.length === 0;
	};

	// let n :: Node()
	this.addChild = function(n) {
		n.parent = _this;
		_this.children.push(n);
	} 

	// let n :: Node()
	this.addParent = function(n) {
		n.addChild(_this);
	}

	this.set_curve_pts = function() {
		pt_0();
		pt_1();
		pt_2();
		pt_3();
		
		// Set curve points
		function pt_0() {
			if (_this.depth == 1 || _this.depth == 2) {
				_this.p_0.x = _this.position.x; // Using p5.Vector.set() is super slow!
				_this.p_0.y = _this.position.y;
			} 
			else {
				_this.p_0.x = _this.parent.parent.position.x;
				_this.p_0.y = _this.parent.parent.position.y;
			}

			return _this.p_0;

		}

		function pt_1() {
			let isAlone =  _this.parent instanceof Node;
			if (!isAlone) {
				_this.p_1 = _this.start.copy(); 
			} 
			else {
				_this.p_1.x = _this.parent.position.x;
				_this.p_1.y = _this.parent.position.y;
			}

			return _this.p_1;

		}

		function pt_2() {
			_this.p_2.x = _this.position.x;
			_this.p_2.y = _this.position.y;
			return _this.p_2;
		}

		function pt_3() {
			if (_this.children.length == 1) {
				_this.p_3.x = _this.children[0].position.x;
				_this.p_3.y = _this.children[0].position.y;
			} 
			else if (_this.children.length > 1) {
				for (let i = 0; i < _this.children.length; i++) {
					_this.p_3.add(_this.children[i].position);
				}

				_this.p_3.div(_this.children.length);

			} 
			else { // While we're growing
				_this.p_3.x = _this.position.x;
				_this.p_3.y = _this.position.y;	
			}

			return _this.p_3;
		}
	} 

	this.wander = function() {
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

	// ------------------------------------------------
	// Seek

		// A method that calculates and applies a steering force towards a target
		// STEER = DESIRED MINUS VELOCITY
		// Consider using to attract towards another cell or synapse
		// Accepts P5.Vector for argument

	this.seek = function(target) {

		let _target = target.copy();
		
		_target.sub(_this.position);  	// A vector pointing from the position to the _target
		_target.normalize();			// Normalize _target

		_target.mult(_this.maxspeed);	// Scale to maximum speed
		_target.sub(_this.velocity);	// Steering = Desired minus Velocity
		_target.limit(_maxforce);  		// Limit to maximum steering force

		return _target;
	}

	// ------------------------------------------------
	// Arrive

		// A method that calculates a steering force towards a target
		// Similar to seek, but this reduces force the end
		// STEER = DESIRED MINUS VELOCITY

	this.arrive = function(target) {

		let _target = target.copy();
		
		_target.sub(_this.position);  	// A vector pointing from the position to the _target
		let distance = _target.mag();

		_target.normalize();

		if (distance < 100) { 			// Scale with arbitrary damping within 100 pixels
				if ( distance < 1) {
					return true;
				}
			let m = p.map(distance, 0, 100, 0, 100);
			if (m < 2) m = 0.25;
			_target.mult(m);
		} else {
			_target.mult(_this.maxspeed);
		}

		_target.sub(_this.velocity);	// Steering = Desired minus Velocity
		_target.limit(12);  			// Limit to maximum steering force
		
		_this.applyForce(_target);		// Apply force here, so we can return true

	}

	// ------------------------------------------------
	// Separation

		// Method checks for nearby nodes and steers away
		// Accepts Array as input
		// If called as spring, accepts neighbor_nodes object

	this.separate = function(nodes, distribute) {
		let desiredseparation = 100.0;
		let steer = p.createVector(0,0);
		let count = 0;
		let node;

		// For every node in the system check if it's too close
		nodes.forEach(function(other) {

		  	if (distribute) {
		  		desiredseparation = 250;
		  	}
	  		
	  		// Calc distance from growing nodes
			let d = p5.Vector.dist(_this.position, other.position);	
			
			// If the distance is greater than 0 and less than an arbitrary amount (0 avoid self)
			if ((d > 0) && (d < desiredseparation)) {
				// Calculate vector pointing away from neighbor
				let diff = p5.Vector.sub(_this.position,other.position);
					diff.normalize();
					diff.div(d*d);      				// Weight by distance (inverse square)

				steer.add(diff);
				count++;             					// Keep track of how many
			}
		});

		if (count > 0) {
			steer.div(count);
		}

		if (steer.magSq() > 0) { 	// Implement Reynolds: Steering = Desired - Velocity
			steer.normalize();
			steer.mult(_this.maxspeed);
			steer.sub(_this.velocity);
			steer.limit(_maxforce);
		}

		return steer;
	}

	// ------------------------------------------------
	// Check Edges

		// Calculate force away from area
		// Weight by Distance
		// Inverse Square

	this.check_edges = function() {
		let x,
			y;
		let force = p.createVector();
		let mult_x = 1;
		let mult_y = 1;

		if (_this.position.x < p.width / 2) {
			x = _this.position.x;
		}
		else {
			x = p.width - _this.position.x;
			mult_x = -1;
		}

		if (_this.position.y < p.height / 2) {
			y = _this.position.y;
		}
		else {
			y = p.height - _this.position.y;
			mult_y = -1;
		}

		x = x / (p.width / 2);
		y = y / (p.height / 2);

		x = Math.max(x, 0.001);
		y = Math.max(y, 0.001);

		x = Math.min(x, p.width);
		y = Math.min(y, p.height);

		let force_x = mult_x / (x*x);
		let force_y = mult_y / (y*y);

		force.set(force_x,force_y);

		return force;
	}

	// ------------------------------------------------
	// Spread

		// Calculate initial distribution forces
		// !Important --> Must be called outside of node 
		// !Important --> Requires list of nodes

	this.spread = function(somas, multiplier, distribute) {
		_this.distribute = true;
		
		let cen = _this.seek(_center).mult(-1); 		// Simply seek away from center
		let sep = _this.separate(somas, distribute); 	// Move away from eachother
		// let edg = _this.check_edges(); 				// Move away from edges

		let aspect_ratio = p.height / p.width;
		
		cen.y *= aspect_ratio;
		sep.y *= aspect_ratio;
		// edg.y = edg.y * aspect_ratio;

		cen.mult(_this.pow * multiplier);
		sep.mult(_this.pow * multiplier);
		// edg.mult(_this.pow * 1.25);

		_this.applyForce(cen);
		_this.applyForce(sep);
		// _this.applyForce(edg);

		let pm = p.max(p.height, p.width);
			pm = p.map(pm, 400, 3000, 0.8, 0.95);

		_this.pow *= pm;

		if (_this.pow <= .01) {
			_this.pow = 0;
		}
	}

	// ------------------------------------------------
	// Expand

		// We accumulate a new acceleration each time based on three rules
		// This is the primary influence during neuron growth + development
		// Accepts an Array of Node objects

	this.expand = function(nodes) {
		let sep = _this.separate(nodes, "leaf");      			// Separation
		let ini = _this.seek(_this.findRoot(_this)).mult(-1); 	// Root Node (multiply by -1 to repel)
		let wan = _this.wander();             					// Wander

		// Carefully weight these forces
		sep.mult(1);
		ini.mult(1);
		wan.mult(_wan_const);

		// Add the force vectors to acceleration
		_this.applyForce(sep);
		_this.applyForce(ini);
		_this.applyForce(wan);
	}

	// ------------------------------------------------
	// Apply Force

		// Simple method to sum forces
		// Accepts P5.Vector

	this.applyForce = function(force) {
		let _force = force;
		_this.acceleration.add(_force);
	}

	// ------------------------------------------------
	// Update

		// Method to update node position

	this.update = function() {
	
		_this.velocity.add(_this.acceleration); // Update velocity
		
		if ((_this.sprung) || (_this.bound)) { // If we are a spring, at friction (lower energy)
			_this.velocity.mult(_damping);
			_this.maxspeed = 150;
		}

		if (_this.distribute) {
			_this.velocity.mult(_damping);
			_this.maxspeed = p.width / 35;	
		}

		if (_this.velocity.magSq() < 0.1)  _this.velocity.mult(0); 

		_this.velocity.limit(_this.maxspeed); // Limit speed
		_this.position.add(_this.velocity);
		_this.acceleration.mult(0);	// Reset accelertion to 0 each cycle
	}

	// ------------------------------------------------
	// Update Curves

	this.update_curves = function() {
		_this.set_curve_pts();
	}

	// ------------------------------------------------
	// Render

		// Render the Catmul Rom Splines

	this.render = function() {
		p.curve(
			_this.curve_pts[0].x, _this.curve_pts[0].y,
			_this.curve_pts[1].x, _this.curve_pts[1].y,
			_this.curve_pts[2].x, _this.curve_pts[2].y,
			_this.curve_pts[3].x, _this.curve_pts[3].y
		);
	}

	this.debug = function() { 
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
			p.noStroke();
			p.fill(255,10);
			p.ellipse(_this.position.x,_this.position.y,50,50);
			p.fill(255,255);
		p.pop();
	}

	this.render_soma = function(rad) {
		p.ellipse(_this.position.x,_this.position.y,rad,rad);
	}

	// ------------------------------------------------
	// Grow

		// Consolidated list of all Grow operations

	this.grow = function(nodes) {
		if (_this.isGrowing()) {
			_this.tick();
			_this.expand(nodes);
			_this.update();
			_this.update_curves();

			// Make leaves go crazy on final level
			if ((_this.depth == (_this.max_depth)) || ((_this.depth < 3) && (_this.depth !== 10))) {
				_wan_const = 0.5;
			} else  {
				_wan_const = 0;
			}
		} else  {
			_this.dw = false;
		}
	}

	// ------------------------------------------------
	// Space

		// Consolidated list of all explosive forces

	// Accepts an Array of Node Objects
	this.space = function(nodes, multiplier, distribute = false) {
		_this.spread(nodes, multiplier, distribute);
		_this.update();
	}

	// ------------------------------------------------
	// Rebound

		// Consolidated list of all return forces
		// Calculates heading to send node to center of screen

	this.rebound = function() {
		_this.bound = true;
		
		// If we have arrived, stop updating position
		if (_this.arrive(_center)) {
			_this.bound = false;
			return true;
		}

		_this.update();

	}

	// ------------------------------------------------
	// Last Position

		// Returns node back to it's original position during Grow

	this.last_position = function(loc) {
		_this.center = true;
		
		// If we have arrived, stop updating loc
		if (_this.arrive(loc)) {
			_this.max_speed = 100;
			_this.center = false;
			return true;
		}

		_this.update();

	}

	// ------------------------------------------------
	// Start Position

		// Returns node back to it's original position before Grow

	this.start_position = function(loc) {
		_this.center = true;
		
		// If we have arrived, stop updating loc
		if (_this.arrive(loc)) {
			_this.max_speed = 100;
			_this.center = false;
			return true;
		}

		_this.update();

	}

	// ------------------------------------------------
	// Find Root

		// Recurse through nodes to root
		// Accepts Node object
		// Returns p5.Vector object

	this.findRoot = function(node) {
		if (node.parent == null) {
			return node.position;
		}
		else {
			return _this.findRoot(node.parent);
		}
	}

	// ------------------------------------------------
	// Sub_T

	this.sub_t = function (mxd) {
		let tt = mxd / 0.5;
		return tt;
	} 

	// ------------------------------------------------
	// Tick

		// Did the timer run out?
		// Returns boolean --> Growing?

	this.tick = function () {
		
		if (_this.depth < 5) {
			_this.timer -= 20;
			return;
		} 
		
		_this.timer -= p.round(p.random(2,_this.sub_t(_this.max_depth)));
	}

	// ------------------------------------------------
	// isGrowing

	this.isGrowing = function() {
		if (_this.timer >= 0) {	
			return true; // Set branch point
		} 

		return false;
	}

	// ------------------------------------------------
	// Branch

		// Create a new dendrite at the current position
		// Then changes direction by a given angle
		// Returns a new Node object

	this.branch = function(angle, id) {
		let theta = _this.velocity.heading(); // Current Heading
		let mag = _this.velocity.mag(); // Current speed
		
		theta += angle; // Angle offset
		let newvel = p.createVector(mag * p.cos(theta),mag * p.sin(theta));

		let node = new Node ({
			neuron_timer: 	_this.neuron_timer * p.random(0.8,0.85),
			max_depth: 		_this.max_depth,
			position: 		_this.position,
			velocity: 		newvel,
			depth: 			_this.depth,
			id:   			id,
			p: 				p,
		});
		
		_this.addChild(node);
		_this.leaf = false;
		
		return node; // Return a new Node
	}
}

module.exports = Node;


