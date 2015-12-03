"use strict";

let $ = require('jquery'),
	Utils = require('./utils.js'),
	Easing = require('./easing.js'),
	Validate = require('./validate.js'),
	Gateway = require('../components/gateway.js'),
	Header = require('../components/header.js'),
	Registration = require('../components/registration.js'),
	Authentication = require('../components/authentication.js'),
	_ = require('./localeplanet-translate.js');

let Login = {};

let _components = {};
let _stage_transition = $.Deferred().resolve();

Login.initialize = function () {
	_components.header = new Header({ 
		anchor: '#header',
		name: "Header",
		login: Login,
	});

	_components.header.enter().render();

	_components.gateway = new Gateway({ 
		anchor: '#gateway',
		login: Login,
	});
	_components.gateway.enter();
	_components.gateway.render();

	_components.registration = new Registration({ 
		anchor: '#intake',
		login: Login,
	});

	_components.authentication = new Authentication({
		anchor: '#intake',
		login: Login,
	})
};

Login.initRegistration = function (transition) {
	_components.registration.enter(transition);

	_components.header.mode = 'register';
	_components.header.render();
}

Login.initLogin = function (transition) {
	_components.authentication.enter(transition);
};

Login.initExploring = function (transition) {
	transition = transition || $.Deferred().resolve();

	_components.header.hide = true;
	_components.header.mode = 'register';
	_components.header.render();

	transition.done(function () {
		_components.header.hide = false;
		_components.header.render();
	});

	Login.bindResizeEvents('explore');
};

Login.bindResizeEvents = function (stage) {
	if (stage === 'gateway'
		|| stage === 'intake'
		|| stage === 'explore') {

		$(window).ion('resize', function () {
			Login.takeMeTo(stage);
		});
	}
	else {
		throw new Error(`A valid stage was not provided: ${stage}`);
	}
};

Login.takeMeTo = function (stage, options) {
	options = options || { msec: 0 };

	_stage_transition.reject();

	_stage_transition = $('#viewport').scrollTo(`#${stage}`, options);

	if (stage === 'explore') {
		Login.initExploring(_stage_transition);
		Login.bindResizeEvents('explore');
	}
	else if (stage === 'gateway') {
	 	_components.gateway.attachEvents();
	 	Login.bindResizeEvents('gateway');
	}
	else {
		Login.bindResizeEvents(stage);
	}

	return _stage_transition;
};

Login.IntakeView = function () {
	var _this = this;


	_this.playIntro = function () {
		$('body').scrollTop(0); // necessary to ensure the page always starts at the top even on refresh

		_components.gateway.unattachSwipeEvents();

		let deferred = $.when(
				$('.bumper .Es').imagesLoaded(),
				$('.bumper .dot').imagesLoaded(),
				$('.bumper .E').imagesLoaded()
			)
			.always(function () {
				$('body').scrollTop(0); // necessary to ensure the page always starts at the top even on refresh
			});

		setTimeout(function () {
			deferred.done(function () {
				$('#bumper').addClass('visible') // triggers shrinking transition
				$('#intake-logo').addClass('shrink') // triggers shrinking transition

				setTimeout(function () {
					$('#viewport').scrollTo('.gateway', {
						msec: 2500,
						easing: Easing.springFactory(.7, 1),
					})
					.done(function () {
						$('#bumper').addClass('no-rule');
						_components.gateway.attachEvents();
					});
				}, 1050);

				Login.bindResizeEvents('gateway');
			});
		}, 1050);

		mixpanel.track('play-intro');
	};
};

Login.IntakeController = function () {
	var _this = this;

	_this.view = new Login.IntakeView();
	
	_this.playIntro = _this.view.playIntro;
};

Login.continueOn = function () {
	var continueParam = $.url().param('continue') || "";
	document.location.href = "./" + continueParam;
};

/* togglePasswordVisibility
 *
 * Makes paswords visible or invisible depending on
 * whether a user toggles the show/hide control.
 *
 * Optional:
 *   [0] evt: Event passthrough
 *
 * Returns: void
 */
Login.togglePasswordVisibility = function (evt) {
	var password = $(evt.target).parent().find('input[name=password]');
	var toggle = $(evt.target);

	if (password.attr('type') === 'password') {
		password.attr('type', 'text');
		toggle
			.text(_('hide'))
			.addClass('visible');
	}
	else {
		password.attr('type', 'password');
		toggle
			.text(_('show'))
			.removeClass('visible');
	}

	// This is to fix a rendering bug
	// that centered the text in the field
	// temporarily.
	password.focus();
};

