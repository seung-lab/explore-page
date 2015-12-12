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
let _scatter = false;
let _grow = false;
let _rebound = false;

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

		_canvas.resolve(canvas.elt); // --> Will's sneaky deferred shenanigans

		// Set font characterists
		p.push();
			p.textFont(_fontRegular);
		p.pop();

		// Calculate _nnn_count based on width
		_nnn_count = p.ceil(p.min((p.width / 10), 200));
		// _nnn_count = 200;

		nnn_start();

		console.log('starting p5...');
	};

	p.draw = function() {
		p.clear();

		// If the order is proper, we will never have to include more logic
		if (p.frameCount < 30) {
			return;
		}
		if (_rebound) {
			_nnn.rebound();
			return;
		}
		if (_grow) {
			_nnn.grow();
			console.log('grow');
			return;
		}
		if (_scatter) {
			_nnn.scatter();
			console.log('scatter');
		}
	}

	function nnn_start () {
		// Initialize the _nnn with args[0] = neuron amount, args[1] = general complexity, args[2] = 'p' instance
		_nnn = new NNN({
			num_neurons: _nnn_count,
			complexity: 13,
			kruskal: Kruskal,
			p: p,
		});

		_nnn.initialize();
	}

	function recurse () {
		_nnn.neurons.forEach(function(neuron){
			neuron.nodes.forEach(function(n) {
				if (n.leaf) {
					neuron.adj(n).forEach(function(nn) {
						nn.size = true;
					});
				}
			});
		});
	}

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

module.exports.rebound = function (yes = true) {
	_rebound = yes; // Enable neuron growth
};

module.exports.grow = function (yes = true) {
	_grow = yes; // Enable neuron growth
};

module.exports.scatter = function (yes = true) {
	_scatter = yes; // Enable neuron growth
};


module.exports.canvas = function () {
	return _canvas;
};

