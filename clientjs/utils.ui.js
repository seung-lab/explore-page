/*
 *	Utils.UI.js
 *
 *	This is a grab bag of UI utility functions that would be useful
 *	througout the program.
 *
 * Dependencies: 
 *   jQuery (tested with 1.7.1)
 *
 * Author: William Silversmith
 * Affiliation: Seung Lab, MIT 
 * Date: June-September 2013
 */

let $ = require('jquery');

let Utils = {};
Utils.UI = {};

var _placeholderid = 0;

/* forceRepaint
 *
 * Sometimes browsers break. Use this to
 * force an element to repaint.
 *
 * c.f. https://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes
 *
 * Required:
 *   [0] elem
 *
 * Return: void
 */
Utils.UI.forceRepaint = function (elem) {
	elem = $(elem);
	var display = elem.css('display') || "";

	elem = elem[0];

	elem.style.display = 'none';
	elem.offsetHeight; // no need to store this anywhere, the reference is enough
	elem.style.display = display;
};

/* whichClick
 *
 * Returns the label of the button that was clicked 
 * on the mouse.
 *
 * Required:
 *   [0] e
 *
 * Return: left, right, or middle
 */
Utils.UI.whichClick = function (e) {
	var button = {
		1: "left",
		2: "middle",
		3: "right",
	};

	if (e.which !== undefined) {
		return button[e.which];
	}
	else if (e.button !== undefined) {
		return button[e.button + 1];
	}

	throw new Error("Mouse click unknown.");
};

/* eventOffset
 *
 * Gives the (x,y) coordinate of a click
 * relative to the upper left corner of the
 * clicked element.
 *
 * Required:
 *   [0] elem
 *   [1] evt
 *
 * Return: { x: int, y: int }
 */
Utils.UI.eventOffset = function (elem, evt) {
	"use strict";

	var offset = { x: 0, y: 0 };

	if (!(evt.offsetX || evt.offsetY)) {
		offset.x = evt.pageX - $(elem).offset().left;
		offset.y = evt.pageY - $(elem).offset().top;
	} 
	else {
		offset.x = evt.offsetX + ($(evt.target).offset().left - $(elem).offset().left);
		offset.y = evt.offsetY + ($(evt.target).offset().top - $(elem).offset().top);
	}

	return offset;
};

/* escapeHtml
 *
 * Escapes text understood to be potential HTML.
 *
 * Required:
 *   [0] text: a string containing html
 *
 * Returns: Escaped HTML
 */
Utils.UI.escapeHtml = function (text) {
	return $('<span>').text(text).html();
};

/* unescapeHtml
 *
 * Converts escaped HTML to real HTML.
 *
 * Required:
 *   [0] text: a string containing escaped html
 *
 * Returns: HTML
 */
Utils.UI.unescapeHtml = function (text) {
	return $('<span>').html(text).text();
};

/* trim
 *
 * Decorator function that trims the UI text input in addition
 * to performing some callback.
 *
 * e.g. something.click(Utils.UI.trim(fn));
 *
 * Required:
 *    [0] callback
 *
 * Returns: augmented function
 */
Utils.UI.trim = function (callback) {
	return function () {
		this.value = $.trim(this.value);
		if (callback) {
			callback.apply(this, arguments);
		}
	};
};

/* throttle
 *
 * Allows you to throttle the rate that an action
 * e.g. a click can be taken.
 *
 * Required:
 *   [0] msec: The delay time
 *   [1] fn: The function to be executed
 *  
 * Optional:
 *   [2] alternate: A function to execute while throttled
 *
 * Returns: Same as fn or void if msec has not elapsed
 */
Utils.UI.throttle = function (msec, fn, alternate) {
	var lastaction;
	return function () {
		if (!lastaction) {
			lastaction = new Date();
			return fn.apply(this, arguments);
		}

		var delta = (new Date()) - lastaction;

		if (delta >= msec) {
			lastaction = new Date();
			return fn.apply(this, arguments);
		}
		else if (alternate) {
			return alternate.apply(this, arguments);
		}
	};
};

