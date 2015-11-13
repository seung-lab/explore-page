// Growing Neurons
// Alex Norton :: 2015
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (P5js)

// Running the sketch in instance mode, don't forget to preface all P5 methods with { p }
var sprout = function (p) {
	// Global Variables
	// 
	// Nnn Object
	var nnn;  // There are no types in js --> declare as var --> initialize with "new" keyword and type
	// int
	var counter = 0;
	var mxn = 0;
	var avg = 0;
	var all_nodes = 0;
	var nnn_count;

	// Global font reference
	var fontRegular;

	// Preload any required assets
	p.preload = function() {
		// Load font
		fontRegular = p.loadFont("assets/WhitneyHTF-Medium.otf");
	}

	p.setup = function() {
		p.createCanvas(window.innerWidth, window.innerHeight);
		p.frameRate(30);

		// Set font characterists
		p.push();
			p.textFont(fontRegular);
		p.pop();

		// Calculate nnn_count based on width
		// 2000 yields 20
		nnn_count = p.ceil(p.min((p.width / 100), 25));
		// nnn_count = 1;

		network_start();
	}

	p.draw = function() {
		p.background(27,39,49);
		// Run the nnn
		nnn.run();


		// plus_minus();
		iterate();

		// if (nnn.done()) recurse();

	}

	network_start = function() {
		// Initialize the nnn with args[0] = neuron amount, args[1] = general complexity, args[2] = 'p' instance
		nnn = new Nnn ({
			num_neurons: nnn_count,
			complexity:  12,
			p:           p,
		});

		nnn.initialize();
	}

	plus_minus = function() {
		if (p.frameCount % 1080 == 0) {
			// if (counter > 0) console.log("Node #" + nnn.neurons[0].nodes.length);
			// console.log("");
			nnn.remove_neuron(nnn_count);
			nnn.add_neuron(nnn_count);
			counter++;
			// console.log("Neuron #" + counter);
			// console.log("Branches #" + nnn.neurons[0].num_branches);
			// console.log("Max Depth #" + nnn.neurons[0].max_depth);
		}
	}

	iterate = function() {
		if (p.frameCount % 1000 == 0) {
			avg = avg_node(nnn.neurons[0]);
			network_start();
			counter++;
			// p.noLoop();

		}
	}

	recurse = function() {
		// var neuron = nnn.neurons[p.round(p.random(nnn.neurons.length))];
		nnn.neurons.forEach(function(neuron){
			neuron.nodes.forEach(function(n) {
				if (n.leaf) {
					neuron.adj(n).forEach(function(nn) {
						nn.size = true;
					});
					// console.log(neuron.adj(n));
				}
			});
		});
	}


	// Quick Max Calc : Returns Integer
	max_node = function(n) {
		if (n.nodes.length > mxn) mxn = n.nodes.length;
		return mxn;
	}

	// Quick Avg Calc : Returns Integer
	avg_node = function(n) {
		all_nodes += n.nodes.length;
		avg = p.round(all_nodes / (counter+1));
		return avg;
	}

	// User Interactions
	mousePressed = function() {
		mousePos = p.createVector(p.mouseX, p.mouseY);
		nnn.add_neuronn(p.mousePos);
	}

	p.keyPressed = function() {
		if (p.keyCode == p.UP_ARROW) {
			recurse();
		} 
		return false; // prevent default
	}

}

// Instantiate the entire P5 sketch
new p5(sprout);


