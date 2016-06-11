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
		p.frameRate(30);

		canvas = p.createCanvas(_options.width, _options.height);
		canvas.parent(_options.anchor);

		_startSize.set(_options.width, _options.height);

		_canvas.resolve(canvas.elt); // --> Will's sneaky deferred shenanigans

		let density = p.map(p.width, 350, 3000, 20, 50); // Set brain svg spacing

		_svg_object = new SVG_Object({
			p: p,
			density: density,
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
		// NeuronCoordinator.animate();
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
				duration: 50,
				forward_update: _nnn.empty_fn.bind(_nnn),
				forward_render: _nnn.empty_fn.bind(_nnn),
				reverse_update: _nnn.rebound_1_update.bind(_nnn),
				reverse_render: _nnn.rebound_1_render.bind(_nnn),
				forward_slide: 0,
				reverse_slide: 0,
				p: p
		    },
		    {
		        name: "Scatter",
				duration: 60,
				forward_update: _nnn.scatter_update.bind(_nnn),
				forward_render: _nnn.scatter_render.bind(_nnn),
				reverse_update: _nnn.twinkle_update.bind(_nnn),
				reverse_render: _nnn.twinkle_render.bind(_nnn),
				forward_init: _nnn.forward_scatter_init.bind(_nnn),
				reverse_loop: true,
				forward_slide: 1,
				reverse_slide: 1,
				p: p
		    },
		    {
		    	name: "Twinkle",
				duration: 30,
				forward_update: _nnn.twinkle_update.bind(_nnn),
				forward_render: _nnn.twinkle_render.bind(_nnn),
				reverse_update: _nnn.start_position_update.bind(_nnn),
				reverse_render: _nnn.start_position_render.bind(_nnn),
				forward_slide: 1,
				reverse_slide: 1,
				forward_loop: true,
				p: p
		    },
		    {
		   		name: "Scatter2",
				duration: 50,
				forward_update: _nnn.scatter_2_update.bind(_nnn),
				forward_render: _nnn.scatter_2_render.bind(_nnn),
				reverse_update: _nnn.fadeOut_update.bind(_nnn),
				reverse_render: _nnn.fadeOut_render.bind(_nnn),
				forward_init: _nnn.forward_scatter2_init.bind(_nnn),
				reverse_init: _nnn.reverse_fade_init.bind(_nnn),
				forward_slide: 2,
				reverse_slide: 1,
				p: p
		    },
		    {
		    	name: "Grow",
				duration: 100,
				forward_update: _nnn.grow_update.bind(_nnn),
				forward_render: _nnn.grow_render.bind(_nnn),
				reverse_update: _nnn.grow_update.bind(_nnn),
				reverse_render: _nnn.grow_render.bind(_nnn),
				forward_init: _nnn.forward_grow_init.bind(_nnn),
				forward_slide: 2,
				reverse_slide: 2,
				p: p
		    },
		    {
		    	name: "Synapse",
				duration: 32,
				forward_update: _nnn.synapse_update.bind(_nnn),
				forward_render: _nnn.synapse_render.bind(_nnn),
				reverse_update: _nnn.synapse_update.bind(_nnn),
				reverse_render: _nnn.synapse_render.bind(_nnn),
				forward_init: _nnn.forward_synapse_init.bind(_nnn),
				forward_loop: true,
				reverse_loop: true,
				forward_slide: 3,
				reverse_slide: 3,
				p: p
		    },
		    {
		    	name: "Fade",
				duration: 32,
				forward_update: _nnn.fadeOut_update.bind(_nnn),
				forward_render: _nnn.fadeOut_render.bind(_nnn),
				reverse_update: _nnn.fadeIn_update.bind(_nnn),
				reverse_render: _nnn.fadeIn_render.bind(_nnn),
				forward_init: _nnn.forward_fade_init.bind(_nnn),
				reverse_init: _nnn.reverse_fade_init.bind(_nnn),
				forward_slide: 4,
				reverse_slide: 3,
				p: p	
		    },
		    {
		    	name: "Center",
				duration: 45,
				forward_update: _nnn.rebound_2_update.bind(_nnn),
				forward_render: _nnn.rebound_2_render.bind(_nnn),
				reverse_update: _nnn.last_position_update.bind(_nnn),
				reverse_render: _nnn.last_position_render.bind(_nnn),
				forward_slide: 5,
				reverse_slide: 4,
				p: p	
		    },
		    {
		    	name: "Stars",
				duration: 45,
				forward_update: _nnn.stary_night_update.bind(_nnn),
				forward_render: _nnn.stary_night_render.bind(_nnn),
				reverse_update: _nnn.rebound_3_update.bind(_nnn),
				reverse_render: _nnn.rebound_3_render.bind(_nnn),
				forward_init: _nnn.stars_init.bind(_nnn),
				forward_slide: 5,
				reverse_slide: 4,
				p: p
		    },
		    {
		    	name: "Twinkle2",
				duration: 30,
				forward_update: _nnn.twinkle_2_update.bind(_nnn),
				forward_render: _nnn.twinkle_2_render.bind(_nnn),
				reverse_update: _nnn.twinkle_2_update.bind(_nnn),
				reverse_render: _nnn.twinkle_2_render.bind(_nnn),
				forward_slide: 5,
				reverse_slide: 5,
				forward_loop: true,
				reverse_loop: true,
				p: p
		    },
		    {
		    	name: "Center2",
				duration: 50,
				forward_update: _nnn.rebound_3_update.bind(_nnn),
				forward_render: _nnn.rebound_3_render.bind(_nnn),
				reverse_update: _nnn.stary_night_update.bind(_nnn),
				reverse_render: _nnn.stary_night_render.bind(_nnn),
				reverse_init: _nnn.stars_init.bind(_nnn),
				forward_slide: 6,
				reverse_slide: 5,
				p: p
		    },
		    {
		    	name: "Brain",
				duration: 75,
				forward_update: _nnn.render_brain_update.bind(_nnn),
				forward_render: _nnn.render_brain_render.bind(_nnn),
				reverse_update: _nnn.rebound_4_update.bind(_nnn),
				reverse_render: _nnn.rebound_4_render.bind(_nnn),
				forward_init: _nnn.forward_render_brain_init.bind(_nnn),
				forward_slide: 6,
				reverse_slide: 5,
				p: p
		    },
		    {
		    	name: "Connect",
				duration: 100,
				forward_update: _nnn.render_brain_lines_update.bind(_nnn),
				forward_render: _nnn.render_brain_lines_render.bind(_nnn),
				reverse_update: _nnn.fadeOut_brain_lines_update.bind(_nnn),
				reverse_render: _nnn.fadeOut_brain_lines_render.bind(_nnn),
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

