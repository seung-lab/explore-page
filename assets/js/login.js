Login = {};

(function ($, undefined) {
	"use strict";

	Login.introductoryAnimation = function () {
		$('body').scrollTop(0); // necessary to ensure the page always starts at the top even on refresh

		var pixels = $('.gateway').position().top;

		setTimeout(function () {
			$('.logo').addClass('fixed');
			
			$('.intake .parallax').scrollTo('.gateway', {
				msec: 2500,
				easing: Easing.springFactory(.7, 1),
			}, function () {
				$('header').children().removeClass('invisible');
			});
		}, 2500);
	};

})(jQuery);