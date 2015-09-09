Easing = {};

(function (undefined) {

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
	Easing.springFactory = function (zeta, k, pixels, dynamics) {
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
	Easing.easeInOut = function (t) {
		t = Utils.clamp(t, 0, 1);

		var a = -1.067,
			b = 1.6,
			c = 0.467;

		return t * (t * ((a * t) + b) + c);
	};
})();