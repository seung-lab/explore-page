/* centerIn.js
 *
 * jQuery plugin that allows you to center an element within an element.
 *
 * e.g. 
 *
 * $(element).centerIn(); // centers horizontally and vertically in parent
 * $(element).centerIn(window); // centers horizontally and vertically in window
 * $(element).centerIn(window, { direction: 'vertical' ); // centers vertically in window
 * $(element).centerIn(window, { top: "-20%" }); // centers vertically in window offset upwards by 20%
 * $(element).alwaysCenterIn(window); // deals with resize events
 *
 * Author: William Silversmith
 * Affiliation: Seung Lab, Brain and Cognitive Sciences Dept., MIT
 * Date: August 2013 - February 2014
 */
;(function($, undefined) {

	/* centerIn
	 *
	 * Centers the element with respect to
	 * the first element of the given selector
	 * both horizontally and vertically.
	 *
	 * Required:
	 *	 [0] selector: The element to center within
	 *   [1] options or callback
	 *   [2] callback (if [1] is options): Mostly useful for alwaysCenterIn
	 *
	 * Options:
	 *	 direction: 'horizontal', 'vertical', 'both' (default)
	 *	 top: Additional offset in px
	 *	 left: Additional offset in px
	 *
	 * Returns: void
	 */
	$.fn.centerIn = function (selector, options, callback) {
		var elements = this;
		options = options || {};

        if (typeof(options) === 'function') {
            callback = options;
            options = {};
        }

		var direction = options.direction || $.fn.centerIn.defaults.direction;
		var extraleft = options.left || 0;
		var extratop = options.top || 0;

		if (selector) {
			selector = $(selector).first();
		}
		else {
			selector = elements.first().parent();
		}

		try {
			if (!selector.css('position') || selector.css('position') === 'static') {
				selector.css('position', 'relative'); 
			}
		}
		catch (e) {
			// selector was something like window, document, html, or body
			// which doesn't have a position attribute
		}

		var horizontal = function (element) {
			var left = Math.round((selector.innerWidth() - element.outerWidth(false)) / 2);
			left += translateDisplacement(selector, extraleft, 'width');
			element.css('left', left + "px");
		};

		var vertical = function (element) {
			var top = Math.round((selector.innerHeight() - element.outerHeight(false)) / 2);
			top += translateDisplacement(selector, extratop, 'height');
			element.css('top', top + "px");
		};

		var centerfn = constructCenterFn(horizontal, vertical, callback, direction);

		elements.each(function (index, element) {
			element = $(element);

			if (element.css("position") !== 'fixed') {
				element.css("position", 'absolute');
			}
			centerfn(element);
		});

		return this;
	};

	/* alwaysCenterIn
	 * 
	 * Maintains centering even on window resize.
	 */
	$.fn.alwaysCenterIn = function () {
		var args = arguments || []; 
		var selector = $(this);

		selector.centerIn.apply(selector, args);

		var evt = 'resize.centerIn';
        if (selector.attr('id')) {
            evt += '.' + selector.attr('id');
        }

        $(window).off(evt).on(evt, function () {
			selector.centerIn.apply(selector, args);
		});

		return this;
	 };

	/* Defaults */

	$.fn.centerIn.defaults = {
		direction: 'both'
	};

    /* translateDisplacement
     *
     * Translates dimensionless units, pixel measures, and percent
     * measures into px.
     *
     * Required: 
     *   [0] selector: Container, relevant for percent measures
     *   [1] value: Amount to displace. e.g. 5, "5px", or "5%"
     *   [2] direction: 'width' or 'height'
     * 
     * Returns: px
     */
    function translateDisplacement(selector, value, direction) {
        if (typeof(value) === 'number') {
            return value;
        }
        else if (/px$/i.test(value)) {
            return parseFloat(value.replace('px', ''), 10);
        }
        else if (/%$/.test(value)) {
            var total = (direction === 'width')
                ? $(selector).innerWidth()
                : $(selector).innerHeight();

            value = parseFloat(value.replace('%', ''), 10);
            value /= 100;

            return value * total;
        }

        return parseFloat(value, 10);
    }

    /* constructCenterFn
     *
     * Constructs an appropriate centering function
     * that includes vertical, horizontal, and callback
     * functions as applicable.
     *
     * Returns: fn
     */
	function constructCenterFn(horizontal, vertical, callback, direction) {
        var fns = []

		if (!direction || direction === 'both') {
			fns.push(vertical);
            fns.push(horizontal);
		}
		else if (direction === 'horizontal') {
            fns.push(horizontal);
		}
		else if (direction === 'vertical') {
            fns.push(vertical);
		}

        if (callback) {
            fns.push(callback);
        }

		return Utils.compose(fns);
	}
})(jQuery);

// e.g. If using Zepto.js instead of jQuery proper.
// Feel free to remove if necessary.

(function ($) {
	if (!$.fn.innerHeight) {
		$.fn.innerHeight = function () {
			var selector = $(this).first();

			if (selector[0] == document) {
				return "innerHeight" in window 
               		? window.innerHeight
               		: document.documentElement.offsetHeight; 
			}

			var style = window.getComputedStyle(selector[0]) || { 
				"padding-top": 0, 
				"padding-bottom": 0,
			};

			return selector.height() + parseFloat(style["padding-top"], 10) + parseFloat(style["padding-bottom"], 10);
		};
	}

	if (!$.fn.innerWidth) {
		$.fn.innerWidth = function () {
			var selector = $(this).first();

			if (selector[0] == document) {
				return "innerHeight" in window 
               		? window.innerWidth
               		: document.documentElement.offsetWidth; 
			}

			var style = window.getComputedStyle(selector[0]) || { 
				"padding-left": 0, 
				"padding-right": 0,
			};

			return selector.width() + parseFloat(style["padding-left"], 10) + parseFloat(style["padding-right"], 10);
		};
	}

	if (!$.fn.outerHeight) {
		$.fn.outerHeight = function (include_margin) {
			var selector = $(this).first();
			var style = window.getComputedStyle(selector[0]) || { 
				"border-top-width": 0, 
				"border-bottom-width": 0,
				"margin-top": 0,
				"margin-bottom": 0,
			};

			var height = selector.innerHeight();
			height += parseFloat(style['border-top-width'], 10) + parseFloat(style['border-bottom-width'], 10);

			if (include_margin) {
				height += parseFloat(style['margin-top'], 10) + parseFloat(style['margin-bottom'], 10);
			}

			return height;
		};
	}

	if (!$.fn.outerWidth) {
		$.fn.outerWidth = function (include_margin) {
			var selector = $(this).first();
			var style = window.getComputedStyle(selector[0]) || { 
				"border-left-width": 0, 
				"border-right-width": 0,
				"margin-left": 0,
				"margin-right": 0,
			};

			var width = selector.innerWidth();
			width += parseFloat(style['border-left-width'], 10) + parseFloat(style['border-right-width'], 10);

			if (include_margin) {
				width += parseFloat(style['margin-left'], 10) + parseFloat(style['margin-right'], 10);
			}

			return width;
		};
	}
})(jQuery || Zepto);

