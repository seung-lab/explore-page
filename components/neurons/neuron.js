// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for a leaf that gets placed at the position of 
// the last branches

// Contructor: P5.Vector, Integer, Float, Integer

let p5 = require('p5'),
	Node = require('./node.js'),
	Bouton = require('./bouton.js');

function Neuron (args) {
	args = args || {};

	// Private arguments from constructor
	let p = args.p;
	
	// Public arguments from constructor
	this.position = p.createVector(args.x, args.y)    	|| p.createVector(0,0);
	this.num_branches = args.num_branches 				|| 7;
	this.neuron_timer = args.neuron_timer 				|| 0;
	this.max_depth = args.max_depth 	  				|| 6;
	this.id = args.id 									|| 0;

	// Generic public array variable : not an argument though
	this.growing = true;
	// Setup public arrays and add one dendrite to it
	this.nodes = [];

	// Position of neuron after scattering finished
	this.first_position = p.createVector();
	this.final_position = p.createVector();
	this.has_boutons = false;
	this.boutons = [];

	this.propagate_bool = false; // Are we propagating?
	this.alpha = 1; // Opacity

	let _this = this;

	this.neuron_start = function () {
		let start_velocity = p.createVector(); // Change this value to determine simulation speed

		// Create a new Node instance
		let n = new Node ({
			neuron_timer: 	_this.neuron_timer,
			max_depth: 		_this.max_depth,
			position: 		_this.position,
			velocity: 		start_velocity,
			depth: 			0,
			radius: 		_this.radius(),
			mass: 			128, // Huge mass for soma!
			id: 			0,
			neuron_id:      _this.id,
			p: 				p,
		});	

		// Add to arraylist
		_this.nodes.push(n); 
	}

	this.network_setup = function() {
		// Get things moving
		let v = p.round(-2,2);
		let node = _this.nodes[0];
			node.velocity.set(v,v);
			node.size == true;

		let theta = p.TWO_PI / _this.num_branches;  
		// Random rotational offset constant
		let theta_const = p.random(p.TWO_PI); 
		let start_angle;

		// Create seed dendrites
		for (let i = 0; i < _this.num_branches; i++) {
			// Create a unique initial offset velocity heading for each branch with respect to the total
			// number of seed branches, for additional diversity, add a random rotational offset
			start_angle = (theta * i) + p.radians(p.random(-15, 15)) + theta_const;
			// Convert from polar to cartesian coordinates
			// let x = p.cos(start_angle);
			// let y = p.sin(start_angle);
			// Branch a bunch of times
			_this.nodes.push(
				node.branch(p.degrees(start_angle, _this.nodes.length), i + 1)
			);
		}
	}

	this.dendrite_setup = function(heading, velocity) {
		// Get things moving
		let node = _this.nodes[0];
			node.velocity.set(velocity.x,velocity.y);
			node.size == true;

		// Create seed dendrites
		for (let i = 0; i < _this.num_branches; i++) {
			// Create a unique initial offset velocity heading for each branch with respect to the total
			// number of seed branches, for additional diversity, add a random rotational offset
			_this.nodes.push(
				node.branch(0, i + 1)
			);
		}
	}

	// Render the Neurons + Nodes
	this.render = function() {
		let node;

		// Dendrite Style
		let stroke_val = 'rgba(41,59,73,' + p.str(_this.alpha) + ')';
		p.stroke(stroke_val);
		p.strokeWeight(2);
		p.noFill();
		
		for (let i = _this.nodes.length - 1; i >= 1; i--) {
			node = _this.nodes[i];
			node.render();
		}

		// Soma Style 
		p.noStroke();
		p.fill(115,135,150); // blue

		_this.nodes[0].render_soma(15);

		//  Bouton Style
		let fill_val = 'rgba(115,135,150,' + p.str(_this.alpha) + ')';
		p.fill(fill_val);
		p.noStroke();

		// Add boutons --> Synapses to boutons of neuron :: Could definitely be improved
		_this.boutons.forEach(function (bouton) {
			bouton.display(); 
		});
	}

	// Render only Soma
	this.render_soma = function(a = 0) {
		let center = p.createVector(p.width/2, p.height/2),
			alpha;		

		if (a === 0) {
			let	dist_sq = _this.distance_sq(center, _this.nodes[0].position);

			if (dist_sq < 10000) {
				alpha = p.map(dist_sq, 0, 10000, 0, 1);

				if (alpha < 0.05) {
					alpha = 0;
				}
			} else {
				alpha = 1;
			}
		} else {
			alpha = a;
		}

		let fill_val = 'rgba(115,135,150,' + p.str(alpha) + ')';
		
		p.noStroke();
		p.fill(fill_val);

		_this.nodes[0].render_soma(15);
	}

	// Render Soma, as particle
	this.render_particle = function(a = 0) {
		let center = p.createVector(p.width/2, p.height/2),
			alpha;		

		if (a === 0) {
			let	dist_sq = _this.distance_sq(center, _this.nodes[0].position);

			if (dist_sq < 10000) {
				alpha = p.map(dist_sq, 0, 10000, 0, 1);

				if (alpha < 0.05) {
					alpha = 0;
				}
			} else {
				alpha = 1;
			}
		} else {
			alpha = a;
		}

		let fill_val = 'rgba(115,135,150,' + p.str(alpha) + ')';
		
		p.noStroke();
		p.fill(fill_val);

		_this.nodes[0].render_soma(5);
	}

	this.done = function() {
		let node;
		
		for (let i = _this.nodes.length - 1; i > 0; i--) {
			node = _this.nodes[i];
			if (node.isGrowing()) {
				return false;
			}
		}

			// When we're finished growing, springify all the nodes
			// Once neuron has completed, create adjacency list
			/*
			_this.nodes.forEach(function(n){
				n.springify(_this.nodes);
				n.neighbor_nodes.forEach(function(neighbor) {
					console.log("Node #" + n.id + " : Neighbor : " + neighbor.node + " ID : " + neighbor.id + " Distance From : " +neighbor.distance);
				});
			});
			*/

		return true;

	}

	// Move this code to NNN?
	this.calculate_paths = function() {
			_this.calc_alp(); // Calculate Arc Length Parameterization
			_this.final_position = _this.nodes[0].position.copy();
	}

	// Adaptive Arc-Subdivision
	this.calc_arc_length = function(curve_pts, segments) {
		let arc_length_1;
		let arc_length_2;
		let error;

		function get_length(curve_pts, segments) {
			let points = [];
			let p0 = curve_pts[0];	// Curve Points
			let p1 = curve_pts[1];
			let p2 = curve_pts[2]; // Control Points
			let p3 = curve_pts[3];
			let arc_length = 0;
			
			for (let i = 0; i <= segments; i++) { // Get points on curve
				let step = 1 / segments;
					step *= i; 
				let x = p.curvePoint(p0.x, p1.x, p2.x, p3.x, step); // Find point on curve
				let y = p.curvePoint(p0.y, p1.y, p2.y, p3.y, step); // Find point on curve
				points.push(p.createVector(x,y));
			}

			for (let i = 1; i < points.length; i++) { // Apointsroximate arc length
				arc_length += p.sqrt(p.sq(points[i].x - points[i-1].x) + p.sq(points[i].y - points[i-1].y));
			}

			return arc_length;

		}
		
		arc_length_1 = get_length(curve_pts, segments);
		arc_length_2 = get_length(curve_pts, segments*2);

		// Calculate percent error
		function calc_error(less_precise, more_precise) {
			return p.abs((less_precise - more_precise)/ more_precise) * 100
		}

		error = calc_error(arc_length_1, arc_length_2);
		// console.log("Arc Length 1: " + arc_length_1 + " Arc Length 2: " + arc_length_2 + " Percent Error: " + error + "%");

		if (error > 0.1) {
			// console.log("Significant Error");
			segments *= 2;
			arc_length_2 = _this.calc_arc_length(curve_pts, segments); // Recussively call until error < 5%
		}

		return arc_length_2;

	}

	// Calculate Arc-Length Parameterization
	this.calc_alp = function() {
		let error = 1;
		let segments = 2;
		let speed = 5; // Assign constant speed for impulse to move

		_this.nodes.forEach(function(node) {

			if (node.id == 0) {
				return;
			}

			let arc_length = _this.calc_arc_length(node.curve_pts, 1);
			node.alp = speed / arc_length;
			// console.log("Neuron:" + _this.id +" Node:" + node.id + " Arc Length:" + arc_length + " ALP: " + node.alp);
		});
	}

	// Send impulses down neuron branches
	this.propagate = function(node) {

		propagate_recursive(node);

		return propagate_status();

		function propagate_status() {
			for (let i = _this.nodes.length - 1; i >= 1; i--) { // Start at 1 to avoid soma
				if (_this.nodes[i].t < 1) {
						return;
				}
			}

			_this.nodes.forEach(function(segment){
				segment.t = 0;
			});

			_this.propagate_bool = false; // Reset the propagation
			return; // We're done

		}

		function propagate_recursive(node) {
			node.children.forEach(function(child) {
				if (child.t < 1) {
					let p0 = child.curve_pts[0];	// Curve Points
					let p1 = child.curve_pts[1];
					let p2 = child.curve_pts[2]; // Control Points
					let p3 = child.curve_pts[3];
					
					let x = p.curvePoint(p1.x, p1.x, p2.x, p3.x, child.t); // Find x point on curve
					let y = p.curvePoint(p1.y, p1.y, p2.y, p3.y, child.t); // Find y point on curve

					propagate_render(x,y); // Render impulse

	 				child.t += child.alp; // Increment t by ALP

					return;
				}

				propagate_recursive(child); // Recurssively propagate through all children.

			});
		}

		// Debug impulse
		function propagate_debug(x,y,p0,p1,p2,p3,id,t) {
			p.push();
				p.fill(255,0,0);
				p.ellipse(x, y, 7.5, 7.5); // Impulse
				// Render Curves
				p.stroke(0,255,0); // dark blue
				p.strokeWeight(2);
				p.curve(
					p1.x, p1.y,
					p1.x, p1.y,
					p2.x, p2.y,
					p3.x, p3.y
				);
				Text
				p.fill(0, 250, 0);
				p.textSize(8);
				p.text("ID: " + id + " T: " + t, x, y);
			p.pop();
		}

		// Render impulse
		function propagate_render(x,y) {
			p.push();
				p.fill(115,135,150);
				p.ellipse(x, y, 5, 5); // Impulse
			p.pop();
		}
	}

	this.fadeOut = function() {
		if (_this.alpha > 0) {
			_this.alpha -= 0.03125; // 1/32 --> Timer
		}	
	}

	this.fadeIn = function() {
		if (_this.alpha < 0.96875) { // Watch that overflow, son
			_this.alpha += 0.03125; // 1/32 --> Timer
		}
	}

	this.rebound = function() {
		// Send the soma to the center
		_this.nodes[0].rebound();
	}

	this.last_position = function() {
		// Send the soma to the center
		_this.nodes[0].last_position(_this.final_position);	
	}

	this.start_position = function() {
		// Send the soma to the center
		_this.nodes[0].start_position(_this.first_position);	
	}

	// Following growing, we update
	this.update = function() {
		// Once neuron has completed, create adjacency list
		_this.nodes.forEach(function(n){
			n.relax();
		});	

	}

	this.create_bouton = function() {

		if (_this.has_boutons) {
			return;
		}

		// console.log('making boutons');

		let node;
		
		for (let i = _this.nodes.length - 1; i >= 1; i--) {
			node = _this.nodes[i]; // Get the Node object, update and draw it
			if (node.leaf) {
				_this.boutons.push(
					new Bouton ({
						position: node.position,
						p: p,
					})
				);
			}
		};

		_this.has_boutons = true;
	}

	this.grow = function() {
		let n;

		// Let's stop when the neuron gets too deep
		// For every dendrite in the arraylist
		for (let i = _this.nodes.length - 1; i >= 1; i--) {
			// Get the Node object, update and draw it
			n = _this.nodes[i];
			n.grow(_this.nodes);

			if (n.isGrowing()) {
				continue;
			}

			if (n.depth >= _this.max_depth) {
				_this.create_bouton();
				continue;
			}
			
			if (n.leaf) {
				// For every other node added: add one or two branches to create natural form
				// Could definitely have a better way of accessing neuron depth.. that would improve branching
				if (((n.depth + 1) % 2 == 0) && (n.depth != 2)) {
					_this.nodes.push(n.branch(-20, _this.nodes.length));    // Add one going right
					_this.nodes.push(n.branch(20,_this.nodes.length));   // Add one going left
				} 
				else {
					// Additional method for probabalistic branching
					// Default rnd = 15% : could be higher
					let rnd = p.random(1);
					if ((rnd < 0.25) && ((n.depth + 1) < _this.max_depth )) {
						_this.nodes.push(n.branch(-20, _this.nodes.length));    // Add one going right
						_this.nodes.push(n.branch(20, _this.nodes.length));   // Add one going left
					} 
					else {
						// Added boutons to end of Neuron --> Can be vastly improved to consider
						// the entire 'distal' zone of the neuron.
						_this.nodes.push(
							n.branch(0, _this.nodes.length)
						);
					} 
				}
			}
		}
	}

	this.grow2 = function() {
		let n;

		// Let's stop when the neuron gets too deep
		// For every dendrite in the arraylist
		for (let i = _this.nodes.length - 1; i >= 1; i--) {
			// Get the Node object, update and draw it
			n = _this.nodes[i];
			n.grow2(_this.nodes);

			if (n.isGrowing()) {
				continue;
			}

			if (n.depth >= _this.max_depth) {
				_this.create_bouton();
				continue;
			}
			
			if (n.leaf) {
				// For every other node added: add one or two branches to create natural form
				// Could definitely have a better way of accessing neuron depth.. that would improve branching
				if (((n.depth + 1) % 2 == 0) && (n.depth != 2)) {
					_this.nodes.push(n.branch(-20, _this.nodes.length));    // Add one going right
					_this.nodes.push(n.branch(20,_this.nodes.length));   // Add one going left
				} 
				else {
					// Additional method for probabalistic branching
					// Default rnd = 15% : could be higher
					let rnd = p.random(1);
					if ((rnd < 0.25) && ((n.depth + 1) < _this.max_depth )) {
						_this.nodes.push(n.branch(-20, _this.nodes.length));    // Add one going right
						_this.nodes.push(n.branch(20, _this.nodes.length));   // Add one going left
					} 
					else {
						// Added boutons to end of Neuron --> Can be vastly improved to consider
						// the entire 'distal' zone of the neuron.
						_this.nodes.push(
							n.branch(0, _this.nodes.length)
						);
					} 
				}
			}
		}
	}

	// Recurse through nodes to root --> Returns an array
	//  Args[0]:Node
	this.adj = function(n) {
		// Recurse through nodes to root --> Returns an array
		//  Args[0]:Node, Args[1]:Array of Nodes
		function recurseMore (n, parents) {
			// Make a 'shallow' copy of an array
			let path = parents.slice();
			if (n.parent == null) {
				return path;
			} 
			else {
				path.push(n.parent);
				return recurseMore(n.parent, path);
			}
		}
		let parent_arr = [];
			parent_arr.push(n.parent);

		return recurseMore(n, parent_arr);
	}

	this.radius = Utils.cacheify(function() {
		return this.num_branches * 40;
	});

	// Pass in 2D Vector
	this.distance_sq = function(v1, v2) {
		let x = Math.abs(v1.x-v2.x);
			x = Math.pow(x,2);
		let y = Math.abs(v1.y-v2.y);
			y = Math.pow(y,2);

		return x + y;
	}
}

module.exports = Neuron;






