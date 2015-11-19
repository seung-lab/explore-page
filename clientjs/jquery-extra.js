/* jquery.extra.js
 *
 * jQuery extensions that are kind of random and don't really
 * fit anywhere else.
 */

let $ = require('jquery'),
	Utils = require('./utils.js');

var _placeholderid = 0;

$.fn.checkbox = function (checked) {
	var inputs = $(this);

	var newinputs = [];

	inputs.each(function (index, elem) {
		var input = $(elem);

		var placeholder = $("<span>")
		.css('display', 'none')
		.attr('id', 'checkbox-placeholder-' + _placeholderid);

		_placeholderid++;

		input.before(placeholder);

		checked = checked !== undefined
			? !!checked
			: input.prop('checked');

		var newinput = Utils.UI.checkbox(checked, input);

		placeholder.before(newinput);
		placeholder.remove();

		newinputs.push(newinput);
	});

	return Utils.toCollection(newinputs);
};

/* cycle
 *
 * A replacement for jQuery's confusing 
 * toggle routine that also is extended to
 * take an event handler type.
 * 
 * When a cycle is attached to an element,
 * each activation of that event will trigger
 * the next in the sequence. It will loop to the
 * beginning.
 *
 * e.g. $('div.clicky').cycle('click.cycle1', function (evt) {
 * 
 * }, function (evt) {
 * 
 * }, ... );
 *
 * Required:
 *	[0] type: The event type (e.g. click, mousedown, keyup, etc)   
 *  [1...n] fn: Event handler function
 *
 * Return: this
 */
$.fn.cycle = function () { // (type, fn1, fn2, fn3, .... )
	// arguments is array-like, not an array so we need to convert it
	var args = Array.prototype.slice.call(arguments); 
	var type = args.shift(); // discard type
	var fns = args;

	if (!fns.length || !type) {
		return this;
	}

	var iteration = 0;

	$(this).on(type, function () {
		iteration = iteration % fns.length;
		var fn = fns[iteration];
		iteration++;

		fn.apply(this, arguments);
	});

	return this;
};

/* ion
 *
 * i(dempotent)on. When you do $(selector).on('click', fn)
 * and you don't recreate the element each time, 
 * you have to remember to write it as $(selector).off('click').on('click', fn)
 * to avoid adding the event repeatedly.
 *
 * With this function, you only have to wite this: $(selector).ion('click', fn)
 *
 * Required: Same as jQuery.on
 *
 * Return: this
 */
$.fn.ion = function (type, fn) {
	return $(this).off(type).on(type, fn);
};

/* stationaryClick
 *
 * Isolates a click from a drag.
 *
 * Algorithm: Cancel click handler if a significant mouse move was triggered
 * 			  This is so that we can avoid having to press e.g. shift to do
 * 			  cube selection.
 * 
 * 			  A significant mouse move is a radial distance greater than 
 * 			  one pixel. Zero works as well, but one allows for shaky hands.
 *
 * Required:
 *   [0] fn
 *
 * Return: this
 */
$.fn.stationaryClick = function (fn) {
	var oldpos = { x: 0, y: 0 };
	var fire_mouse_up = true;

	return $(this)
		.mousedown(function (e) {
			fire_mouse_up = true;
			oldpos = Utils.UI.eventOffset(this, e);
		})
		.mousemove(function (e) {
			var newpos = Utils.UI.eventOffset(this, e);
			var r2 = Math.pow(newpos.x - oldpos.x, 2) + Math.pow(newpos.y - oldpos.y, 2);

			if (r2 > 1) { // r > 1 pixels
				fire_mouse_up = false;
			}
		})
		.mouseup(function () {
			if (fire_mouse_up) {
				fn.apply($(this), arguments);
			}
		});
};

/* drag
 *
 * Fire only when the mouse button is depressed and the mouse is moving.
 *
 * Required:
 *   [0] fn - callback
 *
 * Return: self
 */
$.fn.drag = function (fn) {
	var dragging = false;

	var elem = $(this);

	var klass = 'drag-' + _placeholderid;
	_placeholderid++;

	return elem
		.on('mousedown', function (evt) {
			dragging = true;

			var which = evt.which,
				button = evt.button;

			$(document).on('mousemove.' + klass, function () {
				if (!dragging) { return; }

				arguments[0].which = which;
				arguments[0].button = button;

				fn.apply(elem, arguments);
			});

			$(document).one('mouseup', function () {
				dragging = false;
				$(document).off('mousemove.' + klass);
			});
		});
};

$.fn.disableScrolling = function () {
	$(this).ion('wheel.disableScrolling', function (e) {
		e.preventDefault();
	});
};
