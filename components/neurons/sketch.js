// Growing Neurons
// Alex Norton :: 2015

// Recursive Neuron (P5js)

let Easing = require('../../clientjs/easing.js'),
	Kruskal = require('./kruskal.js'),
	NNN = require('./nnn.js'), // neural network
	NeuronCoordinator = require('./NeuronCoordinator.js'), // neuron coordinator
	Neurostate = require('./neurostate.js'), // neurostate
	p5 = require('p5'), 
	SVG_Object = require('./parse-svg.js'),
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
	let _nnn,
		_svg_object, 
	
	// int
		_counter = 0,
		_mxn = 0,
		_avg = 0,
		_all_nodes = 0,
		_nnn_count = 0,

		_direction = "forward",
		_startSize = p.createVector(0,0),
		_reSize = p.createVector(0,0),

	// canvas
		canvas;

	// Global font reference
	// let _fontRegular;

	// Reset Globals
	_neurostates = [],
	_progressions = [],
	_actives = [], // Animation queue
	_direction = undefined;

	growing = true; 

	// Preload any required assets
	p.preload = function () {
		// Load font
		// _fontRegular = p.loadFont(GLOBAL.base_url + "/fonts/WhitneyHTF-Medium.otf");
	};

	p.setup = function () {
		console.log('starting p5...');
		p.frameRate(30);

		canvas = p.createCanvas(_options.width, _options.height);
		canvas.parent(_options.anchor);

		_startSize.set(_options.width, _options.height);

		_canvas.resolve(canvas.elt); // --> Will's sneaky deferred shenanigans

		_svg_object = new SVG_Object({
			p: p,
			density: 35,
		});

		// Calculate _nnn_count based on width
		_nnn_count = p.ceil(p.min((p.width / 10), 200));

		nnn_start();

		set_states();

		// Setup NeuronCoordinator
		NeuronCoordinator.initialize(_neurostates, _options.slide_count, p);
		NeuronCoordinator.updateT(0);
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
			brain: _svg_object,
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
				duration: 75,
				forward: _nnn.empty_fn.bind(_nnn),
				reverse: _nnn.rebound_1.bind(_nnn),
				forward_slide: 0,
				reverse_slide: 0,
				p: p
		    },
		    {
		        name: "Scatter",
				duration: 60,
				forward: _nnn.scatter.bind(_nnn),
				reverse: _nnn.twinkle.bind(_nnn),
				reverse_loop: true,
				forward_slide: 1,
				reverse_slide: 1,
				p: p
		    },
		    {
		    	name: "Twinkle",
				duration: 50,
				forward: _nnn.twinkle.bind(_nnn),
				reverse: _nnn.start_position.bind(_nnn),
				forward_slide: 1,
				reverse_slide: 1,
				forward_loop: true,
				p: p
		    },
		    {
		   		name: "Scatter2",
				duration: 50,
				forward: _nnn.scatter_2.bind(_nnn),
				reverse: _nnn.fadeOut.bind(_nnn),
				forward_slide: 2,
				reverse_slide: 1,
				p: p
		    },
		    {
		    	name: "Grow",
				duration: 100,
				forward: _nnn.grow.bind(_nnn),
				reverse: _nnn.grow.bind(_nnn), // Will simply render neurons
				forward_slide: 2,
				reverse_slide: 2,
				p: p
		    },
		    {
		    	name: "Synapse",
				duration: 30,
				forward: _nnn.synapse.bind(_nnn),
				reverse: _nnn.synapse.bind(_nnn),
				forward_loop: true,
				reverse_loop: true,
				forward_slide: 3,
				reverse_slide: 3,
				p: p
		    },
		    {
		    	name: "Fade",
				duration: 32,
				forward: _nnn.fadeOut.bind(_nnn),
				reverse: _nnn.fadeIn.bind(_nnn),
				forward_slide: 4,
				reverse_slide: 3,
				p: p	
		    },
		    {
		    	name: "Center",
				duration: 30,
				forward: _nnn.rebound_2.bind(_nnn),
				reverse: _nnn.last_position.bind(_nnn),
				forward_slide: 5,
				reverse_slide: 4,
				p: p	
		    },
		    {
		    	name: "Stars",
				duration: 45,
				forward: _nnn.stary_night.bind(_nnn),
				reverse: _nnn.rebound_3.bind(_nnn),
				forward_slide: 5,
				reverse_slide: 4,
				p: p
		    },
		    {
		    	name: "Twinkle2",
				duration: 15,
				forward: _nnn.twinkle_2.bind(_nnn),
				reverse: _nnn.twinkle_2.bind(_nnn),
				forward_slide: 5,
				reverse_slide: 5,
				forward_loop: true,
				reverse_loop: true,
				p: p
		    },
		    {
		    	name: "Center2",
				duration: 50,
				forward: _nnn.rebound_3.bind(_nnn),
				reverse: _nnn.stary_night.bind(_nnn),
				forward_slide: 6,
				reverse_slide: 5,
				p: p
		    },
		    {
		    	name: "Brain",
				duration: 100,
				forward: _nnn.render_brain.bind(_nnn),
				reverse: _nnn.rebound_4.bind(_nnn),
				forward_slide: 6,
				reverse_slide: 5,
				p: p
		    },
		    {
		    	name: "Connect",
				duration: 100,
				forward: _nnn.render_brain_lines.bind(_nnn),
				reverse: _nnn.fadeOut_brain_lines.bind(_nnn),
				forward_slide: 7,
				reverse_slide: 6,
				p: p	
		    }
		];

		_neurostates = _neurostates.map(function (args) {
		    return new Neurostate(args);
		});	
	}

	// ------------------------------------------------
	// Event Bindings

	// Deal with resize events
	window.onresize = function() { 
		// p.resizeCanvas(window.innerWidth, window.innerHeight);

     	// _svg_object.resize();

     	// NeuronCoordinator.resize_sync(); // Let's begin at the beginning..

     	function abs_pos() {
     		let nn = $('.neural-network');
     			nn.addClass('absolute-pos')
     			  .css('left', _reSize.x + 'px')
     			  .css('top', _reSize.y + 'px');
     	}

     	function rel_pos() {
     		let nn = $('.neural-network');
     			nn.removeClass('absolute-pos')
     			  .css('left', 'auto')
     			  .css('top', 'auto');
     	}

     	if ((_startSize.x > window.innerWidth) || (_startSize.y > window.innterHeight)) {
     		_reSize.x = (window.innerWidth - _startSize.x) / 2;
     		_reSize.y = (window.innterHeight - _startSize.y) / 2;
     		abs_pos();
     		return;
     	}

     	rel_pos();


     	// p.draw();
     	// p.draw();
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
};

module.exports.canvas = function () {
	return _canvas;
};

