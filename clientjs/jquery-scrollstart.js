var $ = require('jquery');

$(document).ready(function () {
	var GAP = 500;
	var lastStart = 0;

	var accumulate = 0;
	var accThreshold = 30;

	var trendTime = 100;
	var trend = [];
	var trendPercOverride = 1/3; // if 1/3 of the events are decrementing, reset the accumulate


	$(window).ion('wheel.scrollStart', function (e) {
		e = e.originalEvent;

		var now = performance.now();

		trend.push({ val: e.deltaY, time: now});

		for (var i = 0; i < trend.length; i++) {
			if (now - trend[i].time <= trendTime) {
				break;
			}
		}

		trend = trend.slice(i);

		if (now - lastStart < GAP) {
			return;
		}

		// see if the trend is decreasing (scroll event winding down) 
		var downCount = 0;
		for (var i = 1; i < trend.length; i++) {
			var magDelta = Math.abs(trend[i].val) - Math.abs(trend[i - 1].val);

			if (magDelta < 0) {
				downCount++;
			}
		}

		if (downCount / trend.length > trendPercOverride) {
			accumulate = 0;
			return;
		}			

		if (Math.sign(e.deltaY) !== Math.sign(accumulate)) {
			accumulate = 0;
		}

		accumulate += e.deltaY;

		if (Math.abs(accumulate) >= accThreshold) {
			$(window).trigger('scrollStart', accumulate > 0);
			accumulate = 0;
			lastStart = now;
		}
	});
});