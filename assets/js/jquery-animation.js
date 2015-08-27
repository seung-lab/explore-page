(function ($, undefined) {

/* scrollTo
 *
 * Smoothly scrolls to a particular element.
 *
 * Required:
 *   [0] target: The element to scroll to
 *
 * Optional:
 *     msec: defaults to 250 msec
 *     easing: defaults to ease-in-out-cubic
 *     offset: in pixels (positive scrolls downward more)
 *   [last] callback
 *
 * Return: void
 */
 $.fn.scrollTo = function (target, options, callback) {
 	callback = Utils.findCallback(arguments) || function () {};

 	var _this = $(this);

 	if (target === null) {
 		target = $(this);
 	}

 	if (options === undefined || typeof(options) === 'function') {
 		options = {};
 	}

 	var msec = options.msec || 250;
 	var offset = options.offset || 0;

 	target = $(target).first();
 	
 	var position_offset = target[0] === this[0]
 		? 0
 		: target.position().top;

 	offset += _this.scrollTop() + position_offset;
 	offset = Math.max(offset, 0);

 	window.performance.now = window.performance.now || Date.now;

 	var distance_traveled = 0;
 	var start_time = window.performance.now();
 	var start_pos = this.scrollTop();

 	// if you simply use overflow-y: hidden, the animation is laggy 
 	// so here are some hacks to display like scrolling is allowed without 
 	// actually allowing it
 	_this
 		.addClass('autoscrolling') 
 		.on('mousewheel DOMMouseScroll', function (evt) {
 			evt.preventDefault();
 			evt.stopPropagation();
 		});

 	function animate () {
		var now = window.performance.now();
 		var t = (now - start_time) / msec;

 		if (position_offset - distance_traveled <= 0.0001 || t >= 1) {
 			_this.scrollTop(start_pos + position_offset);
 			_this.removeClass('autoscrolling').off('mousewheel DOMMouseScroll');
 			callback();
 			return;
 		}
 		
 		var proportion = easeInOut(t);

 		distance_traveled = proportion * position_offset;
 		_this.scrollTop(start_pos + distance_traveled);

 		requestAnimationFrame(animate);
 	}

 	requestAnimationFrame(animate);

 	return this;
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
function easeInOut (t) {
	if (t < 0) {
		return 0;
	}
	else if (t > 1) {
		return 1;
	}

	var a = -1.067,
		b = 1.6,
		c = 0.467;

	return t * (t * ((a * t) + b) + c);
}


})(jQuery);