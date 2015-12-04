// Growing Neurons
// Alex Norton :: 2015

// Recursive Neuron (P5js)

let Easing = require('../../clientjs/easing.js'),
	Kruskal = require('./kruskal.js'),
	NNN = require('./nnn.js'), // neural network
	p5 = require('p5'),
	GLOBAL = require('../../clientjs/GLOBAL.js'),
	$ = require('jquery');

let _options = {
	width: 100,
	height: 100,
	anchor: null,
};

let _canvas = $.Deferred();
let _runtime = false;

// Running the sketch in instance mode, don't forget to preface all P5 methods with { p }
let sprout = function (p) {
	// Global Variables
	// 
	// Nnn Object
	let _nnn = null, 
	
	// int
		_counter = 0,
		_mxn = 0,
		_avg = 0,
		_all_nodes = 0,
		_nnn_count = 0,

	// canvas
		canvas;

	// bools
	let running = false;

	// Global font reference
	let _fontRegular;

	// Preload any required assets
	p.preload = function () {
		// Load font
		_fontRegular = p.loadFont(GLOBAL.base_url + "/fonts/WhitneyHTF-Medium.otf");
	};

	p.setup = function () {
		p.frameRate(60);

		canvas = p.createCanvas(_options.width, _options.height);
		canvas.parent(_options.anchor);

		_canvas.resolve(canvas.elt);

		// Set font characterists
		p.push();
			p.textFont(_fontRegular);
		p.pop();

		// Calculate _nnn_count based on width
		// _nnn_count = p.ceil(p.min((p.width / 60), 30));
		_nnn_count = p.ceil(p.min((p.width / 10), 200));
		// _nnn_count = 200;

		nnn_start();
	};

	p.draw = function() {
		p.clear();

		// Run the _nnn if it has finished spreading
		if (_runtime) {
			_nnn.run();
			running = true;
		}

		if ((p.frameCount > 30) && (!running)) {
			_nnn.distribute_1();
		}

		// plus_minus();
		// iterate();

		// if (_nnn.done()) recurse();
	}

	function nnn_start () {
		// Initialize the _nnn with args[0] = neuron amount, args[1] = general complexity, args[2] = 'p' instance
		_nnn = new NNN({
			num_neurons: _nnn_count,
			complexity: 12,
			kruskal: Kruskal,
			p: p,
		});

		_nnn.initialize();
	}

	function plus_minus () {
		if (p.frameCount % 1080 === 0) {
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
		if (p.frameCount % 1000 === 0) {
			_avg = avg_node(_nnn.neurons[0]);
			nnn_start();
			_counter++;
			// p.noLoop();

		}
	}

	function recurse () {
		// let neuron = _nnn.neurons[p.round(p.random(_nnn.neurons.length))];
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
		if (n.nodes.length > _mxn) {
			_mxn = n.nodes.length;
		}

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
		let mousePos = p.createVector(p.mouseX, p.mouseY);
		_nnn.add_neuron(mousePos);
	}

	// p.keyPressed = function () {
	// 	if (p.keyCode === p.UP_ARROW) {
	// 		recurse();
	// 	} 

	// 	return false; // prevent default
	// }

	// Deal with resize events
	window.onresize = function() { 
		$(canvas).width(window.innerWidth)
			     .height(window.innerHeight);
	}
}

module.exports.init = function (args = {}) {
	_options.anchor = args.anchor;
	_options.width = args.width;
	_options.height = args.height;

	_canvas = $.Deferred();

	return new p5(sprout); // Instantiate the entire P5 sketch
};

module.exports.grow = function (yes = true) {
	_runtime = yes; // Enable neuron growth

};


module.exports.canvas = function () {
	return _canvas;
};

