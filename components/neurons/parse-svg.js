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
	let d = "M242.8,105.8c24.6,0,20.1-50.5-10.8-38.2c23.6-14.9-3.1-50.5-24-31.8c8.7-22.9-25.4-38-36.5-16.2c0-22-31.9-27.2-38.9-6.4c-7-19.4-36.4-15.9-38.7,4.7c-15.1-18.2-44.5,2-32.8,22.6c-18-18.2-46.5,9.5-28.6,28C9.1,61.2-3.9,96.2,18.6,106c-25.2,1-24.6,40,0.8,40c23.1,0,90.6-0.3,101.2,0c17,0.5,25.3,12.7,25.3,28.6c0,11.8,0,23.6,0,35.4h24c0-16.2,8.7-28.6,25.9-29.2c8.7-0.3,17.5,0,26.3,0c19.3,0.4,27.8-25.2,11.9-36.4C272.9,145.3,263.2,105.8,242.8,105.8z";
	// let d = "M613.6,672l-262-88z";
	let _pos = p.createVector(); // Think turtle graphics
	let _start_pos = p.createVector(); // Think turtle graphics

	let _this = this;

	_this.bezier_array = []; // Array to contain bezier curves

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

		_this.bezier_array.push( // Pt2
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

		let c1 = p.createVector(_pos.x, _pos.y);
		let c2 = p.createVector(_pos.x, _pos.y);
		let p1 = p.createVector(_pos.x, _pos.y);

		_pos.set(x,y); // Add to position absolute

		c1.set(_pos.x, _pos.y);
		c2.set(_pos.x, _pos.y);
		p1.set(_pos.x, _pos.y);

		_this.bezier_array.push( // Pt2
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

		// _this.bezier_array.push( // Pt1
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

		_this.bezier_array.push( // Pt2
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

		_this.bezier_array.push( // Pt2
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

		_this.bezier_array.push( // Pt2
			new Bezier_obj(
				c1,
				c2,
				p1
			)
		);

		console.log('vertical traveler');

	}

	function bezierTo(curve) { // dx/dy | relative
		let x = curve.x,
			y = curve.y,
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

		_this.bezier_array.push( // Pt2
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

		_this.bezier_array.push( // Pt2
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

}

module.exports = SVG_object;















