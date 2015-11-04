"use strict";

let $ = require('jquery'),
	Utils = require('./utils.js'),
	Easing = require('./easing.js'),
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

	_components.header.enter();

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

function loginFacebookAccountFixtext (reason) {
	if (reason === 'not-registered') {
		return _("Please sign up to use this Facebook account.");
	}
	else if (reason === 'not-connected') {
		return _("Sign out of Facebook and try again.");
	}

	return _("Unknown Facebook error. Please contact support.");
}

/* standardRegistration
 *
 * Attempt to register and sign in using standard
 * username/password authentication.
 *
 * Required:
 *   username
 *   password
 *   email
 *   coordinator
 *
 * Returns: void
 */
Login.standardRegistration = function (args) {
	args = args || {};

	if (!args.username || !args.password || !args.email) {
		return $.Deferred().reject();
	}

	var postdata = {
		username: args.username,
		password: args.password,
		email: args.email
	};

	var coordinator = args.coordinator;

	var deferred = $.Deferred();

	$.post("/1.0/internal/account/register/standard/", postdata, function (response) {
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
			//focusOnFirstError(coordinator, 'register');
		}
	})
	.fail(function () {
		deferred.reject();
	});

	return deferred;
};

Login.facebookRegistration = function (args) {
	args = args || {};

	var coordinator = args.coordinator;

	Login.validateUsername(coordinator);

	if (!coordinator.execute()) {
		focusOnFirstError(coordinator, 'register');
		return;
	}

	if (!args.username || !args.access_token) {
		return;
	}

	var postdata = {
		username: args.username,
		access_token: args.access_token
	};

	$.post("/1.0/internal/account/register/facebook/", postdata, function (response) {
		response = $.parseJSON(response);
		
		if (response.success) {
			continueOn();
		}
		else {
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
}

function registrationFacebookAccountFixtext (reason) {
	if (reason === 'taken') {
		return _("Your Facebook account is already registered.");
	}

	return _("Please contact support.");
}

function registrationAccessTokenFixtext (reason) {
	if (reason === 'missing') {
		return _("Try signing in to Facebook again.");
	}
	else if (reason === 'invalid') {
		return _("Sign out of Facebook and try again.");
	}

	return _("Unknown Facebook authorization error. Please contact support.");
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
					fixtextfn: Login.loginUsernameFixtext,
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

/* loginForgotPasswordFixtext
 *
 * Provides fixtext for various reasons that the server may
 * accept or reject a reset password request.
 *
 * Required:
 *   [0] reason
 *
 * Returns: fixtext string
 */
Login.loginForgotPasswordFixtext = function (reason) {
	if (reason === 'success') {
		return _("An email has been sent.");
	}

	if (reason === 'no-identifier') {
		return _("Please enter your username or email.");
	}
	else if (reason === 'user-not-found') {
		return _("This username or email was not registered.");
	}
	else if (reason === 'failed' || reason === 'email-failed') {
		return _("Unable to process. Please contact support.");
	}
	else if (reason === 'limit-exceeded') {
		return _("Too many attempts. Please try back later.");
	}

	return _("Unknown error. Please contact support.");
}

/* loginValidateUsername
 *
 * Validates the username field checking for emails
 * and accounts names.
 *
 * Required:
 *   [0] usernamefield
 *   [1] coordinator
 *
 * Returns: void
 */
function loginValidateUsername(usernamefield, coordinator) {
	var username = $(usernamefield).val();
	username = $.trim(username);

	if (!username.length) {
		coordinator.set('username', false, 'minimum-length');
	}
	else if (username.match(/[,\[\]\s]/i)) {
		coordinator.set('username', false, 'available-username');
	}
	else {
		var type = 'username';
		if (username.match(/@/)) {
			type = 'email';
		}

		var url = '/1.0/internal/account/available/' + type + '/' + encodeURIComponent(username);
		$.getJSON(url, function (data) {
			if (data.available) {
				coordinator.set('username', false, 'available-' + type);
			}
			else {
				coordinator.set('username', true);
			}
		});
	}
}

function loginValidateUsernameNoLength(usernamefield, coordinator) {
	var username = $(usernamefield).val();
	username = $.trim(username);

	if (!username) {
		coordinator.set('username', true);
	}
	else {
		loginValidateUsername(usernamefield, coordinator);
	}
}

/* loginUsernameFixtext
 *
 * Provides fixtext for various reasons that the server may
 * reject a username.
 *
 * Required:
 *   [0] reason
 *
 * Returns: fixtext string
 */
Login.loginUsernameFixtext = function (reason) {
	if (reason === 'minimum-length') {
		return _("Please enter your username or email.");
	}
	else if (reason === 'available-username') {
		return _("This name is not registered. Did you misspell it?");
	}
	else if (reason === 'available-email') {
		return _("This email is not registered. Did you misspell it?");
	}

	return _("Please contact support and describe what you were doing.");
}

/* loginPasswordFixtext
 *
 * Provides fixtext for various reasons that the server may
 * reject a password.
 *
 * Required:
 *   [0] reason
 *
 * Returns: fixtext string
 */
Login.loginPasswordFixtext = function (reason) {
	if (reason === 'minimum-length') {
		return _("Please enter your password.");
	}
	else if (reason === 'invalid') {
		return _("Please double-check your password.");
	}

	return _("Please contact support and describe what you were doing.");
};

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

/* quickValidateUsernameNoLength
 *
 * In the interests of streamlining, we can evaluate
 * the username, along dimensions that do not require a
 * database check, in real time.
 *
 * Required:
 *    [0] playcoordinator: A Coordinator.js object
 *
 * Returns: boolean
 */
Login.quickValidateUsernameNoLength = function (username, coordinator) {
	if (username.length > 20) {
		coordinator.set('username', false, 'maximum-length');
		return false;
	}
	else if (!username.match(/^[a-z0-9_\.]*$/i)) {
		coordinator.set('username', false, 'format');
		return false;
	}
	else if (GLOBAL.takenusernames[username]) {
		coordinator.set('username', false, GLOBAL.takenusernames[username]);
		return false;
	}
	else {
		coordinator.set('username', true);
		return true;
	}
}

/* validateUsername
 *
 * Performs full validation (including DB checks)
 * of the username.
 *
 * Required:
 *    [0] coordinator: A Coordinator.js object
 *
 * Returns: deferred object
 */
Login.validateUsername = function (username, coordinator) {
	if (!Login.quickValidateUsernameNoLength(username, coordinator)) {
		return $.Deferred().reject();
	}
	else if (username.length === 0) {
		coordinator.set('username', false, 'zero-length');
	}

	var url = '/1.0/internal/account/available/username/' + encodeURIComponent(username);
	return $.getJSON(url, function (data) {
		if (data.available) {
			coordinator.set('username', true);
			GLOBAL.takenusernames[username] = null;
		}
		else {
			GLOBAL.takenusernames[username] = data.reason || 'taken';
			coordinator.set('username', false, data.reason);
		}
	});
}

Login.validateUsernameNoLength = function (username, coordinator) {
	if (username.length === 0) {
		coordinator.set('username', true);
		return $.Deferred().resolve();
	}
	else {
		return Login.validateUsername(username, coordinator);
	}
}


/* registrationUsernameFixtext
 *
 * Provides fixtext for various reasons that the server may
 * reject a username.
 *
 * Required:
 *   [0] reason
 *
 * Returns: fixtext string
 */
Login.registrationUsernameFixtext = function (reason) {
	if (reason === 'taken') {
		return _("This name is taken.");
	}
	else if (reason === 'hyperlink') {
		return _("Your name shouldn't look like a link.");
	}
	else if (reason === 'reserved') {
		return _("Your name may not contain official titles.");
	}
	else if (reason === 'PENIS') {
		return _("Hint: We're not laughing with you.");
	}
	else if (reason === 'zero-length') {
		return _("Please choose a name.");
	}
	else if (reason === 'minimum-length') {
		return _("Please choose a longer name.");
	}
	else if (reason === 'maximum-length') {
		return _("Please choose a name up to twenty characters long.");
	}
	else if (reason === 'format') {
		return _("Please use only letters, numbers, and underscores.");
	}

	return _("Please contact support if you really want this name.");
};

/* registrationPasswordFixtext
 *
 * Translates validation problems into fixtext.
 *
 * Required:
 *   [0] reason: A string representing a canonicalization of the issue
 *
 * Returns: English text 
 */
Login.registrationPasswordFixtext = function (reason) {
	if (reason === 'zero-length') {
		return _("Please enter a password.");
	}
	else if (reason === 'minimum-length') {
		return _("Please enter at least six characters.");
	}
	else if (reason === 'username') {
		return _("Including your username is not a good idea.");
	}
	else if (reason === 'character-classes') {
		return _("Please use a mixture of lower case, upper case, digits, and symbols.");
	}
	else if (reason === 'streak' || reason == 'ratio') {
		return _("Please use more variation in your password.");
	}
	else if (reason === 'simplicity') {
		return _("Please make your password stronger.");
	}

	return _("Please contact support if you really want this password.");
}

/* quickValidateEmail
 *
 * Evaluates the email along dimensions that do not
 * require the server.
 *
 * Required:
 *    [0] emailfield
 *    [1] coordinator
 *
 * Returns: deferred
 */
Login.validateEmailNoLength = function (email, coordinator) {
	email = email.trim();

	if (email.length === 0) {
		coordinator.lazySet('email', true);
		return $.Deferred().resolve();
	}

	return Login.validateEmail(email, coordinator);
}

Login.validateEmail = function (email, coordinator) {
	email = email.trim();

	if (email.length === 0) {
		coordinator.lazySet('email', false, 'zero-length');
		return $.Deferred().reject('zero-length');
	}
	else if (!email.match(/^.+@.+\.[a-z]{2,4}$/i)) {
		coordinator.lazySet('email', false, 'format');
		return $.Deferred().reject('format');
	}
	else if (GLOBAL.takenemails[email]) {
		coordinator.lazySet('email', false, GLOBAL.takenemails[email]);
		return $.Deferred().reject(GLOBAL.takenemails[email]);
	}

	var deferred = $.Deferred();

	var url = '/1.0/internal/account/available/email/' + encodeURIComponent(email);
	$.getJSON(url, function (data) {
		if (data.available) {
			coordinator.set('email', true);
			deferred.resolve();
		}
		else {
			GLOBAL.takenemails[email] = data.reason;
			coordinator.set('email', false, data.reason);
			deferred.reject(data.reason);
		}
	});

	return deferred;
}

/* registrationEmailFixtext
 *
 * Translates validation problems into fixtext.
 *
 * Required:
 *   [0] reason: A string representing a canonicalization of the issue
 *
 * Returns: English text 
 */
Login.registrationEmailFixtext = function (reason) {
	if (reason === 'zero-length') {
		return _("Please enter an email.");
	}
	else if (reason === 'taken') {
		return _("Please choose another email; this one is taken.");
	}
	else if (reason === 'format') {
		return _("Email may not be correctly formatted.");
	}

	return _("Please contact support if you really want to use this email.");
};

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

/* focusOnFirstError
 *
 * Moves the focus to the first error in the registration
 * workflow.
 *
 * Required:
 *   [0] coordinator: a Coordinator.js object
 *
 * Returns: void
 */
function focusOnFirstError (coordinator, mode) {
	var order; 
	var translation;

	if (mode == 'login') {
		order = ['username', 'password'];
		translation = {
			username: $("#username"),
			password: $("#loginpassword")
		};
	}
	else {
		order = ['username', 'password', 'email'];
		translation = {
			username: $("#username"),
			password: $("#registrationpassword"),
			email: $("#email")
		};
	}

	for (var i = 0; i < order.length; i++) {
		var key = order[i];
		if (!coordinator.conds[key]) {
			translation[key].one('focus', function (evt) {
				evt.stopImmediatePropagation();
			}).focus();
			translation[key].thinking('cancel');
			return;
		}
	}
}

module.exports = Login;
