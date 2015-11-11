// Growing Neurons
// Alex Norton :: 2015

// Recursive Neuron (P5js)

var Easing = require('../../clientjs/easing.js'),
	Kruskal = require('./kruskal.js'),
	NNN = require('./nnn.js'), // neural network
	p5 = require('p5');

// Running the sketch in instance mode, don't forget to preface all P5 methods with { p }
var sprout = function (anchor, p) {
	// Global Variables
	// 
	// Nnn Object
	var _nnn = null, 
	
	// int
		_counter = 0,
		_mxn = 0,
		_avg = 0,
		_all_nodes = 0,
		_nnn_count = 0;

	// Global font reference
	var fontRegular;

	// Preload any required assets
	p.preload = function () {
		// Load font
		fontRegular = p.loadFont("assets/WhitneyHTF-Medium.otf");
	};

	p.setup = function () {
		var canvas = p.createCanvas(window.innerWidth, window.innerHeight);
		p.frameRate(30);

		canvas.parent(anchor);

		// Set font characterists
		p.push();
			p.textFont(fontRegular);
		p.pop();

		// Calculate _nnn_count based on width
		// 2000 yields 20
		_nnn_count = p.ceil(p.min((p.width / 100), 25));
		// _nnn_count = 1;

		network_start();
	};

	p.draw = function() {
		p.background(27,39,49);
		// Run the _nnn
		_nnn.run();


		// plus_minus();
		iterate();

		// if (_nnn.done()) recurse();
	}

	function network_start () {
		// Initialize the _nnn with args[0] = neuron amount, args[1] = general complexity, args[2] = 'p' instance
		_nnn = new NNN({
			num_neurons: _nnn_count,
			complexity:  12,
			p:           p,
		});

		_nnn.initialize();
	}

	function plus_minus () {
		if (p.frameCount % 1080 == 0) {
			// if (_counter > 0) console.log("Node #" + _nnn.neurons[0].nodes.length);
			// console.log("");
			_nnn.remove_neuron(_nnn_count);
			_nnn.add_neuron(_nnn_count);
			_counter++;
			// console.log("Neuron #" + _counter);
			// console.log("Branches #" + _nnn.neurons[0].num_branches);
			// console.log("Max Depth #" + _nnn.neurons[0].max_depth);
		}
	}

	function iterate () {
		if (p.frameCount % 1000 == 0) {
			_avg = avg_node(_nnn.neurons[0]);
			network_start();
			_counter++;
			// p.noLoop();

		}
	}

	function recurse () {
		// var neuron = _nnn.neurons[p.round(p.random(_nnn.neurons.length))];
		_nnn.neurons.forEach(function(neuron){
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
	function max_node (n) {
		if (n.nodes.length > _mxn) _mxn = n.nodes.length;
		return _mxn;
	}

	// Quick Avg Calc : Returns Integer
	function avg_node (n) {
		_all_nodes += n.nodes.length;
		_avg = p.round(_all_nodes / (_counter+1));
		return _avg;
	}

	// User Interactions
	function mousePressed () {
		var mousePos = p.createVector(p.mouseX, p.mouseY);
		_nnn.add_neuron(mousePos);
	}

	p.keyPressed = function() {
		if (p.keyCode == p.UP_ARROW) {
			recurse();
		} 
		return false; // prevent default
	}

}

module.exports = function (anchor) {
	let bound_sprout = sprout.bind(sprout, anchor);
	return new p5(bound_sprout); // Instantiate the entire P5 sketch
};




