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
 *
 * Return: void
 */
 $.fn.scrollTo = function (target, options) {
 	var _this = $(this);

 	if (target === null) {
 		target = $(this);
 	}

 	if (options === undefined || typeof(options) === 'function') {
 		options = {};
 	}

 	var msec = options.msec || 250;
 	var offset = options.offset || 0;
 	var easing = options.easing || Easing.easeInOut;

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

 	var req;

 	var deferred = $.Deferred()
 		.done(function () {
 			_this.scrollTop(start_pos + position_offset);
 		})
 		.fail(function () {
 			if (req) {
 				cancelAnimationFrame(req);
 			}
 		})
 		.always(function () {
 			_this.removeClass('autoscrolling').off('mousewheel DOMMouseScroll');
 		});

 	function animate () {
		var now = window.performance.now();
 		var t = (now - start_time) / msec;

 		if (t >= 1) {
 			deferred.resolve();
 			return;
 		}
 		
 		var proportion = easing(t);

 		distance_traveled = proportion * position_offset;
 		_this.scrollTop(start_pos + distance_traveled);

 		req = requestAnimationFrame(animate);
 	}

 	req = requestAnimationFrame(animate);

 	return deferred;
 };

})(jQuery);