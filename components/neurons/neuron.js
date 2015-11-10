// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// A class for a leaf that gets placed at the position of 
// the last branches

// Contructor: P5.Vector, Integer, Float, Integer
function Neuron (args) {
	args = args || {};

	// Private arguments from constructor
	var p = args.p;
	
	// Public arguments from constructor
	this.position = p.createVector(args.x, args.y)    	|| p.createVector(0,0);
	this.num_branches = args.num_branches 				|| 7;
	this.neuron_timer = args.neuron_timer 				|| 60;
	this.max_depth = args.max_depth 	  				|| 6;

	// Generic public array variable : not an argument though
	this.growing = true;
	// Setup public arrays and add one dendrite to it
	this.nodes = [];
	this.leaves = [];

	var list = false;

	// Call methods to access outside of class this way!
	this.neuron_setup = function() {
		var _this = this;
		var start_velocity = p.createVector(0,0); // Change this value to determine simulation speed
		// Create a new Node instance
		var n = new Node ({
					neuron_timer: 	_this.neuron_timer,
					max_depth: 		_this.max_depth,
					position: 		_this.position,
					velocity: 			  start_velocity,
					depth: 				  0,
					mass: 				  128, //Huge mass for soma!
					id: 				  0,
					p: 					  p,
				});	
		// Add to arraylist
		_this.nodes.push(n); 

	}

	this.network_setup = function() {
		var _this = this;
		 
		 // Get things moving
		 var n = _this.nodes[0];
		n.velocity.set(2,2);
		n.size == true;

		var theta = p.TWO_PI / _this.num_branches;  
		// Random rotational offset constant
		var theta_const = p.random(p.TWO_PI); 
		var start_angle;

		// Create seed dendritees
		for (var i = 0; i < _this.num_branches; i++) {
			// Create a unique initial offset velocity heading for each branch with respect to the total
			// number of seed branches, for additional diversity, add a random rotational offset
			start_angle = (theta * i) + p.radians(p.random(-15, 15)) + theta_const;
			// Convert from polar to cartesian coordinates
			// var x = p.cos(start_angle);
			// var y = p.sin(start_angle);
			// Branch a bunch of times
			_this.nodes.push(
				n.branch(p.degrees(start_angle, _this.nodes.length), i + 1) // No need for ';'
			);
		}

	}

	// Render the Neurons + Nodes
	this.render = function() {
		var _this = this;
		var n;

		// Special Case for Soma
		_this.nodes[0].render();
		
		for (var i = _this.nodes.length - 1; i >= 1; i--) {
			n = _this.nodes[i];
			n.render();
		}

		// Add boutons --> Synapses to leaves of neuron :: Could definitely be improved
		_this.leaves.forEach(function (synapse) {
			// synapse.display(); 
		});
	}

	this.done = function() {
		var _this = this;
		var n;
		
		for (var i = _this.nodes.length - 1; i >= 1; i--) {
			n = _this.nodes[i];
			if (n.isGrowing()) {
				return false;
			}
		}

		// When we're finished growing, springify all the nodes
		if (!list) {
			// Once neuron has completed, create adjacency list
			_this.nodes.forEach(function(n){
				n.springify(_this.nodes);
				// n.neighbor_nodes.forEach(function(neighbor) {
				// 	console.log("Node #" + n.id + " : Neighbor : " + neighbor.node + " ID : " + neighbor.id + " Distance From : " +neighbor.distance);
				// });
			});

			list = true;

		}

		return true;

	}

	// Following growing, we update
	this.update = function() {
		var _this = this;
		
		// Once neuron has completed, create adjacency list
		_this.nodes.forEach(function(n){
			n.relax();
		});	

	}

	this.grow = function() {
		var _this = this;
		var n;

		// Let's stop when the neuron gets too deep
		// For every dendrite in the arraylist
		for (var i = _this.nodes.length - 1; i >= 1; i--) {
			// Get the Node object, update and draw it
			n = _this.nodes[i];
			n.grow(_this.nodes);

			if (n.isGrowing()) {
				continue;
			}

			if (n.depth >= _this.max_depth) {
				_this.leaves.push(
					new Synapse ({
						position: n.position,
						p: p,
					})
				);
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
					// Neuron feels slightly over complicated given complexity: 13 & min [5] branches
					var rnd = p.random(1);
					if ((rnd < 0.15) && ((n.depth + 1) < _this.max_depth )) {
						_this.nodes.push(n.branch(-20, _this.nodes.length));    // Add one going right
						_this.nodes.push(n.branch(20, _this.nodes.length));   // Add one going left
					} 
					else {
						// Added leaves to end of Neuron --> Can be vastly improved to consider
						// the entire 'distal' zone of the neuron.
						_this.nodes.push(
							// n.branch(p.round(p.random(-20,20)))
							n.branch(0, _this.nodes.length) // Not missing ';'
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
			var path = parents.slice();
			if (n.parent == null) {
				return path;
			} 
			else {
				path.push(n.parent);
				return recurseMore(n.parent, path);
			}
		}

		// Make a 'shallow' copy of an array
		// I see what I'm doing, but it requires refactoring
		// n.start_point = true;
		var parent_arr = [];
			parent_arr.push(n.parent);
		return recurseMore(n, parent_arr);
	}

	// Calculate the average radius of neuron
	// Wrap it in cacheify() to cache first returned value
	this.radius = Utils.cacheify(function() {
		var _this = this;
		var avg_radius = 0;
		var total_radius = 0;
		var leaf_count = 0;

		// Look through all the leaf nodes
		_this.nodes.forEach(function(node) {
			if (node.leaf) {
				// Calculate the distance from leaf to soma
				total_radius += p5.Vector.dist(node.position, _this.nodes[0].position);
				leaf_count++;
			}
		});

		// Take average of total radius
		avg_radius = p.floor(total_radius / leaf_count);
		console.log(avg_radius);

		return avg_radius;
	});

}






















