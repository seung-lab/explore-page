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
	this.boutons = [];

	let _this = this;

	let list = false;

	// Call methods to access outside of class this way!
	this.neuron_start = function () {
		let start_velocity = p.createVector(0,0); // Change this value to determine simulation speed
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

	this.network_setup = Utils.onceify(function() {
		// Get things moving
		let v = p.round(-2,2);
		let n = _this.nodes[0];
			n.velocity.set(v,v);
			n.size == true;

		let theta = p.TWO_PI / _this.num_branches;  
		// Random rotational offset constant
		let theta_const = p.random(p.TWO_PI); 
		let start_angle;

		// Create seed dendritees
		for (let i = 0; i < _this.num_branches; i++) {
			// Create a unique initial offset velocity heading for each branch with respect to the total
			// number of seed branches, for additional diversity, add a random rotational offset
			start_angle = (theta * i) + p.radians(p.random(-15, 15)) + theta_const;
			// Convert from polar to cartesian coordinates
			// let x = p.cos(start_angle);
			// let y = p.sin(start_angle);
			// Branch a bunch of times
			_this.nodes.push(
				n.branch(p.degrees(start_angle, _this.nodes.length), i + 1)
			);
		}
	});

	// Render the Neurons + Nodes
	this.render = function() {
		let n;
		
		for (let i = _this.nodes.length - 1; i >= 1; i--) {
			n = _this.nodes[i];
			n.render();
		}

		// Special Case for Soma
		_this.nodes[0].render_soma(15);

		// Add boutons --> Synapses to boutons of neuron :: Could definitely be improved
		_this.boutons.forEach(function (bouton) {
			bouton.display(); 
		});
	}

	this.done = function() {
		let n;
		
		for (let i = _this.nodes.length - 1; i >= 1; i--) {
			n = _this.nodes[i];
			if (n.isGrowing()) {
				return false;
			}
		}

		// When we're finished growing, springify all the nodes
		if (!list) {
			// Once neuron has completed, create adjacency list
			// _this.nodes.forEach(function(n){
			// 	n.springify(_this.nodes);
			// 	// n.neighbor_nodes.forEach(function(neighbor) {
			// 	// 	console.log("Node #" + n.id + " : Neighbor : " + neighbor.node + " ID : " + neighbor.id + " Distance From : " +neighbor.distance);
			// 	// });
			// });

			_this.calc_alp();
			list = true;

		}

		return true;

	}

	// Send impulses down neuron branches
	this.propagate = function() {

		_this.nodes.forEach(function(node) {

		});

		// let segment = 
	}

	this.calc_arc_length = function(curve_pts, segments) {
		let arc_length_1;
		let arc_length_2;
		let error;

		function get_length(curve_pts, segments) {
			let points = [];
			let p1 = curve_pts[1];	// Curve Points
			let p2 = curve_pts[2];
			let c1 = curve_pts[0]; // Control Points
			let c2 = curve_pts[3];
			let arc_length = 0;
			
			for (let i = 0; i <= segments; i++) { // Get points on curve
				let step = 1 / segments;
					step *= i; 
				let x = p.curvePoint(p1.x, c1.x, c2.x, p2.x, step); // Find point on curve
				let y = p.curvePoint(p1.y, c1.y, c2.y, p2.y, step); // Find point on curve
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

	this.calc_alp = function() {
		let error = 1;
		let segments = 2;
		let speed = 15; // Assign constant speed for impulse to move

		_this.nodes.forEach(function(node) {

			if (node.id == 0) {
				return;
			}

			let arc_length = _this.calc_arc_length(node.curve_pts, 1);
			node.alp.push(speed/arc_length);
			console.log("Neuron:" + _this.id +" Node:" + node.id + " Arc Length:" + arc_length + " ALP: " + node.alp);

		});
	}

	this.fadeOut = function() {
		_this.nodes.forEach(function(n){
			if (!n.id == 0) {
				n.fill = $;
			}
		});	
	}

	// Following growing, we update
	this.update = function() {
		// Once neuron has completed, create adjacency list
		_this.nodes.forEach(function(n){
			n.relax();
		});	

	}

	this.create_bouton = Utils.onceify(function() {
		let n;
		
		for (let i = _this.nodes.length - 1; i >= 1; i--) {
			// Get the Node object, update and draw it
			n = _this.nodes[i];
			if (!n.leaf) {
				return;
			}
			_this.boutons.push(
				new Bouton ({
					position: n.position,
					p: p,
				})
			);
		};
	});

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
					// Default rnd = 15% : could be push higher
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

}

module.exports = Neuron;






