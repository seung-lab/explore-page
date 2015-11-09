var $ = require('jquery');

(function () {
	var GAP = 200;
	var last = 0;
	var lastDelta = null;
	var lastStart = 0;

	$(window).ion('wheel', function (e) {
		e = e.originalEvent;
		var now = performance.now();

		var currentDelta = Math.abs(e.deltaY);

		// console.log('currentDelta', currentDelta);

		// yay magic numbers
		if (currentDelta > 0 &&
			((now - last > GAP) ||
			(now - lastStart > GAP && lastDelta !== null && currentDelta > lastDelta * 3))) {

			lastStart = now;

			$(window).trigger('scrollStart', e.deltaY > 0);
		}

		lastDelta = currentDelta;
		last = now;
	});
})();

$(window).ion('scrollStart', function (e, down) {
	console.log('scrollStart', down);
});
