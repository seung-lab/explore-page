Login = {};

(function ($, undefined) {
	"use strict";

	Login.component = function (name, klass, selector) {
		if (klass !== undefined) {
			GLOBAL.components[name] = React.render(
				React.createElement(klass, null), $(selector)[0]
			);
		}
		
		return GLOBAL.components[name];
	};

	Login.progressController = function () {
		// this will control global t
	};

	Login.IntakeView = function () {
		var _this = this;


		_this.playIntro = function () {
			$('body').scrollTop(0); // necessary to ensure the page always starts at the top even on refresh

			var pixels = $('.gateway').position().top;

			setTimeout(function () {
				$('#gateway-logo').addClass('shrink'); // triggers shrinking transition
				
				$('#viewport').scrollTo('.gateway', {
					msec: 2500,
					easing: Easing.springFactory(.7, 1),
				})
				.done(function () {
					Login.component('header').setState({ visible: true });
				});
			}, 2500);
		};
	};

	Login.IntakeController = function () {
		var _this = this;

		_this.view = new Login.IntakeView();
		
		_this.playIntro = _this.view.playIntro;
	};


})(jQuery);