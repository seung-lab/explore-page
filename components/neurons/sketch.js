// Growing Neurons
// Alex Norton :: 2015

// Recursive Neuron (P5js)

let Easing = require('../../clientjs/easing.js'),
	Kruskal = require('./kruskal.js'),
	NNN = require('./nnn.js'), // neural network
	NeuronCoordinator = require('./NeuronCoordinator.js'), // neuron coordinator
	Animation = require('./animation.js'), // animation
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

let _canvas = $.Deferred();

let sprout = function (p) {
	let	canvas,
		_nnn,
		_nnn_count = 0,
		_startSize = p.createVector(0,0),
		_reSize = p.createVector(0,0),
		_neurostates = [],
		_animations = [];

	p.setup = function () {
		p.frameRate(30);

		// ------------------------------------------------
		// Setup Canvas

		canvas = p.createCanvas(_options.width, _options.height);
		canvas.parent(_options.anchor);
		
		_startSize.set(_options.width, _options.height);
		_canvas.resolve(canvas.elt); // --> Will's sneaky deferred shenanigans

		let _svg_object = new SVG_Object({
			p: p,
			density: density,
		});

		// ------------------------------------------------
		// Start NNN

		let density = p.map(p.width, 350, 3000, 20, 50); // Brain svg spacing
		_nnn_count = p.ceil(p.min((p.width / 10), 200));
		
		_nnn = new NNN ({
			num_neurons: _nnn_count,
			complexity: 13,
			kruskal: Kruskal,
			brain: _svg_object,
			p: p,
		});

		_nnn.initialize();

		// ------------------------------------------------
		// Setup NeuroCoordinator

		set_animations();
		set_neurostates(this.animations);

		// Setup NeuronCoordinator
		NeuronCoordinator.initialize(_neurostates, _options.slide_count, p);
		NeuronCoordinator.updateT(0);
	};

	p.draw = function() {
		NeuronCoordinator.animate();
	}

	function set_animations () {
		this.animations = {
			Brain: {
				duration: 75,
				update: _nnn.render_brain_update.bind(_nnn),
				render: _nnn.render_brain_render.bind(_nnn),
				init: _nnn.forward_render_brain_init.bind(_nnn),
	    	},
	    	Connect: {
				duration: 100,
				forward_update: _nnn.render_brain_lines_update.bind(_nnn),
				forward_render: _nnn.render_brain_lines_render.bind(_nnn),
	    	},
	    	Disconnect: {
				duration: 100,
				forward_update: _nnn.fadeOut_brain_lines_update.bind(_nnn),
				forward_render: _nnn.fadeOut_brain_lines_render.bind(_nnn),
	    	},
	    	Fade_In: {
				duration: 32,
				update: _nnn.fadeIn_update.bind(_nnn),
				render: _nnn.fadeIn_render.bind(_nnn),
				init: _nnn.fade_init.bind(_nnn),
	    	},
	    	Fade_Out: {
				duration: 32,
				update: _nnn.fadeOut_update.bind(_nnn),
				render: _nnn.fadeOut_render.bind(_nnn),
				init: _nnn.fade_init.bind(_nnn),
	    	},
	    	Grow: {
				duration: 100,
				update: _nnn.grow_update.bind(_nnn),
				render: _nnn.grow_render.bind(_nnn),
				init: _nnn.forward_grow_init.bind(_nnn),
	    	},
	    	Last_Position: {
				duration: 45,
				update: _nnn.last_position_update.bind(_nnn),
				render: _nnn.last_position_render.bind(_nnn),
	    	},
	        Rebound_1: {
	        	duration: 50,
				update: _nnn.rebound_1_update.bind(_nnn),
				render: _nnn.rebound_1_render.bind(_nnn),
	        },
	        Rebound_2: {
				duration: 45,
				update: _nnn.rebound_2_update.bind(_nnn),
				render: _nnn.rebound_2_render.bind(_nnn),
	    	},
	    	Rebound_3: {
				duration: 45,
				update: _nnn.rebound_3_update.bind(_nnn),
				render: _nnn.rebound_3_render.bind(_nnn),
	    	},
	    	Rebound_4: {
				duration: 75,
				update: _nnn.rebound_4_update.bind(_nnn),
				render: _nnn.rebound_4_render.bind(_nnn),
	    	},
			Scatter: {
				duration: 60,
				update: _nnn.scatter_update.bind(_nnn),
				render: _nnn.scatter_render.bind(_nnn),
				init: _nnn.scatter_init.bind(_nnn),
	    	},
	    	Scatter_2: {
				duration: 50,
				update: _nnn.scatter_2_update.bind(_nnn),
				render: _nnn.scatter_2_render.bind(_nnn),
				init: _nnn.scatter2_init.bind(_nnn),
	    	},
	    	Start_Position: {
				duration: 30,
				update: _nnn.start_position_update.bind(_nnn),
				render: _nnn.start_position_render.bind(_nnn),
	    	},
	    	Stary_Night: {
				duration: 45,
				update: _nnn.stary_night_update.bind(_nnn),
				render: _nnn.stary_night_render.bind(_nnn),
				init: _nnn.stary_night_init.bind(_nnn),
	    	},
	    	Synapse: {
				duration: 32,
				update: _nnn.synapse_update.bind(_nnn),
				render: _nnn.synapse_render.bind(_nnn),
				init: _nnn.synapse_init.bind(_nnn),
				loop: true,
	    	},
	    	Twinkle: {
				duration: 30,
				update: _nnn.twinkle_update.bind(_nnn),
				render: _nnn.twinkle_render.bind(_nnn),
				loop: true,
	    	},
	    	Twinkle_2: {
				duration: 30,
				update: _nnn.twinkle_2_update.bind(_nnn),
				render: _nnn.twinkle_2_render.bind(_nnn),
				loop: true,
	    	}
		};

		this.animations = this.animations.map(function (args) {
		    return new Animation(args);
		});	
	}

	function set_neurostates (animations) {
		this.neurostates = [ // One Neurostate / Slide
			{
				slide: 0,
				forward_animations: [],
				reverse_animations: [
					animations.Rebound_1,
				],
	    	},
	    	{
				slide: 1,
				forward_animations: [
					animations.Scatter,
					animations.Twinkle,
				],
				reverse_animations: [
					animations.Start_Position,
					animations.Fade_Out,
				],
	    	},
	    	{
				slide: 2,
				forward_animations: [
					animations.Scatter_2,
					animations.Grow,
				],
				reverse_animations: [
					animations.Grow,
				],
	    	},
	    	{
				slide: 3,
				forward_animations: [
					animations.Synapse,
				],
				reverse_animations: [
					animations.Synapse,
				],
	    	},
	    	{
				slide: 4,
				forward_animations: [
					animations.Fade_Out,
				],
				reverse_animations: [
					animations.Rebound_3,
					animations.Last_Position,
				],
	    	},
	    	{
				slide: 5,
				forward_animations: [
					animations.Rebound_2,
					animations.Stary_Night,
					animations.Twinkle_2,
				],
				reverse_animations: [
					animations.Rebound_4,
					animations.Stary_Night,
					animations.Twinkle_2,
				],
	    	},
	    	{
				slide: 6,
				forward_animations: [
					animations.Rebound_3,
					animations.Brain,
				],
				reverse_animations: [
					animations.Disconnect,
				],
	    	},
	    	{
				slide: 7,
				forward_animations: [
					animations.Connect,
				],
				reverse_animations: [],
	    	},
		];

		this.neurostates = this.neurostates.map(function (args) {
		    return new Neurostate(args);
		});	
	}

	// ------------------------------------------------
	// Event Bindings

	window.onresize = function() { 
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