/* standardAuthenticate
 *
 * Logs in user and redirects to EyeWire or displays error messages.
 *
 * Required:
 *	username
 *	password
 *  coordinator
 *
 * Returns: void
 */
Login.standardAuthenticate = function (args) {
	args = args || {};

	var coordinator = args.coordinator;

	Validate.Login.username(args.username, coordinator);

	var deferred = $.Deferred();

	if (!args.password) {
		coordinator.lazySet('password', false, 'minimum-length');
	}

	if (!coordinator.execute()) {
		focusOnFirstError(coordinator, 'login');
		return;
	}

	var postdata = {
		username: args.username,
		password: args.password
	};
	
	$.post("/1.0/internal/account/authenticate/standard/", postdata, function (response) {
		if (!response) {
			// error handling
		}
		
		response = $.parseJSON(response);

		if (response.success) {
			continueOn();
		}
		else {
			var keys = ['username', 'password'];

			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];

				if (response.error[key]) {
					coordinator.lazySet(key, false, response.error[key]);
				}
			}
			coordinator.execute();
			focusOnFirstError(coordinator, 'login');
		}
	});
};

/* facebookLogin
 *
 * Attempt to login via facebook.
 *
 * Required:
 *    access_token: The authentication token granted by the facebook async api
 *
 * Returns: void
 */
Login.facebookLogin = function (args) {
	var postdata = {
		access_token: args.access_token
	};

	var loginbtn = $('#fb-login').addClass('loading');
	$.post("/1.0/internal/account/authenticate/facebook/", postdata, function (response) {
		loginbtn.removeClass('loading');
		if (!response) {
			// error handling
		}
		
		response = $.parseJSON(response);
		
		if (response.success) {
			continueOn();
		}
		else {
			if (response.error.length) {
				$('#loginsocialerror').text(
					loginFacebookAccountFixtext(response.error[0])
				).slideFadeIn();
			}
		}
	});	
};

/* standardRegistration
 *
 * Attempt to register and sign in using standard
 * username/password authentication.
 *
 * Required:
 *   username
 *   password
 *   email
 *
 * Returns: void
 */
Login.standardRegistration = function (args) {
	args = args || {};

	let zl = (str) => str.length ? false : 'zero-length';

	if (!args.username || !args.password || !args.email) {
		return $.Deferred().reject({
			reasons: {
				username: zl(args.username),
				password: zl(args.password),
				email: zl(args.email),
			},
		});
	}

	var postdata = {
		username: args.username,
		password: args.password,
		email: args.email
	};

	var deferred = $.Deferred();

	$.post("/1.0/internal/account/register/standard/", postdata)
		.done(function (response) {
			if (!response) {
				deferred.reject();
				return;
			}
			
			response = $.parseJSON(response);
			
			if (response.success) {
				deferred.resolve();
			}
			else {
				deferred.reject(response);
			}
		})
		.fail(function () {
			deferred.reject({
				reasons: { 'network-failure': true },
			});
		});

	return deferred;
};


/* facebookRegistration
 *
 * 
 *
 * Required:
 *   username
 *   access_token
 *   coordinator
 *
 * Return: 
 */
Login.facebookRegistration = function (args) {
	args = args || {};

	let deferred = $.Deferred();

	var coordinator = args.coordinator;
	var username = args.username || "";

	Validate.Registration.username(username, coordinator);

	if (!coordinator.execute()) {
		focusOnFirstError(coordinator, 'register');
		return deferred.reject({
			invalid_parameters: true,
		}).promise();
	}

	if (!args.username || !args.access_token) {
		return deferred.reject({
			missing: true,
		}).promise();
	}

	var postdata = {
		username: username,
		access_token: args.access_token
	};

	$.post("/1.0/internal/account/register/facebook/", postdata, function (response) {
		response = $.parseJSON(response);
		
		if (response.success) {
			Login.continueOn();
			deferred.resolve();
		}
		else {
			deferred.reject(response.reasons);

			if (response.reasons.username) {
				coordinator.set('username', false, response.reasons.username);
			}
			else if (response.reasons.access_token) {
				$('#registersocialerror').text(
					registrationAccessTokenFixtext(response.reasons.access_token)
				).slideFadeIn();
			}
			else if (response.reasons.facebook_account) {
				$('#registersocialerror').text(
					registrationFacebookAccountFixtext(response.reasons.facebook_account)
				).slideFadeIn();
			}
		}
	});

	return deferred.promise();
}

