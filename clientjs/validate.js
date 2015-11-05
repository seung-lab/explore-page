let GLOBAL = require('./GLOBAL.js'),
	_ = require('./localeplanet-translate.js');


let Validate = {};
module.exports = Validate;

Validate.Registration = {};
Validate.Login = {};

/* username
 *
 * Performs full Validate (including DB checks)
 * of the username.
 *
 * Required:
 *    [0] coordinator: A Coordinator.js object
 *
 * Returns: deferred object
 */
Validate.Registration.username = function (username, coordinator) {
	let deferred = $.Deferred();

	if (!Validate.Registration.usernameNoLengthInstant(username, coordinator)) {
		return $.Deferred().reject();
	}
	else if (username.length === 0) {
		coordinator.set('username', false, 'zero-length');
		return $.Deferred().reject();
	}

	var url = '/1.0/internal/account/available/username/' + encodeURIComponent(username);
	$.getJSON(url, function (data) {
		if (data.available) {
			coordinator.set('username', true);
			GLOBAL.takenusernames[username] = null;

			deferred.resolve();
		}
		else {
			GLOBAL.takenusernames[username] = data.reason || 'taken';
			coordinator.set('username', false, data.reason);

			deferred.reject();
		}
	})
	.fail(function () {
		coordinator.set('username', true, 'network-failure');
		deferred.reject();
	})

	return deferred.promise();
}

Validate.Registration.usernameNoLength = function (username, coordinator) {
	if (username.length === 0) {
		coordinator.set('username', true);
		return $.Deferred().resolve().promise();
	}
	else {
		return Validate.Registration.username(username, coordinator);
	}
}

/* usernameNoLengthInstant
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
Validate.Registration.usernameNoLengthInstant = function (username, coordinator) {
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


/* usernameFixtextRegistration
 *
 * Provides fixtext for various reasons that the server may
 * reject a username.
 *
 * Required:
 *   [0] reason
 *
 * Returns: fixtext string
 */
Validate.Registration.usernameFixtext = function (reason) {
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
	else if (reason === 'network-failure') {
		return _("There was a network failure when validating this name.");
	}

	return _("Please contact support if you really want this name.");
};

/* passwordFixtextRegistration
 *
 * Translates Validate problems into fixtext.
 *
 * Required:
 *   [0] reason: A string representing a canonicalization of the issue
 *
 * Returns: English text 
 */
Validate.Registration.passwordFixtext = function (reason) {
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

/* emailNoLength
 *
 * Required:
 *    [0] email
 *    [1] coordinator
 *
 * Returns: deferred
 */
Validate.Registration.emailNoLength = function (email, coordinator) {
	email = email.trim();

	if (email.length === 0) {
		coordinator.lazySet('email', true);
		return $.Deferred().resolve().promise();
	}

	return Validate.Registration.email(email, coordinator);
}

Validate.Registration.email = function (email, coordinator) {
	email = email.trim();

	let deferred = $.Deferred();

	if (email.length === 0) {
		coordinator.lazySet('email', false, 'zero-length');
		return deferred.reject('zero-length').promise();
	}
	else if (!email.match(/^.+@.+\.[a-z]{2,4}$/i)) {
		coordinator.lazySet('email', false, 'format');
		return deferred.reject('format').promise();
	}
	else if (GLOBAL.takenemails[email]) {
		coordinator.lazySet('email', false, GLOBAL.takenemails[email]);
		return deferred.reject(GLOBAL.takenemails[email]).promise();
	}

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
	})
	.fail(function () {
		deferred.reject();
		coordinator.set('email', true, 'network-failure');
	});

	return deferred.promise();
}

/* registrationEmailFixtext
 *
 * Translates Validate problems into fixtext.
 *
 * Required:
 *   [0] reason: A string representing a canonicalization of the issue
 *
 * Returns: English text 
 */
Validate.Registration.emailFixtext = function (reason) {
	if (reason === 'zero-length') {
		return _("Please enter an email.");
	}
	else if (reason === 'taken') {
		return _("Please choose another email; this one is taken.");
	}
	else if (reason === 'format') {
		return _("Email may not be correctly formatted.");
	}
	else if (reason === 'network-failure') {
		return _("There was a network failure while validating this email.");
	}

	return _("Please contact support if you really want to use this email.");
};


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
Validate.Login.forgotPasswordFixtext = function (reason) {
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
	else if (reason === 'network-failure') {
		return _("There was a network failure while validating this password.");
	}

	return _("Unknown error. Please contact support.");
}

/* loginValidateUsername
 *
 * Validates the username field checking for emails
 * and accounts names.
 *
 * Required:
 *   [0] username
 *   [1] coordinator
 *
 * Returns: deferred
 */
Validate.Login.username = function (username = "", coordinator) {
	username = username.trim();

	let deferred = $.Deferred();

	if (!username.length) {
		coordinator.set('username', false, 'minimum-length');
		return deferred.reject().promise();
	}
	else if (username.match(/[,\[\]\s]/i)) {
		coordinator.set('username', false, 'available-username');
		return deferred.reject().promise();
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
				deferred.reject();
			}
			else {
				coordinator.set('username', true);
				deferred.resolve();
			}
		})
		.fail(function () {
			deferred.reject();
			coordinator.set('username', true, 'network-failure');
		})
	}

	return deferred.promise();
}

Validate.Login.usernameNoLength = function (username, coordinator) {
	username = username.trim();

	if (!username) {
		coordinator.set('username', true);
		return $.Deferred().resolve();
	}
	else {
		return Validate.Login.username(username, coordinator);
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
Validate.Login.usernameFixtext = function (reason) {
	if (reason === 'minimum-length') {
		return _("Please enter your username or email.");
	}
	else if (reason === 'available-username') {
		return _("This name is not registered. Did you misspell it?");
	}
	else if (reason === 'available-email') {
		return _("This email is not registered. Did you misspell it?");
	}
	else if (reason === 'network-failure') {
		return _("There was a network-failure while validating your login credentials.");
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
Validate.Login.passwordFixtext = function (reason) {
	if (reason === 'minimum-length') {
		return _("Please enter your password.");
	}
	else if (reason === 'invalid') {
		return _("Please double-check your password.");
	}
	else if (reason === 'network-failure') {
		return _("There was a network-failure while validating your login credentials.");
	}

	return _("Please contact support and describe what you were doing.");
};


Validate.Login.facebookAccountFixtext = function (reason) {
	if (reason === 'not-registered') {
		return _("Please sign up to use this Facebook account.");
	}
	else if (reason === 'not-connected') {
		return _("Sign out of Facebook and try again.");
	}
	else if (reason === 'network-failure') {
		return _("There was a network failure while communicating with facebook.");
	}

	return _("Unknown Facebook error. Please contact support.");
}

Validate.Registration.facebookAccountFixtext = function (reason) {
	if (reason === 'taken') {
		return _("Your Facebook account is already registered.");
	}
	else if (reason === 'network-failure') {
		return _("There was a network failure while communicating with facebook.");
	}

	return _("Please contact support.");
}

Validate.Registration.accessTokenFixtext = function (reason) {
	if (reason === 'missing') {
		return _("Try signing in to Facebook again.");
	}
	else if (reason === 'invalid') {
		return _("Sign out of Facebook and try again.");
	}
	else if (reason === 'network-failure') {
		return _("There was a network failure while communicating with facebook.");
	}

	return _("Unknown Facebook authorization error. Please contact support.");
}