Utils.UI.ttl = function (msec, start_fn, end_fn) {
	var timer;
	var _this = this;

	var timeout = function () {
		var args = arguments;

		clearTimeout(timer);

		timer = setTimeout(function () {
			end_fn.apply(_this, args);
			timer = null;
		}, msec);
	};

	var ret;

	return function (args) {
		args = args || {};
		var reset = !!args.reset,
			kill = !!args.kill;

		if (reset) {
			clearTimeout(timer);
			timer = null;
		}

		if (!timer) {
			ret = start_fn.apply(this, arguments);
		}

		if (kill) {
			return ret;
		}

		timeout.apply(this, arguments);

		return ret;
	};
};

/* moveCaret
 *
 * Moves the text insertion point caret around.
 * It's just a helper function for selectTextRange
 *
 * Graciously lifted from: 
 * http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
 *
 * Required: 
 *   [0] input
 *   [1] pos: integer position, or 'begin' or 'end' to automatically target that slot
 * 
 * Returns: 
 */
Utils.UI.moveCaret = function (input, pos) {
	if (pos === 'begin') {
		pos = 0;
	}
	else if (pos === 'end') {
		pos = $(input).val().length;
	}

	Utils.UI.selectTextRange(input, pos, pos);
};

/* selectTextRange
 *
 * Selects text in a text input / textarea.
 * Graciously lifted from: 
 * http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
 *
 * Required: 
 *    [0] input
 *    [1] selectionStart
 *    [2] selectionEnd  
 * 
 * Returns: void
 */
Utils.UI.selectTextRange = function (input, selectionStart, selectionEnd) {
	input = $(input)[0];

	if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	}
	else if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
};

/* hyperlinkify
 *
 * Converts text containing urls to html hyperlinks.
 *
 * Required:
 *    [0] text: Some text containing urls
 * Optional:
 *    [1] attrs: fill in attributes of the link
 *        target is default _blank
 *
 * Returns: escaped HTML except for hyperlinks
 */
