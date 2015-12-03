var $ = require('jquery'),
	Hammer = require('hammerjs'),
	propagating = require('propagating-hammerjs');

Hammer = propagating(Hammer);

$(document).ready(function () {
	let mc = new Hammer.Manager($('#viewport').get(0));
	mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
	mc.add(new Hammer.Swipe({
		direction: Hammer.DIRECTION_ALL,
		velocity: 0.05, // default .65
		threshold: 3, // default 10
	})).recognizeWith(mc.get('pan')); // todo, what does this do?


	mc.on('swipe', function (evt) {
		$(window).trigger('swipe', evt);
	});

	mc.on('panstart panmove', function (evt) {
		$(window).trigger('panmove', evt);
	});

	mc.on("hammer.input", function(evt) {
		if (evt.isFirst) {
			$(window).trigger('touch', evt);
		}
	});

	mc.on("hammer.input", function(evt) {
		if (evt.isFinal) {
			$(window).trigger('liftoff', evt);
		}
	});
});
