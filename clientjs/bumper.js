var Easing = require('./easing.js'),
	p5 = require('p5');

// Eyewire Bumper Animation
// Alex Norton
// http://eyewire.org

// Running the sketch in instance mode, don't forget to preface all P5 methods with { p }
var bump = function (anchor, p) {
// Global Variables

	var E, E2;
	var dot, dot2;

	// Animation constants || should I return from the animation (yes)  
	var a_e_s, 	// Animate scale Es 
		a_d_s, 	// Animate scale dots
		a_d_r, 	// Animate rotation dots 
		a_d_d,	// Animate diameter dots
		a_ed_r, // Animate rotation Es + Dots 
		a_l_ds, // Animate lines distance start
		a_l_de, // Animate lines distance end

		global_animator; 	//Global animation controller!

	var t_cl; 	// Global Time Controller

	p.preload = function () {
		// Load image assets
		E = p.loadImage("/images/bumper/E.png");
		E2 = p.loadImage("/images/bumper/E2.png");
		dot = p.loadImage("/images/bumper/dot.png");
		dot2 = p.loadImage("/images/bumper/dot.png");
	}

	p.setup = function () {
		var canvas = p.createCanvas(window.innerWidth, window.innerHeight);

		canvas.parent(anchor);

		p.frameRate(60);

		t_cl = 1;			// Default to 1

		// Global Animator Returns following animations in linear step
		global_animator = new Animator ({
			start: 0, 		// animation starting value
			end: 1, 		// value to increment towards
			ratio: 1,		// ratio to total animation
			msec: 5000, 	// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 0,		// Order to Call		
			easing: Easing.linear, // Linear Timing Function
		});

		// Spring animation object for Es scale
		a_e_s = new Animator ({
			start: 0, 		// animation starting value
			end: 1, 		// value to increment towards
			ratio: 0.25,	// ratio to total animation
			msec: 1500,		// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 0,		// Order to Call
			easing: Easing.springFactory(0.25, 7), // Spring Timing Function
		});

		// Spring animation object for dots scale
		a_d_s = new Animator ({
			start: 0, 		// animation starting value
			end: 1, 		// value to increment towards
			ratio: 0.035,	// ratio to total animation
			msec: 1000, 	// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 1,		// Order to Call
			easing: Easing.springFactory(0.25, 5), // Spring Timing Function
		});

		// Spring animation object for Dots rotate
		a_d_r = new Animator ({
			start: 0, 		// animation starting value
			end: 77, 		// value to increment towards
			ratio: 0.04,	// ratio to total animation
			msec: 350, 		// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 2,		// Order to Call
			easing: Easing.easeInOut(), // Cubic Timing Function
		});

		// Spring animation object for Dots radius
		a_d_d = new Animator ({
			start: 325, 	// animation starting value
			end: 265, 		// value to increment towards
			ratio: 0.04,	// ratio to total animation
			msec: 350, 		// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 2,		// Order to Call
			easing: Easing.easeInOut(), // Cubic Timing Function
		});

		// Spring animation object for Line expansion start
		a_l_ds = new Animator ({
			start: 0, 		// animation starting value
			end: 45, 		// value to increment towards
			ratio: 0.0275,	// ratio to total animation
			msec: 1500, 	// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 3,		// Order to Call
			easing: Easing.sigmoidFactory(19, -0.1), // Custom Timing Function
		});

		// Spring animation object for Line expansion end
		a_l_de = new Animator ({
			start: 0, 		// animation starting value
			end: 45, 		// value to increment towards
			ratio: 0.0450,	// ratio to total animation
			msec: 1500, 	// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 3,		// Order to Call
			easing: Easing.sigmoidFactory(19, 0.1), // Custom Timing Function
		});

		// Spring animation object for Es + Dots rotate
		a_ed_r = new Animator ({
			start: 0, 		// animation starting value
			end: 45, 		// value to increment towards
			ratio: 0.0475,	// ratio to total animation
			msec: 1500, 	// Number of update steps : microseconds --> 1000 / second | 2.5sec
			order: 3,		// Order to Call
			easing: Easing.springFactory(0.35, 5), // Spring Timing Function
		});

	}

	// Consider this Update
	p.draw = function () {
		p.clear();
		
		// Draw Grid
		// debug();

		// Animation Controller
		step();

		// Render Graphics
		render();

	}

	// Global Animator Controls
	// Step through animations in given order
	function step () {

		// Kick off animation
		if (!global_animator.started) {
			global_animator.animate();
		}

		// Animate the Es to Scale
		if (global_animator.value >= (a_e_s.ratio * a_e_s.order) && !a_e_s.started) {
			// a_e_s.msec = global_animator.msec * a_e_s.ratio;
			a_e_s.animate();
		}

		// // Animate the Dots to Scale
		if (global_animator.value >= (a_d_s.ratio * a_d_s.order) && !a_d_s.started) {
			// a_d_s.msec = global_animator.msec * a_d_s.ratio;
			// console.log("Dots scale");
			a_d_s.animate();
		}
		
		// // Animate the Dots to Rotate
		if (global_animator.value >= (a_d_r.ratio * a_d_r.order) && !a_d_r.started) {
			// a_d_r.msec = global_animator.msec * a_d_r.ratio;
			// console.log("Dots rotate");
			a_d_r.animate();
		}

		// // Animate the Dots to Change Diameter
		if (global_animator.value >= (a_d_d.ratio * a_d_d.order) && !a_d_d.started) {
			// a_d_d.msec = global_animator.msec * a_d_d.ratio;
			// console.log("Dots diamter");
			a_d_d.animate();
		}

		// // Animate both the Dots & Es to Rotate
		if (global_animator.value >= (a_ed_r.ratio * a_ed_r.order) && !a_ed_r.started) {
			// a_ed_r.msec = global_animator.msec * a_ed_r.ratio;
			// console.log("Both rotate");
			a_ed_r.animate();
		}

		// // Animate both the Line start positons
		if (global_animator.value >= (a_l_ds.ratio * a_l_ds.order) && !a_l_ds.started) {
			// a_l_ds.msec = global_animator.msec * a_l_ds.ratio;
			// console.log("Line Start");
			a_l_ds.animate();
		}

		// // Animate both the Line end positons
		if (global_animator.value >= (a_l_de.ratio * a_l_de.order) && !a_l_de.started) {
			// a_l_de.msec = global_animator.msec * a_l_de.ratio;
			// console.log("Line End");
			a_l_de.animate();
		}

	}

	// Draw grid
	function debug () {

		p.stroke(255, 25);
		p.strokeWeight(1);

		// Make a simple grid
		var horz,
			vert;

		var num_lines = 10;
		for (var i = 0; i < num_lines; i++) {
			horz = p.width / num_lines;
			vert = p.height / num_lines;
			p.line(horz  * i, 0, horz * i, p.height);
			p.line(0, vert * i, p.width, vert * i);
		}
	}

	// Draw basic E logo in center of screen
	// Consider applying a transformation stack on top of this
	function render () {

		function pushMatrix (fn) {
			p.push();
			fn();
			p.pop();
		}

		// Draw Horizontal Lines
		pushMatrix(function () {
			p.strokeCap(p.ROUND);
			p.stroke(121, 192, 242);				// Light Blue
			p.translate(p.width/2, p.height/2);		// Translate to center

			// Set strokeweight to decrease proportionally to the stretch factor
			var base_stroke_weight = 3;
			var stroke_weight = base_stroke_weight - (a_l_de.value * base_stroke_weight);
			p.strokeWeight(stroke_weight);

			var spacing = 75;						// Set space around Es
			// Mult by -1 for left line
			var displacement_start = a_l_ds.value * (p.width / 2) + spacing;
			var displacement_end = a_l_de.value * (p.width / 2) + spacing;

			p.line(-displacement_end, 0, -displacement_start, 0);		// Left Line
			p.line(displacement_end, 0, displacement_start, 0);		// Right Line
		});

		// Assemble Logo!

		// Rotate E
		pushMatrix(function () {

			p.tint(255, 255); // Opacity (255)
			
			p.translate(p.width / 2, p.height / 2);
			p.rotate(p.radians(a_ed_r.value));		// All rotations must occur here!!!
			p.scale(1,1);

			// For Dots
			pushMatrix(function () {

				p.translate(-41.25,-42.65); 		// Center offset
				p.scale(0.15,0.15);

				// Polar Coordinates
				var r = a_d_d.value;				// Origin Offset  	{start: 300, end: 265}
				var angle = p.radians(a_d_r.value);		// Angle Offset		{start: 0, end: 77}
				var x = p.cos(angle) * r;				// Multiply r * -1 for other Dot
				var y = p.sin(angle) * r;

				// Top Dot
				pushMatrix(function () {
					p.scale(1, 1);
					
					p.translate(x,y);
					p.translate(276,283); 		// Center on Es
					p.scale(a_d_s.value, a_d_s.value); 	// Each scale <-- Parametric
					p.image(dot, -50, -50); 	// Center around origin
				});

				// Bottom Dot
				pushMatrix(function () {
					p.scale(1, 1);
					
					p.translate(-x,-y);
					p.translate(276, 283); 		// Center on Es, experimentally determined
					p.scale(a_d_s.value, a_d_s.value); 	// Each scale <-- Parametric
					p.image(dot2, -50, -50); 	// Center around origin
				});
			});

			// For Es
			pushMatrix(function () {
				p.scale(a_e_s.value, a_e_s.value); 	// Global scale
				p.translate(-41.25,-42.65); 		// Center offset, experimentally determined
				p.scale(0.15,0.15);
				
				// Bottom E
				p.image(E, 100, 100);

				// Top E
				pushMatrix(function () {
					p.translate(200, 0);
					p.image(E2, 0, 0);
				});
			});

		});

		pushMatrix(function () {
			p.fill(255);
			p.noStroke();
			p.translate(p.width/2, p.height/2);
		});
	}

	// OOP --> Generic animation function
	// Accepts any range and returns a springified value c:
	function Animator (args) {
		args = args || {};

	  	this.easing = args.easing || function (t) { return t }; // default to linear easing
	  	this.start_pos = args.start || 0;
	  	this.end_pos = args.end || 1;
	  	this.ratio = args.ratio || 0.25; // ratio to total animation --> normalize to 1
	  	this.msec = args.msec || 1000; // default to 1000msec --> 1s
	  	this.order = args.order || 0;

	  	// Called Flag
	  	this.started = false;

	  	// Value to be returned
	  	this.value = this.start_pos;

	  	// Global (local) reference to 'this'
	  	var _this = this;

		// performance.now is guaranteed to increase and gives sub-millisecond resolution
		// Date.now is susceptible to system clock changes and gives some number of milliseconds resolution
		_this.start = window.performance.now(); 
		var delta = _this.end_pos - _this.start_pos; // displacement

		function frame() {
			var now = window.performance.now();
			var t = (now - _this.start) / _this.msec; // normalize to 0..1

			if (t >= 1) { // if animation complete or running over
				_this.value = _this.end_pos; // ensure the animation terminates in the specified state
			  	return;
			}

			var proportion = _this.easing(t); // Call upon the strange magic of your timing function
			
			// delta is our multiplier | this decides our current position relative to starting position
			// update your animation based on this value
			// trig functions are naturally really excited about this,
			// Can I make the whole thing less imperitive? --> Stateless?

			_this.value = _this.start_pos + proportion * delta; 	
			requestAnimationFrame(frame); // next frame!
		}

		this.animate = function() {
			_this.started = true;
			_this.start = window.performance.now();
			requestAnimationFrame(frame); // you can use setInterval, but this will give a smoother animation --> Call it the first time and it loops forever until return
		}
	}

	p.windowResized = function () {
		p.resizeCanvas(window.innerWidth, window.innerHeight);
	};
}

module.exports.play = function (anchor) {
	var bmp = bump.bind(this, anchor);

	// Instantiate the entire P5 sketch
	return new p5(bmp);
};