Utils.UI.hyperlinkify = function (text, attrs) {
	text = text || "";
	attrs = attrs || {};

	attrs['target'] = attrs['target'] || "_blank";

	var httpmatch = "(https?:\\/\\/\\S+)";
	var domainmatch = "((:?[^\\s\\.]+\\.)?([^\\s\\.]+)\\.(:?com|org|net|gov|edu|mil|us|ca|eu|co\\.uk)\\S*)";

	var re = new RegExp(httpmatch + "|" + domainmatch, 'ig');

	var matches = text.match(re);

	if (!matches || !matches.length) {
		return Utils.UI.escapeHtml(text);
	}

	var makehyperlink = function (url) {
		var visibletxt = url;
		if (!url.match(/^(https?|ftp):\/\//)) {
			if (url.match(/@/)) {
				if (!url.match(/^mailto:/)) {
					url = "mailto:" + url;
				}
			}
			else {
				url = "http://" + url;
			}
		}

		var link = $("<a>")
			.attr('href', url)
			.text(Utils.UI.escapeHtml(visibletxt));

		$.each(Object.keys(attrs), function (index, key) {
			link.attr(key, attrs[key]);
		});

		return $("<span>").append(link).html(); 
	};

	var html = "";
	var semitext = text;
	for (var i = 0; i < matches.length; i++) {
		var url = matches[i];

		var split = semitext.split(url);

		if (split.length === 0) {
			html += makehyperlink(url);
			continue;
		}

		html += Utils.UI.escapeHtml(split[0]);
		html += makehyperlink(url);

		split.shift();
		semitext = split.join(url) || "";
	}

	html += Utils.UI.escapeHtml(semitext);

	return html;
};

/* ruledText
 *
 * For any span labeled so: <span ruled></span>, this generates
 * a nice horizontal rule that looks like: 
 *
 * | ------ text ------ |
 *
 * Of note: The classes attached to the span will migrate to a 
 * div that contains it.
 *
 * Required: 
 *   [0] elem: The element that required the ruled style
 *
 * Options:
 *    padding: in px
 *
 * Returns: void
 */
Utils.UI.ruledText = function (elem, options) {
	var span = $(elem);
	var options = options || {};

	var container = $('<div>').addClass('ruledtext');

	var left = $('<div>')
		.css('position', 'relative')
		.css('float', 'left');

	var right = $('<div>')
		.css('position', 'relative')
		.css('float', 'right');

	container.append(left).append(right);

	container.addClass(span.attr('class'));
	span.attr('class', '');

	span.before(container);
	span.detach()
		.css('position', 'relative')
		.css('float', 'left');
	container.append(span);

	var parent = container.parent();
	var padding = options.padding || 10;

	var rulewidth = (parent.width() - span.width() - (padding * 2)) / 2;
	rulewidth = rulewidth.toFixed(0);

	left.css('width', rulewidth + "px");
	right.css('width', rulewidth + "px");

	span.centerIn(container, { direction: 'horizontal' });
};

/* instantTextEdit
 *
 * Insert a text edit in place of an element and 
 * return a jQuery deferred object that will let
 * you know the result and will clean up after itself.
 *
 * Required:
 *   [0] elem: Element to replace.
 *
 * Optional:
 *   type: 'text' or 'textarea', replace with this type, default 'text'
 *   value: initial value to store (default contents of elem)
 *
 * Return: deferred, done(val)
 */
Utils.UI.instantTextEdit = function (elem, options) {
	options = options || {};

	var elem = $(elem);
	
	var deferred = $.Deferred();

	var placeholder = $("<span>")
		.css('display', 'none')
		.attr('id', 'ite-placeholder-' + _placeholderid);

	_placeholderid++;

	elem.before(placeholder);

	var input = $("<input>").attr('type', 'text');
	if (options.type === 'textarea') {
		input = $("<textarea>");
	}

	var value = options.value || elem.text();

	input
		.val(value)
		.on('keyup keydown keypress', function (evt) {
			evt.stopPropagation();
		})
		.on('keydown', function (evt) {
			if (evt.keyCode === Keycodes.codes.esc) {
				deferred.reject();
			}
			else if (evt.keyCode !== Keycodes.codes.enter || evt.shiftKey) { 
				return; 
			}
			
			deferred.resolve(input.val());
		});

	deferred.always(function () {
		input.remove();
		placeholder.after(elem);
		placeholder.remove();
	});

	elem.before(input).detach();
	input.focus();

	return deferred;
};

Utils.UI.checkbox = function (state, input) {
	state = !!state;

	var classfn = function (x) {
		return x ? 'on' : 'off';
	};

	var outerbody = $("<div>").addClass('checkbox').addClass(classfn(state));
	var handle = $("<div>").addClass('checkbox-handle');
	outerbody.append(handle);

	input = input 
		? $(input).detach()
		: $("<input>");

	var updateui = function () {
		var checked = input.prop('checked');
		outerbody.removeClass('on off').addClass(classfn(checked));
	};

	input
		.attr('type', 'checkbox')
		.prop('checked', state)
		.css('display', 'none')
		.change(updateui);

	outerbody.append(input).click(function (evt) {
		var checked = input.prop('checked');
		input.prop('checked', !checked);
		updateui();
	});

	return outerbody;
};


Utils.UI.curtainRise = function (fn) {
	let curtain = $('<div>').addClass('curtain');
	$('body').append(curtain);

	setTimeout(function () {
		curtain.cssAnimation('fall')
			.always(function () {
				curtain.remove();
			});

		fn();
	}, 100);
};

Utils.UI.curtainFall = function (fn) {
	let curtain = $('<div>').addClass('curtain fall');
	$('body').append(curtain);

	setTimeout(function () {
		curtain.removeClass('fall').transitionend(fn);
	}, 1000);
};


module.exports = Utils.UI;