"use strict";

let Utils = require('./utils.js');

/* springFactory
 * 
 * Simulate an actual spring.
 *
 * For a very detailed explaination see:
 * https://medium.com/@willsilversmith/the-spring-factory-4c3d988e7129
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

/* bounceFactory
 *
 * Simulate a physical bouncing motion based on physics equations of motion.
 *
 * We assume mass and gravity = 1 as they are immaterial when we normalize both
 * the y and t axis to 1. The length of the animation in msec will determine "gravity"
 * and the elasticity will determine the number of bounces.
 *
 * Required:
 *   [0] elasticity: [0..1), how much fractional energy is retained after each bounce
 * 
 * Optional:
 *   [1] threshold: [0..1],  (default 0.1%) percent of energy remaining 
 *         at which to terminate the animation
 *
 * Return: f(t), t in 0..1
 */
module.exports.bounceFactory = function (elasticity, threshold) {
	threshold = threshold || 0.001;

	function energy_to_height (energy) {
		return energy; // h = E/mg
	}

	function height_to_energy (height) {
		return height; // E = mgh
	}

	function bounce_time (height) {
		return 2 * Math.sqrt(2 * height); // 2 x the half bounce time measured from the peak
	}

	function speed (energy) {
		return Math.sqrt(2 * energy); // E = 1/2 m v^2, s = |sqrt(2E/m)|
	}

	var height = 1;
	var potential = height_to_energy(height);

	var bounces = elasticity === 1 // a perfectly elastic object will never settle
		? 100
		: Math.ceil(Math.log(threshold / potential) / Math.log(elasticity));

	// The critical points are the points where the object contacts the "ground"
	// Since the object is initially suspended at 1 height, this either creates an
	// exception for the following code, or you can use the following trick of placing
	// a critical point behind 0 and representing the inital position as halfway though
	// that arc.

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
		potential *= elasticity; // remove energy after each bounce

		critical_points.push({
			time: time,
			energy: potential,
		});

		height = energy_to_height(potential);
	}

	var duration = time; // renaming to emphasize it's the total time now

	return function (t) {
		t = Utils.clamp(t, 0, 1);

		var tadj = t * duration;

		if (tadj === 0) {
			return 0;
		}
		else if (tadj >= duration) {
			return 1;
		}

		// Find the bounce point we are bouncing from, for very long animations (hours, days),
		// an binary search algorithm might be appropriate.
		var index;
		for (index = 0; index < critical_points.length; index++) {
			if (critical_points[index].time > tadj) {
				break;
			}
		}

		var bouncept = critical_points[index - 1];

		// Bouncing from a bounce point effectively resets time as it is a discontinuity
		tadj -= bouncept.time; 

		var v0 = speed(bouncept.energy);

		// Project position of object from bounce point to the current time
		var pos = v0 * tadj + -0.5 * tadj * tadj;

		return 1 - pos;
	};
};

/* sigmoidFactory
 * 
 * Note: Values of alpha below 9 start to show artifacts
 *
 * Optional:
 *	 [0] alpha: (default 12) controls steepness of easing
 *   [1] offset: Subtract this amount from the centerpoint (default 0, useful range -.5 to .5);
 *
 * Return: f(t), t in 0..1
 */
module.exports.sigmoidFactory = function (alpha, offset) {
	offset = offset || 0;

	return function (t) {
		t = Utils.clamp(t, 0, 1);

		if (t <= 0) {
			return 1;
		}
		else if (t >= 1) {
			return 0;
		}

		return 1 / (1 + Math.exp(-alpha * (t - 0.5 - offset)));
	};
};

module.exports.easeInOut = module.exports.sigmoidFactory(12); // a cool default

// Same as easeOutQuad
module.exports.parabolic = function (t) {
	t = Utils.clamp(t, 0, 1);
	return -t * t + 2 * t;
};

module.exports.easeOutQuad = module.exports.parabolic;

module.exports.easeOutCubic = function (t) {
	t = Utils.clamp(t, 0, 1);
	return Math.pow((t - 1), 3) + 1;
};

module.exports.easeOutSine = function (t) {
	t = Utils.clamp(t, 0, 1);
	return Math.sin(2 * Math.PI * t / 4);
};

module.exports.linear = function (t) { return t };



