// Growing Neurons
// Alex Norton :: 2015

// Recursive Neuron (P5js)

let Easing = require('../../clientjs/easing.js'),
	Kruskal = require('./kruskal.js'),
	NNN = require('./nnn.js'), // neural network
	NeuronCoordinator = require('./NeuronCoordinator.js'), // neuron coordinator
	Neurostate = require('./neurostate.js'), // neurostate
	p5 = require('p5'),
	GLOBAL = require('../../clientjs/GLOBAL.js'),
	$ = require('jquery');

let _options = {
	width: 100,
	height: 100,
	anchor: null,
	slide_count: null,
};

let _neurostates = [],
	_progressions = [],
	_actives = [], // Animation queue
	_direction;

let _canvas = $.Deferred();

let growing = true;

// Global ref to looper()
let _looper;


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

		_direction = "forward",

	// canvas
		canvas;

	// Global font reference
	// let _fontRegular;

	// Preload any required assets
	p.preload = function () {
		// Load font
		// _fontRegular = p.loadFont(GLOBAL.base_url + "/fonts/WhitneyHTF-Medium.otf");
	};

	p.setup = function () {
		p.frameRate(30);

		canvas = p.createCanvas(_options.width, _options.height);
		canvas.parent(_options.anchor);

		_canvas.resolve(canvas.elt); // --> Will's sneaky deferred shenanigans

		// Set font characterists
		// p.textFont(_fontRegular);

		// Calculate _nnn_count based on width
		_nnn_count = p.ceil(p.min((p.width / 10), 200));
		// _nnn_count = 200;

		nnn_start();

		set_states();

		// Setup NeuronCoordinator
		NeuronCoordinator.initialize(_neurostates, _options.slide_count, p);

		console.log('starting p5...');
	};

	p.draw = function() {
		NeuronCoordinator.animate();
	}

	function nnn_start () {
		// Initialize the _nnn with args[0] = neuron amount, args[1] = general complexity, args[2] = 'p' instance
		_nnn = new NNN ({
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

	function set_states () {

		/*  Given: 9 slides
			Neurostate object to load per slide
	
			Symetrical in both directions

		*/

		_neurostates = [
			{
		        name: "Initialize",
				duration: 1,
				forward: _nnn.initialize,
				reverse: _nnn.rebound_1,
				forward_slide: 0,
				reverse_slide: 0,
				p: p
		    },
		    {
		        name: "Scatter",
				duration: 75,
				forward: _nnn.scatter,
				reverse: _nnn.twinkle,
				forward_slide: 1,
				reverse_slide: 1,
				p: p
		    },
		    {
		    	name: "Twinkle",
				duration: 1,
				forward: _nnn.twinkle,
				reverse: _nnn.rebound_2,
				loop: true,
				forward_slide: 1,
				reverse_slide: 1,
				p: p
		    },
		    {
		   		name: "Scatter2",
				duration: 125,
				forward: _nnn.scatter_2,
				reverse: _nnn.fadeout,
				forward_slide: 2,
				reverse_slide: 1,
				p: p
		    },
		    {
		    	name: "Grow",
				duration: 100,
				forward: _nnn.grow,
				reverse: _nnn.grow, // Will simply render neurons
				forward_slide: 2,
				reverse_slide: 2,
				p: p
		    },
		    {
		    	name: "Synapse",
				duration: 1,
				forward: _nnn.synapse,
				reverse: _nnn.synapse,
				loop: true,
				forward_slide: 3,
				reverse_slide: 3,
				p: p
		    },
		    {
		    	name: "Fade",
				duration: 100,
				forward: _nnn.fadeOut,
				reverse: _nnn.fadeIn,
				forward_slide: 4,
				reverse_slide: 4,
				p: p	
		    },
		    {
		    	name: "Center",
				duration: 100,
				forward: _nnn.rebound2,
				reverse: _nnn.lastPosition,
				forward_slide: 5,
				reverse_slide: 5,
				p: p	
		    },
		    {
		    	name: "Stars",
				duration: 100,
				forward: _nnn.staryNight,
				reverse: _nnn.rebound,
				forward_slide: 5,
				reverse_slide: 5,
				p: p
		    },
		    {
		    	name: "Center2",
				duration: 100,
				forward: _nnn.rebound,
				reverse: _nnn.staryNight,
				forward_slide: 6,
				reverse_slide: 6,
				p: p
		    },
		    {
		    	name: "Brain",
				duration: 100,
				forward: _nnn.brainiac,
				reverse: _nnn.rebound,
				forward_slide: 6,
				reverse_slide: 6,
				p: p
		    },
		    {
		    	name: "Connect",
				duration: 100,
				forward: _nnn.kruskal,
				reverse: _nnn.fadeOut,
				forward_slide: 7,
				reverse_slide: 7,
				p: p	
		    },
		    {
		    	name: "Drake",
				duration: 100,
				forward: _nnn.plague,
				reverse: _nnn.fadeOut,
				forward_slide: 8,
				reverse_slide: 8,
				p: p
		    }
		];

		_neurostates = _neurostates.map(function (args) {
		    return new Neurostate(args);
		});	
	}

	_looper = function () {
		p.loop();
		console.log("Sketch is running, looping");
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
	_options.slide_count = args.slide_count;

	_canvas = $.Deferred();

	return new p5(sprout); // Instantiate the entire P5 sketch
};

module.exports.updateState = function (t) {
	if (!NeuronCoordinator.initialized) {
		return;
	}

	NeuronCoordinator.updateT(t);

	// Get things moving again
	_looper(); 
};

module.exports.canvas = function () {
	return _canvas;
};

