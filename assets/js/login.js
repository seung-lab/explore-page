Login = {};

(function ($, undefined) {
	"use strict";

	Login.introductoryAnimation = function () {
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