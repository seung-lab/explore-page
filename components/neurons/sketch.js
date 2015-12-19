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
};

let _canvas = $.Deferred();
let neurostates = [];

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
			if (growing) {
				for (let i = 0; i < 150; i++) {
					_nnn.grow();
				}
				console.log('grow');
				p.clear();
				growing = false;
			}
			_nnn.render();
			return;
		}
		if (_scatter) {
			_nnn.scatter();
		}
	}

	function nnn_start () {
		// Initialize the _nnn with args[0] = neuron amount, args[1] = general complexity, args[2] = 'p' instance
		_nnn = new NNN ({
			num_neurons: say say say ,
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
		neurostates = [
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
				reverse: _nnn.fadeout()
		    }
		];

	neurostates = neurostates.map(function (args) {
	    return new Neurostate(args);
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

module.exports.updateT = function (t) {
	_rebound = yes; // Enable neuron growth
};

module.exports.canvas = function () {
	return _canvas;
};