/* configurePage
 *
 * Since the login page can be in either
 * login or register mode, different configuration
 * needs to happen in each case. For instance,
 * different fields must be filled out and the buttons
 * and form submission behave differently.
 *
 * Required:
 *    [0] mode: 'login' or 'registration'
 *
 * Returns: void
 */
Login.configurePage = function (mode) {
	if (mode === 'login') {
		Login.configureLoginPage();
	}
	else if (mode === 'reset-password') {
		PasswordReset.configurePage();
	}
	else {
		Login.configureRegistrationPage();
	}

	Login.keepQueryOnToggle();

	$('.passwordvisibilitytoggle').click(Login.togglePasswordVisibility);

	$('header').click(function (evt) {
		var href = $('header a').first().attr('href');
		window.open(href, '_blank');
	});

	$('header a').click(function (evt) {
		evt.stopPropagation();
	});

	$('span[ruled]').each(function (index, elem) {
		Utils.UI.ruledText(elem);
	});

	$('#sponsor').maybeAlwaysCenterIn(window, {
		direction: "horizontal",
	});
};


Login.keepQueryOnToggle = function () {
	var linkUrl = $('#togglemode').attr('href');

	var query = Utils.mergeQueries(window.location.href, linkUrl);
	var linkPath = $.url(linkUrl).data.attr.path;

	$('#togglemode').attr('href', linkPath + query);
};

/* configureForgotPassword
 *
 * Configures the behavior of the forgot? link.
 *
 * Required: None
 *
 * Returns: void
 */
function configureForgotPassword () {
	var throttledpost = Utils.UI.throttle(2500, $.post);

	var forgotcoordinator = new Coordinator.Coordinator({
		set: { sent: false },
		success: function (conds, data) {
			$('#loginpassworderror').text(
				loginForgotPasswordFixtext('success')
			).slideFadeIn();		
		},
		failure: function (conds, data) {
			$('#loginpassworderror').text(
				loginForgotPasswordFixtext(data.sent)
			).slideFadeIn();

			if (data.sent === 'no-identifier' || data.sent === 'user-not-found') {
				$('#username').addClass('error').focus();
			}
		}
	});

	$('#forgotpassword').on("click", function () {
		var username = $.trim($('#username').val());

		if (!username) {
			forgotcoordinator.set('sent', false, 'no-identifier');
			return;
		}

		var data = {
			identifier: username
		};

		throttledpost('/1.0/internal/account/password-reset/issue-token/', data, function (response) {
			if (!response) {
				return;
			}
			response = $.parseJSON(response);

			if (response.success) {
				forgotcoordinator.set('sent', true);
			}
			else {
				forgotcoordinator.set('sent', false, response.reason);
			}
		});
	});

	var wasreset = $.url(document.location.href).param('password_was_reset');
	if (wasreset) {
		$('#pitch')
			.text(_('Your password was reset.'))
			.show();
	}
}

Login.loginFacebookSelectionHandler = function (username, coordinator) {
	var deferred = $.Deferred();

	var FB = window.FB;

	FB.getLoginStatus(function (response) {
		if (response.status === 'connected') {
			Login.facebookLogin({
				access_token: response.authResponse.accessToken,
				coordinator: coordinator,
			})
			.then(deferred.resolve, deferred.reject);
		}
		else {
			FB.login(function (loginresponse) {
				 if (loginresponse.authResponse) {
				 	Login.facebookLogin({
						access_token: loginresponse.authResponse.accessToken,
						coordinator: coordinator,
					})
					.then(deferred.resolve, deferred.reject);
				 }
			});
		}
	});

	return deferred;
};

Login.registrationFacebookSelectionHandler = function (username, coordinator) {
	var deferred = $.Deferred();

	var FB = window.FB;

	Validate.Registration.username(username, coordinator)
		.done(function () {
			if (!coordinator.execute()) {
				deferred.reject('username');
				return;
			}

			FB.getLoginStatus(function (response) {
				if (response.status === 'connected') {
					Login.facebookRegistration({
						username: username,
						access_token: response.authResponse.accessToken,
						coordinator: coordinator,
					})
					.then(deferred.resolve, deferred.reject);
				}
				else {
					FB.login(function (loginresponse) {
						 if (loginresponse.authResponse) {
						 	Login.facebookRegistration({
						 		username: username,
								access_token: loginresponse.authResponse.accessToken,
								coordinator: coordinator,
							})
							.then(deferred.resolve, deferred.reject);
						 }
					}, {
						scope: "email"
					});
				}
			});
		});

	return deferred;
}

module.exports = Login;
