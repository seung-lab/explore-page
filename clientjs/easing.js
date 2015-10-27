"use strict";

let Utils = require('./utils.js');

/* springFactory
 * 
 * Simulate an actual spring.
 * 
 * c.f. https://en.wikipedia.org/wiki/Harmonic_oscillator#Universal_oscillator_equation
 * look for the underdamped solution.
 *
 * Solve for the boundary conditions: x(0) = 1, x(1) = 0
 *
 * The bounce can look jerky towards the end because the motion is less than a pixel
 * per frame. Use the optional arguments to create a minimum motion if you can't use
 * anti-aliasing.
 *
 * Required:
 *   [0] zeta: Damping constant in [0, 1) (0: undamped, < 1: underdamped)
 *   [1] k: integer in [0..inf]
 *
 * Optional:
 *   [1] pixels: total distance in pixels we're moving
 *   [2] dynamics: number of pixels above 0 for undamped sinusoidal component
 *
 * Returns: f(t), t in 0..1
 */
module.exports.springFactory = function (zeta, k, pixels, dynamics) {
	if (zeta < 0 || zeta >= 1) {
		throw new Error("Parameter 1 (zeta) must be in range [0, 1). Given: " + zeta);
	}

	if (k < 0 || Math.floor(k) !== k) {
		throw new Error("Parameter 2 (k) must be an integer in range [0, inf). Given: " + k);
	}

	var odd_number = 1 + 2 * k;

	var omega = odd_number / 4 / Math.sqrt(1 - zeta * zeta); // solution set for x(1) = 0
	omega *= 2 * Math.PI; // normalize sinusoid period to 0..1

	var decayfn = function (t) {
		return Math.exp(-t * zeta * omega);
	};

	// subpixel correction
	if (pixels) {
		dynamics = dynamics || 1;

		decayfn = (function (fn) {
			var ipx = dynamics / pixels;

			return function (t) {
				return ipx + (1 - ipx) * fn(t);
			};
		})(decayfn);
	}

	return function (t) {
		t = Utils.clamp(t, 0, 1);
		return 1 - decayfn(t) * Math.cos(Math.sqrt(1 - zeta * zeta) * omega * t);
	};
};

module.exports.bounceFactory = function (gravity, elasticity, threshold) {
	threshold = 0.001;

	function energy_to_height (energy) {
		return energy / gravity; // assume mass = 1 
	}

	function height_to_energy (height) {
		return gravity * height; // assume mass = 1
	}

	function bounce_time (height) {
		return 2 * Math.sqrt(2 * height / gravity);
	}

	function velocity (energy) {
		return Math.sqrt(2 * energy); // assume mass = 1
	}

	var height = 1;
	var potential = height_to_energy(height);

	var bounces = Math.ceil(Math.log(threshold / potential) / Math.log(elasticity));

	var critical_points = [{
		time: - bounce_time(height) / 2,
		energy: potential,
	}, 
	{
		time: bounce_time(height) / 2,
		energy: potential * elasticity,
	}];

	potential *= elasticity;
	height = energy_to_height(potential);

	var time = critical_points[1].time;
	for (var i = 1; i < bounces; i++) {
		time += bounce_time(height);
		potential *= elasticity;

		critical_points.push({
			time: time,
			energy: potential,
		});

		height = energy_to_height(potential);
	}

	var duration = time;

	return function (t) {
		t = Utils.clamp(t, 0, 1);

		var tadj = t * duration;

		if (tadj === 0) {
			return 0;
		}
		else if (tadj >= duration) {
			return 1;
		}

		var index;
		for (index = 0; index < critical_points.length; index++) {
			if (critical_points[index].time > tadj) {
				break;
			}
		}

		var minpt = critical_points[index - 1];

		tadj -= minpt.time;

		var v0 = velocity(minpt.energy);

		var pos = v0 * tadj + 0.5 * -gravity * tadj * tadj;

		return 1 - pos;
	};
};

// Computed as follows:
//
// Y = ax^3 + bx^2 + cx + d 
//
// 4 pts chosen: (0,0), (.5,.5), (1,1) and the control point (0.25, .2)
//
//  b/c (0,0) is one of the points, d = 0, solve for a,b,c
//
//  A = [ 1 1 1; 1/8 1/4 1/2; 1/64 1/16 1/4 ]
//  Y = [ 1; .5; .2 ]
//
//  AX = Y
//  X = inv(A) * Y
// 
module.exports.easeInOut = function (t) {
	t = Utils.clamp(t, 0, 1);

	var a = -1.067,
		b = 1.6,
		c = 0.467;

	return t * (t * ((a * t) + b) + c);
};