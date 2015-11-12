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
 			_this.removeClass('autoscrolling').off('mousewheel DOMMouseScroll');
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
	let begin = args.start || this.html(),
		end = args.end,
		msec = args.msec || 2000,
		tick = args.tick || 50,
		updatefn = args.update || function (txt) {
			_this.text(txt);
		};

	begin = begin.replace(/<br>/g, ' ');

	if (begin.replace(/ /g, '') === end.replace(/ /g, '')) {
		return $.Deferred().resolve();
	}

	let _this = this;

	let size = Math.max(begin.length, end.length);

	function sizedVector (txt) {
		let vector = "";

		for (let i = 0; i < size; i++) {
			vector += " ";
		}

		let centering = Math.floor((size - txt.length) / 2);

		for (let i = 0; i < txt.length; i++) {
			vector = Utils.replaceAt(vector, txt[i], i + centering);
		}	

		return vector;
	}

	let vector = sizedVector(begin),
		end_vector = sizedVector(end);

	function genAlphabet (start_letter, num) {
		let alphabet = [];
		for (let code = start_letter.charCodeAt(0), i = 0; i < num; i++, code++) {
			alphabet.push(String.fromCharCode(code));
		}
		return alphabet;
	}

	let alphabet = []
		.concat(genAlphabet('a', 26))
		.concat(genAlphabet('A', 26))
		.concat(genAlphabet('0', 10));

 	let req;

	let deferred = $.Deferred()
 		.done(function () {
 			updatefn(end_vector.trim());
 		})
 		.always(function () {
 			clearInterval(req);
 		});

 	let start_time = window.performance.now();

 	updatefn(vector);

 	let probability = 0.15;

 	req = setInterval(function () {
 		let now = window.performance.now();

 		if (now - start_time > msec) {
 			deferred.resolve();
 			return;
 		}

 		let all_solved = true;
 		for (let i = 0; i < vector.length; i++) {
 			if (vector[i] === end_vector[i]) {
 				continue;
 			}

 			if (end_vector[i] === ' ') {
 				vector = Utils.replaceAt(vector, end_vector[i], i);
 			}
 			else if (probability >= Math.random()) {
 				vector = Utils.replaceAt(vector, end_vector[i], i);
 			}
 			else {
 				vector = Utils.replaceAt(vector, Utils.random_choice(alphabet), i);
 				all_solved = false;
 			}
 		}

 		if (all_solved) {
 			deferred.resolve();
 		}
 		else {
 			updatefn(vector);
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

$.fn.transitionoff = function () {
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

