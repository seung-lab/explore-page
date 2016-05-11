// Growing Neurons
// Alex Norton :: 2016
// https://github.com/alexnortn/Explore.Eye

// Parse svg and convert to p5js shape object
// Needs a p5 instance to build on

// Partial SVG parsing support (does not support {Q,S,s,T,t,A,a})

// Maps SVG elements to p5 bezier objects

let $ = require('jquery');
let p5 = require('p5');
let svg_parse = require('svg-path-parser');

function SVG_object (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	_this.density = args.density || 10; // 10 default

	// SVG
	let d = "M245.8,107.2c22.6-2.1,18-49.3-11.5-38.4c-0.1,0-0.2-0.1-0.1-0.2c22.2-15.1-3.9-49.6-24.5-31.5c-0.1,0.1-0.2,0-0.1-0.1c8.3-22.6-25.3-37.5-36.5-16.2c0,0.1-0.1,0-0.1,0c-0.3-21.7-31.7-26.8-38.8-6.3c0,0.1-0.1,0.1-0.1,0c-7.1-19.1-36.2-15.6-38.6,4.7c0,0.1-0.1,0.1-0.1,0c-15-17.8-44,1.9-32.9,22.3c0,0.1,0,0.1-0.1,0.1c-18-17.5-45.8,9.8-28.4,28.1c0.1,0.1,0,0.1-0.1,0.1c-23.2-6.9-36,27.6-13.8,37.5c0,0,0,0.1,0,0.1c-25,1.2-24.3,40,1,40c23.1,0,90.6-0.3,101.2,0c17,0.5,25.3,12.7,25.3,28.6c0,11.8,0,23.6,0,35.4h24c0-16.2,8.7-28.6,25.9-29.2c8.7-0.3,17.5,0,26.3,0c19.2,0.4,23.4-24.6,12-36.3c-0.1-0.1,0-0.1,0.1-0.1c37.7,0.7,29.4-36.6,10.2-38.5C245.7,107.3,245.7,107.2,245.8,107.2z";
	let _pos = p.createVector(); // Think turtle graphics
	let _start_pos = p.createVector(); // Think turtle graphics

	let _this = this;

	_this.beziers = []; // Array to contain bezier curves
	_this.vertices = []; // Array to contain vertex points 

	// ------------------------------------------------
	// SVG Initialize

	initialize();


	// ------------------------------------------------
	// SVG Rendering

	this.render_lines = function() {
		
		if (_this.beziers.length === 0) {
			return;
		}

		// Draw Brain SVG
		// p.fill(255,0,0);	
		p.noFill();
		p.strokeWeight(2);
		p.stroke(115,135,150);

		let b = _this.beziers;

		p.push();
			let scale_factor = 2.25;
			let dx = p.width/2 - _start_pos.x / (scale_factor / 2.6),
				dy = p.height/2 - _start_pos.y * scale_factor; 
			p.translate(dx, dy);
			p.scale(scale_factor);
			p.beginShape();
				p.vertex(b[0].p1.x, b[0].p1.y); // First point must be norm vertex
				for (let i = 1; i < b.length; i++) {
					p.bezierVertex(
						b[i].c1.x, // Control Pt x 1
						b[i].c1.y, // Control Pt y 1
						b[i].c2.x, // Control Pt x 2
						b[i].c2.y, // Control Pt y 2
						b[i].p1.x, // Pt x
						b[i].p1.y  // Pt y
					);
				}
			p.endShape();
		p.pop();
	}

	this.render_points = function() {
		
		if (_this.vertices.length === 0) {
			return;
		}

		// Draw Brain SVG Points
		p.noStroke();

		let v = _this.vertices;

		p.push();
			let scale_factor = 2.25;
			let dx = p.width/2 - _start_pos.x / (scale_factor / 2.6),
				dy = p.height/2 - _start_pos.y * scale_factor; 
			p.translate(dx, dy);
			p.scale(scale_factor);
			for (let i = 0; i < v.length; i++) {
				p.fill(115,135,150);
				p.ellipse(v[i].x,v[i].y,2,2);
			}
		p.pop();
	}

	this.debug = function() {

		// Draw Brain SVG Points
		p.strokeWeight(1);

		let b = _this.beziers;

		p.push();
			let scale_factor = 2.25;
			let dx = p.width/2 - _start_pos.x / (scale_factor / 2.6),
				dy = p.height/2 - _start_pos.y * scale_factor; 
			p.translate(dx, dy);
			p.scale(scale_factor);

			for (let i = 0; i < b.length; i++) { // Measure up till last point
				let start = b[i],
					end,
					bezier_pts = []; // Build Cubic Bezier Segment

				if (i < b.length - 1) {
					end = b[i+1]; // Lookforward
				} else {
					end = b[0];   // Back to beginning
				}

				p.stroke(255,0,0,100);
				p.line( // Point to control point 1
					start.p1.x,
					start.p1.y,
					start.c2.x,
					start.c2.y
				);
				p.stroke(255,0,255,100);
				p.line( // Point to control point 1
					start.p1.x,
					start.p1.y,
					start.c1.x,
					start.c1.y
				);
				p.stroke(0,255,0,100);
				p.line( // Point to control point 2
					start.p1.x,
					start.p1.y,
					end.c1.x,
					end.c1.y
				);
				p.stroke(255,255,0,100);
				p.line( // Point to control point 2
					end.p1.x,
					end.p1.y,
					end.c2.x,
					end.c2.y
				);
			}
		p.pop();

	}


	// ------------------------------------------------
	// SVG Parsing

	function initialize() {
		parseSVG();
		scaleSVG();
	}

	function parseSVG() {
		let draw_object;
		d = svg_parse(d); // Parse the path

		d.forEach(function(curve) {
			let command = curve.code;

			// Convert SVG to p5 drawing commands
			switch (command) {

				case 'm': moveTo(curve);
				break;

				case 'M': moveToAbs(curve);
				break;

				case 'l': lineTo(curve);
				break;

				case 'L': lineTo(curve);
				break;

				case 'h': horzLineTo(curve);
				break;

				case 'H': horzLineTo(curve);
				break;

				case 'v': vertLineTo(curve);
				break;

				case 'V': vertLineTo(curve);
				break;

				case 'c': bezierTo(curve);
				break;

				case 'C': bezierToAbs(curve);
				break;

			}
			
		});
	}

	// Object to contain transform points (2D vector)
	function Bezier_obj(c1, c2, p1) {
		this.c1 = c1;
		this.c2 = c2;
		this.p1 = p1;
	}

	function moveTo(curve) {
		let x = curve.x;
		let y = curve.y;

		let c1 = p.createVector(_pos.x, _pos.y);
		let c2 = p.createVector(_pos.x, _pos.y);
		let p1 = p.createVector(_pos.x, _pos.y);

		_pos.x += x; // Add to position relative
		_pos.y += y; // Add to position relative

		c1.set(_pos.x, _pos.y);
		c2.set(_pos.x, _pos.y);
		p1.set(_pos.x, _pos.y);

		_this.beziers.push( // Pt1
			new Bezier_obj(
				c1,
				c2,
				p1
			)
		);
	}

	function moveToAbs(curve) {
		let x = curve.x;
		let y = curve.y;

		_start_pos.set(x,y);

		let c1 = p.createVector(_pos.x, _pos.y);
		let c2 = p.createVector(_pos.x, _pos.y);
		let p1 = p.createVector(_pos.x, _pos.y);

		_pos.set(x,y); // Add to position absolute

		c1.set(_pos.x, _pos.y);
		c2.set(_pos.x, _pos.y);
		p1.set(_pos.x, _pos.y);

		_this.beziers.push( // Pt1
			new Bezier_obj(
				c1,
				c2,
				p1
			)
		);
	}

	function lineTo(curve) {
		let x = curve.x;
		let y = curve.y;

		let c1 = p.createVector(_pos.x, _pos.y);
		let c2 = p.createVector(_pos.x, _pos.y);
		let p1 = p.createVector(_pos.x, _pos.y);

		// Increment  
		_pos.x += x;
		_pos.y += y;

		c1.set(_pos.x, _pos.y);
		c2.set(_pos.x, _pos.y);
		p1.set(_pos.x, _pos.y);

		_this.beziers.push( // Pt1
			new Bezier_obj(
				c1,
				c2,
				p1
			)
		);
	}

	function horzLineTo(curve) {
		let x = curve.x;

		let c1 = p.createVector(_pos.x, _pos.y);
		let c2 = p.createVector(_pos.x, _pos.y);
		let p1 = p.createVector(_pos.x, _pos.y);

		// Increment  
		_pos.x += x;

		c1.set(_pos.x, _pos.y);
		c2.set(_pos.x, _pos.y);
		p1.set(_pos.x, _pos.y);

		_this.beziers.push( // Pt1
			new Bezier_obj(
				c1,
				c2,
				p1
			)
		);
	}

	function vertLineTo(curve) {
		let y = curve.y;

		let c1 = p.createVector(_pos.x, _pos.y);
		let c2 = p.createVector(_pos.x, _pos.y);
		let p1 = p.createVector(_pos.x, _pos.y);

		// Increment  
		_pos.y += y;

		c1.set(_pos.x, _pos.y);
		c2.set(_pos.x, _pos.y);
		p1.set(_pos.x, _pos.y);

		_this.beziers.push( // Pt1
			new Bezier_obj(
				c1,
				c2,
				p1
			)
		);
	}

	function bezierTo(curve) { // dx/dy | relative
		let x  = curve.x,
			y  = curve.y,
			x1 = curve.x1,
			y1 = curve.y1,
			x2 = curve.x2,
			y2 = curve.y2;

		let c1 = p.createVector(x1,y1);
		let c2 = p.createVector(x2,y2);
		let p1 = p.createVector(x,y);

			c1.add(_pos.x, _pos.y); // Relative Moves
			c2.add(_pos.x, _pos.y); // Relative Moves
			p1.add(_pos.x, _pos.y); // Relative Moves

		_this.beziers.push( // Pt1
				new Bezier_obj(
					c1,
					c2,
					p1
				)
			);

		// Increment Global Position
		_pos.x += x;
		_pos.y += y;

	}

	function bezierToAbs(curve) { // Absolute
		let x = curve.x,
			y = curve.y,
			x1 = curve.x1,
			y1 = curve.y1,
			x2 = curve.x2,
			y2 = curve.y2;

		let c1 = p.createVector(x1,y1);
		let c2 = p.createVector(x2,y2);
		let p1 = p.createVector(x,y);

		_this.beziers.push( // Pt1
				new Bezier_obj(
					c1,
					c2,
					p1
				)
			);

		// Set Global Position
		_pos.set(x,y);

	}

	function subdivide(bezier_pts, _density) {
		let p0 = bezier_pts[0],	// Curve Points
			p1 = bezier_pts[1], // Control Points
			p2 = bezier_pts[2], // Control Points
			p3 = bezier_pts[3], // Curve Points

			density = _density, // Local copy

			segments = 3, // start with 3
			arc_length = 0;

		function seg_length() {
			// Calc first Segment
			let t = 1 / (segments - 1); 
			
			let x1 = p.bezierPoint(p0.x, p1.x, p2.x, p3.x, 0); // Find 1st point on curve
			let y1 = p.bezierPoint(p0.y, p1.y, p2.y, p3.y, 0); // Find 1st point on curve

			let x2 = p.bezierPoint(p0.x, p1.x, p2.x, p3.x, t); // Find 2nd point on curve
			let y2 = p.bezierPoint(p0.y, p1.y, p2.y, p3.y, t); // Find 2nd point on curve

			arc_length = p.sqrt(p.sq(x2 - x1) + p.sq(y2 - y1)); // Return segment length

			if (arc_length < 5) { // Get rid of points that are too close
				return;
			}

			if (arc_length > density) { // Ahh the recursive dive
				segments++;
				seg_length();

				return;
			}

			addPoints();  // You've made the cut! Welcome to the render

		}

		function addPoints() {
			for (let i = 0; i < segments; i++) { // Get points on curve
				let t = i / (segments - 1);

				let x = p.bezierPoint(p0.x, p1.x, p2.x, p3.x, t); // Find point on curve
				let y = p.bezierPoint(p0.y, p1.y, p2.y, p3.y, t); // Find point on curve

				_this.vertices.push(new p5.Vector(x,y));

			}

		}

		seg_length();
		// addPoints();
	}

	function scaleSVG() {
		let scale_factor;
		p.width > p.height ? scale_factor = p.width : scale_factor = p.height; // Scale by smallest dimension

		scale_factor = p.map(scale_factor, 400, 3000, 0.5, 3);

		let dx = p.width/2 - _start_pos.x / (scale_factor / 2.6),
			dy = p.height/2 - _start_pos.y * scale_factor; 

		_this.beziers.forEach(function(b) {
			b.p1.x *= scale_factor += dx; // Scale | Translate
			b.c1.x *= scale_factor += dx;
			b.c2.x *= scale_factor += dx;
			b.p1.y *= scale_factor += dy;
			b.c1.y *= scale_factor += dy;
			b.c2.y *= scale_factor += dy;
		});

		_this.constellation(_this.density);


	}

	// Evenly distribute vertices across Brain svg
	this.constellation = function(density) {

		let b = _this.beziers;

		for (let i = 0; i < b.length-1; i++) { // Measure up till last point

			let start = b[i],
				end   = b[i+1], // Lookforward
				bezier_pts = []; // Build Cubic Bezier Segment
				
			bezier_pts.push(start.p1);
			bezier_pts.push(end.c1);
			bezier_pts.push(end.c2);
			bezier_pts.push(end.p1);

			console.log("Bezier: " + i);
			console.log("start.p1 " + start.p1);
			console.log("start.c1 " + start.c1);
			console.log("start.c2 " + start.c2);
			console.log("end.p1 " + end.p1);
			console.log("end.c1 " + end.c1);
			console.log("end.c2 " + end.c2);

			subdivide(bezier_pts, density); // Create Evenly distributed vertices

		}
	}


	// ------------------------------------------------
	// Event Bindings

	// Deal with resize events
	window.onresize = function() { 

     	resizeSVG();	
  
	}


}

module.exports = SVG_object;















