var $ = require('jquery'),
	Hammer = require('hammerjs');

$(document).ready(function () {
	let mc = new Hammer.Manager(document.body);
	mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
	mc.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_VERTICAL })).recognizeWith(mc.get('pan')); // todo, what does this do?


	mc.on('swipe', function (evt) {
		$(window).trigger('swipe', evt);
	});

	mc.on('panstart panmove', function (evt) {
		$(window).trigger('panmove', evt);
	});

	mc.on("hammer.input", function(evt) {
		if (evt.isFinal) {
			$(window).trigger('liftoff', evt);
		}
	});
});
