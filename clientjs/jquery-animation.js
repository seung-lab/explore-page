var $ = require('jquery'),
	Utils = require('./utils.js'),
	Easing = require('./easing.js');

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
 *	   offset: extra offset in pixels
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
 	var easing = options.easing || Easing.easeInOut;
 	var offset = options.offset || 0;

 	target = $(target).first();
 	
 	var position_offset = target.position().top - this.scrollTop() + offset;

 	if (position_offset === 0) {
 		return $.Deferred().resolve();
 	}

 	var distance_traveled = 0;
 	var start_pos = this.scrollTop();

 	var req;

 	var deferred = $.Deferred()
 		.done(function () {
 			_this.scrollTop(start_pos + position_offset);
 		})
 		.fail(function () {
 			if (req) {
 				cancelAnimationFrame(req);
 			}
 		});

 	var start_time = window.performance.now();

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

$.fn.drop = function (args) {
	args = args || {};

	var _this = $(this);

	var msec = args.msec,
		easing = args.easing || Easing.linear,
		displacement = args.displacement || 0, // dimensionless fraction of displacement
		side = args.side || 'top';
 	
	var css = _this.css(side);

	var start_pos;
	if (css.match(/calc/)) {
		start_pos = css.replace(/calc\(/, '').replace(/\)$/, '');
	}
	else {
		start_pos = css;
	}

 	var start_time = window.performance.now();

 	_this.css(side, `calc(${start_pos} + ${displacement}px)`);

 	var req;

	var deferred = $.Deferred()
 		.done(function () {
 			_this.css(start_pos);
 		})
 		.fail(function () {
 			if (req) {
 				cancelAnimationFrame(req);
 			}
 		});

 	var distance_traveled = 0;

 	function animate () {
		var now = window.performance.now();
 		var t = (now - start_time) / msec;

 		if (t >= 1) {
 			deferred.resolve();
 			return;
 		}
 		
 		var proportion = easing(t);

 		distance_traveled = proportion * displacement;
 		_this.css(side, `calc(${start_pos} + ${displacement - distance_traveled}px)`);

 		req = requestAnimationFrame(animate);
 	}

 	req = requestAnimationFrame(animate);

 	return deferred;
};

$.fn.scrambleText = function (args = {}) {
	let _this = this;

	let begin = args.start || this.html(),
		end = args.endFirstLine,
		end2 = args.endSecondLine || "",
		msec = args.msec || 2000,
		tick = args.tick || 50,
		updatefn = args.update || function (txt) {
			_this.text(txt);
		};

	if (begin.replace(/ /g, '') === end.replace(/ /g, '')) {
		return $.Deferred().resolve();
	}

	let firsthalf = begin.match(/^(.*)<br>/);
	if (firsthalf) {
		firsthalf = firsthalf[1];
	}

	let begin2 = begin.match(/<br>(.*)$/);
	if (begin2) {
		begin2 = begin2[1];
		begin = firsthalf
	}
	else {
		begin2 = "";
	}

	// Begin and end are now split up between their two lines (if there are any)

	let topSize = end.length;
	let botSize = Math.max(begin2.length, end2.length);

	// Set the top line to be only as long as the finished product
	begin = begin.slice(0, topSize);

	// Pads the strings with spaces so that two all strings have the same length
	function sizedVector (txt, msize) {
		let vector = "";

		for (let i = 0; i < msize; i++) {
			vector += " ";
		}

		let centering = Math.floor((msize - txt.length) / 2);

		for (let i = 0; i < txt.length; i++) {
			vector = Utils.replaceAt(vector, txt[i], i + centering);
		}	

		return vector;
	}

	let begVector = sizedVector(begin, topSize),
		begVector2 = sizedVector(begin2, botSize),
		endVector = sizedVector(end, topSize),
		endVector2 = sizedVector(end2, botSize);

	let alphabet = []
	alphabet = Utils.unique(alphabet.concat(end.concat(end2).split(""))).filter( x => x !== ' ' )

 	let req;

	let deferred = $.Deferred()
 		.done(function () {
 			if (end2) {
 				updatefn(endVector.concat("<br>", endVector2).trim());
 			} else {
 				updatefn(endVector.trim());
 			}
 		})
 		.always(function () {
 			clearInterval(req);
 		});

 	let start_time = window.performance.now();

 	// sets the speed at which the scrambler will hurry up and choose correct characters
 	let easing = function (t) {
 		return 1 - Math.pow(t*t - 2*t + 1, 1.5);
 	};

 	req = setInterval(function () {
 		let now = window.performance.now();

 		let t = (now - start_time) / msec;

 		if (t >= 1) {
 			deferred.resolve();
 			return;
 		}

 		let all_solved = true;
 		// first go through the top string
 		// currently, the top string is begVector -> endVector
 		// the bottom string is begVector2 -> endVector2
 		function copyThroughScramble (firstString, secondString) {
	 		for (let i = 0; i < secondString.length; i++) {
	 			if (firstString[i] === secondString[i]) {
	 				continue;
	 			}
	 			if (firstString[i] === ' ') {
	 				firstString = Utils.replaceAt(firstString, secondString[i], i);
	 			}
	 			else if (easing(t) >= Math.random()) {
	 				firstString = Utils.replaceAt(firstString, secondString[i], i);
	 			}
	 			else {
	 				firstString = Utils.replaceAt(firstString, Utils.random_choice(alphabet), i);
	 				all_solved = false;
	 			}
	 		}
	 	}
	 	copyThroughScramble(begVector, endVector);

 		// now got through the bottom string, if there is one
 		if (end2) {
 			copyThroughScramble(begVector2, endVector2);

	 		if (all_solved) {
	 			deferred.resolve();
	 		} else {
	 			updatefn(begVector.concat("<br>", begVector2));
	 		}
 		} else {
	 		if (all_solved) {
	 			deferred.resolve();
	 		}
	 		else {
	 			updatefn(begVector);
	 		}
	 	}

 	}, tick);

 	return deferred;
};

/* cssAnimation
 *
 * Execute a css animation by attaching an animation
 * class and removing it once complete.
 *
 * Required: 
 *   [0] animation_class: (string) CSS class that contains a
 *		   complete description of the animation.
 *
 * Optional:
 *   [1] final_state_class: (string) CSS class that represents the 
 *     static terminal state of the animation.
 *   [2] callback
 * 
 * Returns: this
 */
$.fn.cssAnimation = function (animation_class, final_state_class) {
	let deferred = $.Deferred();
	let _this = this;

	deferred.always(function () {
		$(_this)
			.addClass(final_state_class)
			.removeClass(animation_class);
	})

	$(this)
		.addClass(animation_class)
		.motionend(function () {
			deferred.resolve();
		});

	return deferred;
};


/* animationend
 *
 * Shorthand for all the browser prefixes
 * for a one off animation end event.
 *
 * Required: 
 *   [0] fn
 * 
 * Returns: this 
 */
$.fn.animationend = function (fn) {
	return $(this).one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', fn);
};

$.fn.animationoff = function () {
	return $(this).off('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd');
};

$.fn.transitionend = function (fn) {
	return $(this).one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', fn);
};

$.fn.transitionoff = function () {
	return $(this).off('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd');
};

$.fn.motionend = function (fn) {
	return $(this).one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', fn);
};

