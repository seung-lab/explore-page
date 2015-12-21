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
		p.frameRate(60);

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
		NeuronCoordinator.initialize(_neurostates, _options.slide_count);

		console.log('starting p5...');
	};

	p.draw = function() {
		p.clear();

		// Run the animation loop
		animate(_direction);

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
		// _neurostates = [
		//     {
		//         name: "Scatter",
		// 		duration: 30,
		// 		forward: _nnn.scatter(),
		// 		reverse: _nnn.rebound()
		//     },
		//     {
		//    		name: "Scatter2",
		// 		duration: 10,
		// 		forward: _nnn.scatter_2(),
		// 		reverse: _nnn.rebound()
		//     },
		//     {
		//     	name: "Grow",
		// 		duration: 75,
		// 		forward: _nnn.grow(),
		// 		reverse: 1
		//     }
		// ];

		/*  Given: 9 slides
			Number of Next() calls to make per slide
	
			Symetrical in both directions

		*/

		_progressions = [
			{
				0: 0
			},
			{
				1: 2
			},
			{
				2: 2
			},
			{
				3: 1
			},
			{
				4: 1
			},
			{
				5: 2
			},
			{
				6: 2
			},
			{
				7: 1
			},
			{
				8: 1
			}
		];

		_neurostates = [
		    {
		        name: "Scatter",
				duration: 30,
				forward: _nnn.scatter(),
				reverse: _nnn.rebound()
		    },
		    {
		    	name: "Twinkle",
				duration: 30,
				loop: true,
				forward: _nnn.twinkle(),
				reverse: _nnn.twinkle()
		    },
		    {
		   		name: "Scatter2",
				duration: 10,
				forward: _nnn.scatter(),
				reverse: _nnn.rebound()
		    },
		    {
		    	name: "Grow",
				duration: 75,
				forward: _nnn.grow(),
				reverse: _nnn.fadeOut()
		    },
		    {
		    	name: "Synapse",
				duration: 60,
				loop: true,
				forward: _nnn.synapse(),
				reverse: _nnn.synapse()
		    },
		    {
		    	name: "Fade",
				duration: 60,
				forward: _nnn.fadeOut(),
				reverse: _nnn.fadeIn()	
		    },
		    {
		    	name: "Center",
				duration: 30,
				forward: _nnn.rebound2(),
				reverse: _nnn.lastPosition()	
		    },
		    {
		    	name: "Stars",
				duration: 30,
				forward: _nnn.staryNight(),
				reverse: _nnn.rebound()
		    },
		    {
		    	name: "Center2",
				duration: 30,
				forward: _nnn.rebound(),
				reverse: _nnn.staryNight()
		    },
		    {
		    	name: "Brain",
				duration: 30,
				forward: _nnn.brainiac(),
				reverse: _nnn.rebound()
		    },
		    {
		    	name: "Connect",
				duration: 30,
				forward: _nnn.kruskal(),
				reverse: _nnn.fadeOut()	
		    },
		    {
		    	name: "Drake",
				duration: 30,
				forward: _nnn.plague(),
				reverse: _nnn.fadeOut()
		    }
		];

		_neurostates = _neurostates.map(function (args) {
		    return new Neurostate(args);
		});	
	}

	function animate(_direction) {

		if (!_actives.length) {
			return;
		}

		if (_direction == "forward") {
			// _actives[0].forward_progress();
			console.log(_actives[0].forward_progress());
		} 

		if (_direction == "reverse") {
			// _actives[0].reverse_progress();
			console.log(_actives[0].reverse_progress());
		}

		if (_actives[0].done) {
			_actives[0].shift();
		}

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

	var dir = NeuronCoordinator.direction(t); // Also updates _prev_t

	// Empty animation queue if we change direction
	if (_direction !== dir) {
		_actives = [];
	}

	_direction = dir;
	
	_actives.push(
		NeuronCoordinator.makeMoves(_progressions)
	);
	// console.log(_actives);
};

module.exports.canvas = function () {
	return _canvas;
};

