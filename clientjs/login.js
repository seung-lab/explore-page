"use strict";

let $ = require('jquery'),
	Utils = require('./utils.js'),
	Easing = require('./easing.js'),
	Validate = require('./validate.js'),
	Gateway = require('../components/gateway.js'),
	Header = require('../components/header.js'),
	Registration = require('../components/registration.js'),
	_ = require('./localeplanet-translate.js');
	// ModuleCoordinator = require('./controllers/ModuleCoordinator.js')

let Login = {};

let _components = {};

Login.initialize = function () {
	_components.header = new Header({ 
		anchor: '#header',
		name: "Header",
	});

	_components.header.enter().render();

	_components.gateway = new Gateway({ 
		anchor: '#gateway',
		login: Login,
	});
	_components.gateway.enter();

	_components.registration = new Registration({ 
		anchor: '#intake',
		login: Login,
	});
};

Login.initRegistration = function () {
	_components.registration.enter();
}

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

Login.takeMeTo = function (stage) {
	$('#viewport').scrollTo(`#${stage}`, {
		msec: 0,
	});

	Login.bindResizeEvents(stage);
};

Login.IntakeView = function () {
	var _this = this;


	_this.playIntro = function () {
		$('body').scrollTop(0); // necessary to ensure the page always starts at the top even on refresh

		setTimeout(function () {
			$('#gateway-logo').addClass('shrink'); // triggers shrinking transition
			
			$('#viewport').scrollTo('.gateway', {
				msec: 2500,
				easing: Easing.springFactory(.7, 1),
			})
		}, 2500);
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

	loginValidateUsername(args.username, coordinator);

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

	var loginbtn = $('.login button.playnow').addClass('loading');
	$.post("/1.0/internal/account/authenticate/standard/", postdata, function (response) {
		loginbtn.removeClass('loading');
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
			continueOn();
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

/* configureLoginPage
 *
 * Required: none
 *
 * Returns: void
 */
Login.configureLoginPage = function () {
	var logincoordinator = createLoginCoordinator();

	$('.login').show();
	$('.playnow').on('click', function (evt) {
		Login.standardAuthenticate({
			username: $('#username').val(),
			password: $('#loginpassword').val(),
			coordinator: logincoordinator
		});
	});

	$('.login .passwordvisibilitytoggle').centerIn('#loginpassword', { 
		direction: 'vertical',
		top: -2
	});

	$('#username')
		.attr('maxlength', 40)
		.thinking({ idle: 1000 }, function () {
			loginValidateUsernameNoLength(this, logincoordinator);
		})
		.on('focus', Utils.UI.trim())
		.on('blur', Utils.UI.trim(function () {
			loginValidateUsernameNoLength(this, logincoordinator);
		}))
		.on('keyup', function () {
			logincoordinator.set('username', true);
		});

	$('#loginpassword')
		.on('keyup', function () {
			logincoordinator.set('password', true);
		});

	$('#fb-login').on('click', function () {
		FB.getLoginStatus(function (response) {
			if (response.status === 'connected') {
				Login.facebookLogin({
					access_token: response.authResponse.accessToken,
					coordinator: logincoordinator
				});
			}
			else {
				FB.login(function (loginresponse) {
					 if (loginresponse.authResponse) {
					 	Login.facebookLogin({
							access_token: loginresponse.authResponse.accessToken,
							coordinator: logincoordinator
						});
					 }
				});
			}
		});
	});

	$(document).keyup(function (evt) {
		if (evt.keyCode === Keycodes.codes.enter) {
			Login.standardAuthenticate({
				username: $('#username').val(),
				password: $('#loginpassword').val(),
				coordinator: logincoordinator
			});
		}
	});

	$('#centerpiece').maybeAlwaysCenterIn(window);

	$('#username').focus();
	configureForgotPassword();
};


/* createLoginCoordinator 
 *
 * Refactoring of configureLoginPage
 *
 * Returns: Coordinator.Coordinator coordinator object
 */
function createLoginCoordinator () {
 	return new Coordinator.Coordinator({
		set: { username: true, password: true },
		test: Coordinator.and,
		failure: function (conds, data) {
			var stack = [
				{
					elem: $('#username'),
					errorelem: $('#usernameerror'),
					fixtextfn: Validate.Login.usernameFixtext,
					condition: 'username'
				},
				{
					elem: $('#loginpassword'),
					errorelem: $('#loginpassworderror'),
					fixtextfn: Login.loginPasswordFixtext,
					condition: 'password',
					onalert: function (msgelem) { 
						$(msgelem).fadeIn(300); 
					},
					onresolved: function (msgelem) { 
						$(msgelem).fadeOut(300); 
					}
				}
			];

			coordinationFailure(stack, conds, data);
		},
		success: function (conds) {
			$('input').removeClass('error');
			$('.errormsg').each(function (index, element) {
				element = $(element);

				if (element.attr('id') === 'loginpassworderror') {
					element.fadeOut(300);
				}
				else {
					element.slideFadeOut();
				}
			});
		},
	});	
}


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

// /* configureRegistrationPage
//  *
//  * Required: none
//  *
//  * Returns: void
//  */
// Login.configureRegistrationPage = function () {
// 	$('#togglemode')
// 		.attr('href', '/login')
// 		.text(_('LOGIN'));

// 	$('#signintype').first().text(_('SIGN UP'));

// 	$('#pitch').show();

// 	$('#username')
// 		.addClass('bottom-rounded')
// 		.attr('placeholder', _('Username'))
// 		.focus();

// 	$('.register.step1').show();

// 	var playcoordinator = new Coordinator.Coordinator({
// 		set: { username: true, password: true, email: true },
// 		test: function (conds) { return conds.username; },
// 		success: function (conds) {
// 			$('#username').removeClass('error');
// 			$('#usernameerror').slideFadeOut();
// 		},
// 		failure: function (conds, data) { 
// 			$('#username').addClass('error');
// 			$('#usernameerror').text(
// 				registrationUsernameFixtext(data.username)
// 			).slideFadeIn();
// 		}
// 	});

// 	PasswordUtils.configurePasswordMeter($('.register .password-strength'));
// 	Login.bindRegistrationAvailabilityHandlers(playcoordinator);

// 	var playnowclickhandler = function () {
// 		Login.validateUsername(playcoordinator, function (data) {
// 			Login.playNowContinueHandler(playcoordinator);
// 		});

// 		if (!playcoordinator.execute()) {
// 			$('#username').focus();
// 		}
// 	};

// 	$('.playnow')
// 		.text(_('SIGN UP'))
// 		.on('click.Register', playnowclickhandler);

// 	$(document).on('keyup.Register', function (evt) {
// 		if (evt.keyCode === Keycodes.codes.enter) {

// 			if (GLOBAL.registration.lastclick === 'facebook') {
// 				registrationFacebookSelectionHandler(playcoordinator);	
// 			}
// 			else {
// 				playnowclickhandler();	
// 			}
// 		}
// 	});

// 	$('#centerpiece').maybeAlwaysCenterIn(window, { top: -50 });

// 	$('#fb-register').on('click', function () {
// 		GLOBAL.registration.lastclick = 'facebook';
// 		registrationFacebookSelectionHandler(playcoordinator);
// 	});

// 	if (!isWebGLEnabled()) {
// 		$('#webGLlink').show();
// 	}
// };

Login.registrationFacebookSelectionHandler = function (username, coordinator) {
	Login.validateUsername(username, coordinator)
		.done(function () {
			if (!coordinator.execute()) {
				return;
			}

			FB.getLoginStatus(function (response) {
				if (response.status === 'connected') {
					Login.facebookRegistration({
						username: username,
						access_token: response.authResponse.accessToken,
						coordinator: coordinator,
					});
				}
				else {
					FB.login(function (loginresponse) {
						 if (loginresponse.authResponse) {
						 	Login.facebookRegistration({
						 		username: username,
								access_token: loginresponse.authResponse.accessToken,
								coordinator: coordinator,
							});
						 }
					}, {
						scope: "email"
					});
				}
			});
		});
}

/* playNowContinueHandler
 *
 * Reconfigures the dialog when the player clicks on 
 * the normal (non-social) sign up button.
 *
 * Required:
 *    [0] playcoordinator: A Coordinator.js object
 *
 * Returns: void
 */
Login.playNowContinueHandler = function (playcoordinator) {
	if (!playcoordinator.execute()) {
		$('#username').focus();
		return;
	}

	playcoordinator.test = Coordinator.and;
	playcoordinator.failure = function (conds, data) {
		var stack = [
			{
				elem: $('#username'),
				errorelem: $('#usernameerror'),
				fixtextfn: Login.registrationUsernameFixtext,
				condition: 'username'
			},
			{
				elem: $('#registrationpassword'),
				errorelem: $('#registrationpassworderror'),
				fixtextfn: Login.registrationPasswordFixtext,
				condition: 'password'
			},
			{
				elem: $('#email'),
				errorelem: $('#emailerror'),
				fixtextfn: Login.registrationEmailFixtext,
				condition: 'email'
			}
		];

		coordinationFailure(stack, conds, data);
	};
	playcoordinator.success = function (conds, data) {
		$('.errormsg').slideFadeOut();
		$('input').removeClass('error');
	};

	var register = Utils.UI.throttle(1000, function () {
		validateUsername(playcoordinator);
		PasswordUtils.quickValidatePassword($('#registrationpassword'), $('#username'), playcoordinator);
		validateEmail($('#email'), playcoordinator);

		if (!playcoordinator.execute()) {
			focusOnFirstError(playcoordinator, 'register');
			return false;
		}

		Login.standardRegistration({
			username: $('#username').val(),
			password: $('#registrationpassword').val(),
			email: $('#email').val(),
			coordinator: playcoordinator
		});

		return true;
	});

	$(document).ion('keyup.Register', function (evt) {
		if (evt.keyCode === Keycodes.codes.enter) {
			register();
		}
	});

	$(window).ion('resize', function () {
		$('#centerpiece').centerIn(window);
	});

	$('#username')
		.thinking('done')
		.off('blur');

	$('.playnow')
		.text(_("PLAY NOW"))
		.addClass('fullwidth')
		.ion('click.Register', register);

	setTimeout(function () { 
		$('#registrationpassword').focus();
		$('#username').on('blur', function () {
			validateUsername(playcoordinator);
		});
	}, 0);

	$('#registersocialerror').hide();
	$('.register.step2').slideFadeIn();
	$('.register.step1 button').hide();
	$('#standard-register').css('width', '100%').show();
};

/* coordinationFailure
 *
 * Provides common error prioritizing for
 * both login and registration coordinators.
 *
 * Required:
 *  [0] stack: [ { elem, condition, errorelem, fixtextfn, onalert, onresolved }, ... ]
 *  [1] conds: from the coordinator's failure callback
 *  [2] data: from the coordinator's failure callback
 *
 * Returns: void
 */
function coordinationFailure(stack, conds, data) {
	var first = true;
	for (var i = 0; i < stack.length; i++) {
		var field = stack[i];
		var msgelem = field.errorelem;

		if (!conds[field.condition]) {
			field.elem.addClass('error');
			if (first) {
				msgelem.text(
					field.fixtextfn(data[field.condition])
				);

				if (!field.onalert) {
					msgelem.slideFadeIn();
				}
				else {
					field.onalert(msgelem);
				}
				
				first = false;
			}
			else {
				if (!field.onresolved) {
					msgelem.slideFadeOut();
				}
				else {
					field.onresolved(msgelem);
				}
			}
		}
		else {
			if ($.trim($(field.elem).val()) === '') {
				first = false; // prevents flickering cascades
			}

			field.elem.removeClass('error');
			if (!field.onresolved) {
				msgelem.slideFadeOut();
			}
			else {
				field.onresolved(msgelem);
			}
		}
	}
}

// /* focusOnFirstError
//  *
//  * Moves the focus to the first error in the registration
//  * workflow.
//  *
//  * Required:
//  *   [0] coordinator: a Coordinator.js object
//  *
//  * Returns: void
//  */
// function focusOnFirstError (coordinator, mode) {
// 	var order; 
// 	var translation;

// 	if (mode == 'login') {
// 		order = ['username', 'password'];
// 		translation = {
// 			username: $("#username"),
// 			password: $("#loginpassword")
// 		};
// 	}
// 	else {
// 		order = ['username', 'password', 'email'];
// 		translation = {
// 			username: $("#username"),
// 			password: $("#registrationpassword"),
// 			email: $("#email")
// 		};
// 	}

// 	for (var i = 0; i < order.length; i++) {
// 		var key = order[i];
// 		if (!coordinator.conds[key]) {
// 			translation[key].one('focus', function (evt) {
// 				evt.stopImmediatePropagation();
// 			}).focus();
// 			translation[key].thinking('cancel');
// 			return;
// 		}
// 	}
// }

module.exports = Login;
