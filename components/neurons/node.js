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
function Node (args) {
	args = args || {};

	// Private arguments from constructor
	var p = args.p;

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
	var radius = 0;
	var wandertheta = 0;
	var wan_const = 0;
	var maxspeed = 1.5;       // Default 2
	var maxforce = p.random(0.8,1);    // Default 0.05
	var damping = 0.85;
	var pow = 1000; // Huge starting multipliers!

	// Increment for each instantiation at a branch event
	this.depth++;

	// Ensures that the definition of leaf is fresh
	this.isLeaf = function () {
		var _this = this;
		return _this.children.length === 0;
	};

	// var n :: Node()
	this.addChild = function(n) {
		var _this = this;
		n.parent = _this;
		_this.children.push(n);
	} 

	// var n :: Node()
	this.addParent = function(n) {
		var _this = this;
		n.addChild(_this);
	}

	// Set curve points
	this.pt_0 = function() {
		var _this = this;
		var p_0 = p.createVector();
		if (_this.depth == 1 || _this.depth == 2) {
			p_0 = _this.position; 
			return p_0;
		} 
		else {
			return p_0.set(_this.parent.parent.position.x,_this.parent.parent.position.y);
		}
	}

	this.pt_1 = function() {
		var _this = this;
		var p_1 = p.createVector();
		var isAlone =  _this.parent instanceof Node;
		if (!isAlone) {
			p_1 = _this.start.copy(); 
			return p_1;
		} 
		else {
			return p_1.set(_this.parent.position.x,_this.parent.position.y);
		}
	}

	this.pt_2 = function() {
		var _this = this;
		var p_2 = p.createVector();
		return p_2.set(_this.position.x, _this.position.y);
	}

	this.pt_3 = function() {
		var _this = this;
		var p_3 = p.createVector();
		if (_this.children.length == 1) {
			return p_3.set(_this.children[0].position.x,_this.children[0].position.y);
		} 
		else if (this.children.length > 1) {
			for (var i = 0; i < _this.children.length; i++) {
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
		var _this = this;
		var wanderR = 25;         						// Radius for our "wander circle"
		var wanderD = 80;         						// Distance for our "wander circle"
		var change = 0.3;
		
		wandertheta += p.random(-change,change);   // Randomly change wander theta

		// Now we have to calculate the new position to steer towards on the wander circle
		var circleloc = _this.velocity.copy();    		// Start with velocity
			circleloc.normalize();            			// Normalize to get heading
			circleloc.mult(wanderD);          			// Multiply by distance
			circleloc.add(_this.position);               // Make it relative to boid's position

		var h = _this.velocity.heading();        		// We need to know the heading to offset wandertheta

		var circleOffSet = p.createVector(
			wanderR * p.cos(wandertheta + h), 
			wanderR * p.sin(wandertheta + h)
		);
		var target = p5.Vector.add(circleloc, circleOffSet);

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
		var _this = this;
		var _target = target.copy();
		
		_target.sub(_this.position);  // A vector pointing from the position to the _target

		// Normalize _target and scale to maximum speed
		_target.normalize();

		if (_this.distribute) {
			// Calculate distance from center
			var center = p.createVector(p.width/2, p.height/2);
			var cd = p.abs(p5.Vector.dist(_this.position, center));
			target.div(cd*cd*cd*cd*cd); // Weight by distance
		}

		_target.mult(maxspeed);
		// Steering = Desired minus Velocity
		_target.sub(_this.velocity);
		_target.limit(maxforce);  // Limit to maximum steering force

		return _target;
	}

	// Separation
	// Method checks for nearby nodes and steers away
	// Accepts Array as input
	// If called as spring, accepts neighbor_nodes object

	this.separate = function(nodes) {
		var _this = this;
		var desiredseparation = 25.0;
		var steer = p.createVector(0,0);
		var count = 0;
		var node;

		// For every node in the system that is a leaf, check if it's too close
		nodes.forEach(function(other) {

		  	if (_this.distribute) {
		  		// If we're in spring mode, desired separation = distance from this to other
		  		// Update desiredseparation to match starting position of adjacency list
		  		desiredseparation = radius;
		  	}
	  		
	  		// Calc distance from growing nodes
	  		// Or the displacement of the system given a window resize event
	  		// Maybe even a mouse over c:
			var d = p5.Vector.dist(_this.position, other.position);	
			
			// If the distance is greater than 0 and less than an arbitrary amount (0 when you are yosurself)
			if ((d > 0) && (d < desiredseparation)) {
				// Calculate vector pointing away from neighbor
				var diff = p5.Vector.sub(_this.position,other.position);
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
			steer.mult(maxspeed);
			steer.sub(_this.velocity);
			steer.limit(maxforce);
		}

		return steer;
	}

	// Calculate force away from area
	// Weight by Distance
	// Inverse Square
	this.check_edges = function() {
		var _this = this;
		var x,y;
		var force = p.createVector();
		var mult_x = 1;
		var mult_y = 1;

		// Calculate 'x' edge offset
		if (_this.position.x < p.width / 2) {
			x = _this.position.x + radius;
		}
		else {
			x = p.width - _this.position.x + radius;
			mult_x = -1;
		}

		// Calculate 'y' edge offset
		if (_this.position.y < p.height / 2) {
			y = _this.position.y + radius;
		}
		else {
			y = p.height - _this.position.y + radius;
			mult_y = -1;
		}

		x = Math.max(x, 0.01);
		y = Math.max(y, 0.01);

		// Inverse Square
		x = mult_x / x;
		y = mult_y / y;

		// Set position
		force.set(x,y);

		return force;
	}

	// Calculate force away from area
	// Weight by Distance
	// Inverse Square
	/*
	this.check_area = function(u,v) {
		var _this = this;
		var x,y;
		var force = p.createVector();

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
		x = 1 / x * x;
		y = 1 / y * y;

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
		var _this = this;
		radius = rad;
		// Center point
		var center = p.createVector(p.width/2, p.height/2);

		// Set distribute to true
		_this.distribute = true;

		// Test Radius
		_this.render_radius();
		
		var cen = _this.seek(center).mult(-1); // Simply seek away from center
		var edg = _this.check_edges(); // Move away from edges
		var sep = _this.separate(somas); // Move away from eachother

		// Carefully weight these forces
		cen.mult(pow);
		edg.mult(pow);
		sep.mult(pow);

		// Add the force vectors to acceleration
		_this.applyForce(cen);
		_this.applyForce(edg);
		_this.applyForce(sep);

		pow *= 0.9;
		if (pow <= 1) {
			pow = 0;
		}
	}

	// We accumulate a new acceleration each time based on three rules
	// Accepts an Array of Node objects
	this.expand = function(nodes) {
		var _this = this;
		var sep = _this.separate(nodes);      				// Separation
		var ini = _this.seek(_this.findRoot(_this)).mult(-1); 	// Root Node (multiply by -1 to repel)
		var wan = _this.wander();             				// Wander

		// Carefully weight these forces
		sep.mult(1);
		ini.mult(1);
		wan.mult(wan_const);

		// Add the force vectors to acceleration
		_this.applyForce(sep);
		_this.applyForce(ini);
		_this.applyForce(wan);
	}

	// Simple method to sum forces
	// Accepts P5.Vector
	this.applyForce = function(force) {
		var _this = this;
		var _force = force;
		// In spring mode, weight each nodes response by mass
		if (_this.sprung) {
			// _force.div(_this.mass);
		}
		_this.acceleration.add(_force);
	}

	// Method to update position
	this.update = function() {
		var _this = this;
		// Update velocity
		_this.velocity.add(_this.acceleration);
		// If we are a spring, at friction (lower energy)
		if(_this.sprung) {
			_this.velocity.mult(damping);
			maxspeed = 100;
		}

		if (_this.velocity.magSq() < 0.1)  _this.velocity.mult(0); 

		// Limit speed
		_this.velocity.limit(maxspeed);
		_this.position.add(_this.velocity);
		// Reset accelertion to 0 each cycle
		_this.acceleration.mult(0);
	}

	// Draw a dot at position
	this.render = function() {
		var _this = this;
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

		// Draw Soma
		p.push();
			// p.fill(41,59,73); // blue
			p.fill(200); // white
			if (_this.depth == 2) p.ellipse(_this.pt_1().x,_this.pt_1().y,15,15);
		p.pop();
		// Debug Neighborhood
		p.push();
			// p.noStroke();
			// p.fill(255,10);
			// p.ellipse(_this.position.x,_this.position.y,50,50);
			// p.fill(255,255);
		p.pop();

	}

	this.render_radius = function() {
		var _this = this;

		// Render Radius
		// console.log(radius);
		p.push();
			p.fill(200,100);
			p.ellipse(_this.position.x, _this.position.y, radius, radius);
		p.pop();
	}

	// Accepts an Array of Node Objects
	this.grow = function(nodes) {
		var _this = this;
		if (_this.isGrowing()) {
			_this.tick();
			_this.expand(nodes);
			_this.update();
			// Display Wandering Debug

			// Make leaves go crazy on final level
			if (_this.depth == (_this.max_depth - 1)) {
				wan_const = 0.5;
			}
		} else  {
			_this.dw = false;
		}
	}

	// Recurse through nodes to root
	// Accepts Node object
	// Returns p5.Vector object
	this.findRoot = function(n) {
		var _this = this;
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
		var _this = this;
		if (n.parent == null) {
			return n;
		}
		else {
			return _this.findSoma(n.parent);
		}
	}

	// Calc T(--)
	this.sub_t = function (mxd) {
		var tt = mxd / 1.5;
		return tt;
	}

	// Did the timer run out?
	// Returns boolean --> Growing?
	this.tick = function () {
		var _this = this;
		if ((_this.depth == 2) || (_this.depth == 3)) {
			_this.timer -= p.round(p.random(2,_this.sub_t(_this.max_depth)));;
		} 
		else {
			_this.timer--;
		}
	}

	this.isGrowing = function() {
		var _this = this;
		if (_this.timer >= 0) {
			// Set branch point
			return true;
		} 

		return false;
	}

	this.parentIdx = function() {
		var _this = this;

		if (_this.parent) {
			var c;
			for (var i = 0; i < _this.parent.children.length; i++) {
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
		var _this = this;
		// Render meta information on vertex
		var str_id = String(_this.id + ":" + _this.mass);
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
		var _this = this;
		var ndist,
			n;
		var min1_ref = nodes[0]; 	// Inititial + Arbitrary Min Distance Values
		var min2_ref = nodes[1]; 	// Inititial + Arbitrary Min Distance Values

		// Set neuron to be a spring
		_this.sprung = true;

		// Create + Add a Spring object to springs array
		function getSprung(node) {
			// Make new Spring object
			var s = new Spring ({
				node1: _this,
				node2: node,
				p: p,
			});
			// Add a new spring 
			_this.springs.push(s);
		}

		

		// Check for child nodes, add to the adjacency list
		// for (var i = 0; i < _this.children.length; i++) {
		// 	// Create a new spring 
		// 	getSprung(_this.children[i]);
		// }

		// // Check for parent nodes, add to adjaceny list
		if (_this.parent) {
			// Create a new spring 
			getSprung(_this.parent);
		}

		/*

		// First sort
		if (distFrom(min2_ref) < distFrom(min1_ref)) {
			min1_ref = nodes[1];
			min2_ref = nodes[0];
		}

		NEIGHBOR: for (var i = 2; i < nodes.length; i++){
			
			n = nodes[i];
			
			// Make sure the node isn't already in our list
			for (var j = 0; j < _this.springs.length; j++) {
				if (n.id == _this.springs[j].node2.id) {
					continue NEIGHBOR;
				}
			}
			// Avoid adding self to list
			if (n.id == _this.id) {
				continue NEIGHBOR;
			}
			// Check only nodes on same level
			if (n.depth !== _this.depth) {
				continue NEIGHBOR;
			}
			// Check for 2 closest nodes that are not also parent or child
			if (distFrom(n) < distFrom(min1_ref)) {
				min2_ref = min1_ref;
				min1_ref = n;
			} 
			else if (distFrom(n) < distFrom(min2_ref)) {
				min2_ref = n;
			}
		}

		// Add closest 2 neurons to neighborhood
		getSprung(min1_ref);
		getSprung(min2_ref);

		*/

		

		var new_spring = _this.leftNode();


		if (new_spring && new_spring.id !== _this.id) {
			getSprung(new_spring);
		}
		
	}

	this.leftNode = function (depthx) {

		if (this.id === 0) {
			return null;
		}

	    depthx = depthx === undefined ? 0 : depthx;

	    var parentsC = this.parent.children;
	    var parentIdx = null;

	    for (var i = 0; i < parentsC.length; i++) {
	        var other = parentsC[i];

	        if (other.id === this.id) {
	            parentIdx = i;
	        }
	    };

	    // left most = 0

	    if (parentIdx > 0 || this.parent.parent === undefined) {
	        return parentsC[(parentIdx - 1).mod(parentsC.length)].rightMost(depthx);
	    } else {
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
		var _this = this;
		if(p.mouseIsPressed) {
			var mousePos = p.createVector(p.mouseX, p.mouseY);

			// Move soma
			var soma = _this.findSoma(_this);
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
		var _this = this;
		_this.repel();
		_this.update();
		// _this.meta();
		// Find position, then stop moving! --> Each resize event
		// if (damping > 0.1) damping *= 0.98;
	}

	// Create a new dendrite at the current position, but change direction by a given angle
	// Returns a new Node object
	this.branch = function(angle, id) {
		var _this = this;
		// What is my current heading
		var theta = _this.velocity.heading();

		// New mass = square root of previous (hopefully all single operations :)
		var new_mass = Math.max(1,(_this.mass /2));

		// What is my current speed
		// Can't see how this could be faster
		var mag = _this.velocity.mag();
		// Turn me
		theta += p.radians(angle);
		// Polar coordinates to cartesian!!
		var newvel = p.createVector(mag * p.cos(theta),mag * p.sin(theta));

		// Create a new Node instance
		var node = new Node ({
			neuron_timer: 	_this.neuron_timer * p.random(0.8,0.85),
			max_depth: 		_this.max_depth,
			position: 		_this.position,
			velocity: 			  newvel,
			depth: 			_this.depth,
			mass: 				  1,
			id:   				  id,
			p: 					  p,
		});
		
		_this.addChild(node);
		_this.leaf = false;
		// Return a new Node
		return node;
	}
}


Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};
