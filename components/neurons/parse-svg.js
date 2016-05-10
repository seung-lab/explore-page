// Growing Neurons
// Alex Norton :: 2016
// https://github.com/alexnortn/Explore.Eye

// Parse svg and convert to p5js shape object
// Needs a p5 instance to build on

let $ = require('jquery');
let p5 = require('p5');
let svg_parse = require('svg-path-parser');

function SVG_object (args = {}) {
	// Private arguments from constructor
	let p = args.p;

	// SVG
	// let d = "M242.8,105.8c24.6,0,20.1-50.5-10.8-38.2c23.6-14.9-3.1-50.5-24-31.8c8.7-22.9-25.4-38-36.5-16.2c0-22-31.9-27.2-38.9-6.4c-7-19.4-36.4-15.9-38.7,4.7c-15.1-18.2-44.5,2-32.8,22.6c-18-18.2-46.5,9.5-28.6,28C9.1,61.2-3.9,96.2,18.6,106c-25.2,1-24.6,40,0.8,40c23.1,0,90.6-0.3,101.2,0c17,0.5,25.3,12.7,25.3,28.6c0,11.8,0,23.6,0,35.4h24c0-16.2,8.7-28.6,25.9-29.2c8.7-0.3,17.5,0,26.3,0c19.3,0.4,27.8-25.2,11.9-36.4C272.9,145.3,263.2,105.8,242.8,105.8z";
	let d = "M245.8,107.2c22.6-2.1,18-49.3-11.5-38.4c-0.1,0-0.2-0.1-0.1-0.2c22.2-15.1-3.9-49.6-24.5-31.5c-0.1,0.1-0.2,0-0.1-0.1c8.3-22.6-25.3-37.5-36.5-16.2c0,0.1-0.1,0-0.1,0c-0.3-21.7-31.7-26.8-38.8-6.3c0,0.1-0.1,0.1-0.1,0c-7.1-19.1-36.2-15.6-38.6,4.7c0,0.1-0.1,0.1-0.1,0c-15-17.8-44,1.9-32.9,22.3c0,0.1,0,0.1-0.1,0.1c-18-17.5-45.8,9.8-28.4,28.1c0.1,0.1,0,0.1-0.1,0.1c-23.2-6.9-36,27.6-13.8,37.5c0,0,0,0.1,0,0.1c-25,1.2-24.3,40,1,40c23.1,0,90.6-0.3,101.2,0c17,0.5,25.3,12.7,25.3,28.6c0,11.8,0,23.6,0,35.4h24c0-16.2,8.7-28.6,25.9-29.2c8.7-0.3,17.5,0,26.3,0c19.2,0.4,23.4-24.6,12-36.3c-0.1-0.1,0-0.1,0.1-0.1c37.7,0.7,29.4-36.6,10.2-38.5C245.7,107.3,245.7,107.2,245.8,107.2z";
	let _pos = p.createVector(); // Think turtle graphics
	let _start_pos = p.createVector(); // Think turtle graphics

	let _this = this;

	_this.beziers = []; // Array to contain bezier curves
	_this.vertices = []; // Array to contain vertex points 

	//  Assumes p5 in instance mode ('p' prefix)
	this.parseSVG = function() {
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
		p.fill(115,135,150);
		p.noStroke();

		let v = _this.vertices;

		p.push();
			let scale_factor = 2.25;
			let dx = p.width/2 - _start_pos.x / (scale_factor / 2.6),
				dy = p.height/2 - _start_pos.y * scale_factor; 
			p.translate(dx, dy);
			p.scale(scale_factor);
			for (let i = 1; i < v.length; i++) {
				p.ellipse(v[i].x,v[i].y,5,5);
			}
		p.pop();
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

		console.log('moving');
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

		console.log('moving');
	}

	function lineTo(curve) {
		let x = curve.x;
		let y = curve.y;

		let c1 = p.createVector(_pos.x, _pos.y);
		let c2 = p.createVector(_pos.x, _pos.y);
		let p1 = p.createVector(_pos.x, _pos.y);

		// _this.beziers.push( // Pt1
		// 	new Bezier_obj(
		// 		_pos,
		// 		_pos,
		// 		_pos
		// 	)
		// );

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

		console.log('line drive');
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

		console.log('horizontal traveler');
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

		console.log('vertical traveler');

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

		console.log('bezier maybe');

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

		console.log('bezier abs');

	}

	function subdivide(bezier_pts) {
		let p0 = bezier_pts[0],	// Curve Points
			p1 = bezier_pts[1],
			p2 = bezier_pts[2], // Control Points
			p3 = bezier_pts[3],

			segments = 3, // start with 3
			arc_length = 0;

		function seg_length() {
			// Calc first Segment
			let step = 1 / segments; 
			
			let x1 = p.curvePoint(p0.x, p1.x, p2.x, p3.x, step); // Find 1st point on curve
			let y1 = p.curvePoint(p0.y, p1.y, p2.y, p3.y, step); // Find 1st point on curve

			step *= 2;

			let x2 = p.curvePoint(p0.x, p1.x, p2.x, p3.x, step); // Find 2nd point on curve
			let y2 = p.curvePoint(p0.y, p1.y, p2.y, p3.y, step); // Find 2nd point on curve

			arc_length = p.sqrt(p.sq(x2 - x1) + p.sq(y2 - y1)); // Return segment length

			if (arc_length < 2) { // Get rid of points that are too close
				return;
			}

			if (arc_length > 25) { // Ahh the recursive dive
				segments++;
				seg_length();

				return;
			}

			addPoints();  // You've made the cut! Welcome to the render

		}

		function addPoints() {
			for (let i = 0; i <= segments; i++) { // Get points on curve
				let step = 1 / segments;
					step *= i; 
				let x = p.curvePoint(p0.x, p1.x, p2.x, p3.x, step); // Find point on curve
				let y = p.curvePoint(p0.y, p1.y, p2.y, p3.y, step); // Find point on curve

				_this.vertices.push(p.createVector(x,y));

			}
		}

		seg_length();
	}


	// Evenly distribute vertices across Brain svg
	this.constellation = function() {

		for (let i = 0; i < _this.beziers.length-1; i++) { // Measure up till last point
			let start = _this.beziers[i],
				end = _this.beziers[i+1],
				bezier_pts = []; // Build Cubic Bezier Segment
				
				bezier_pts.push(start.c2);
				bezier_pts.push(start.p1);
				bezier_pts.push(end.p1);
				bezier_pts.push(end.c1);

				subdivide(bezier_pts); // Create Evenly distributed vertices

		}
	}

}

module.exports = SVG_object;















