"use strict";

var $ = require('jquery');

var Password = {};

/* quickValidatePassword
 *
 * Evaluates the password along dimensions that do not
 * require the server.
 *
 * Required:
 *    [0] password
 *    [1] playcoordinator
 *
 * Returns: boolean
 */
Password.quickValidatePassword = function (password, username, coordinator) {
	if (!password) {
		coordinator.lazySet('password', false, 'zero-length');
		return false;
	}
	else if (password.length < 6) {
		coordinator.lazySet('password', false, 'minimum-length');
		return false;
	}

	return Password.quickValidatePasswordNoLength(password, username, coordinator);
};

Password.quickValidatePasswordNoLength = function (password, username, coordinator) {
	if (!password || password.length <= 4) {
		coordinator.lazySet('password', true);
		return true;
	}

	if (username.length >= 4) {
		var parts = username.split(/[_\.]/);
		for (var i = 0; i < parts.length; i++) {
			if (parts[i].length < 4) { 
				continue; 
			}

			var partsre = new RegExp(parts[i], "i");
			if (partsre.test(password)) {
				coordinator.lazySet('password', false, 'username');
				return false;
			}
		}

		var wholere = new RegExp(username, "i");
		if (wholere.test(password)) {
			coordinator.lazySet('password', false, 'username');
			return false;
		}
	}

	var streak = passwordStreakCheck(password);

	if (streak * 2 >= password.length) {
		coordinator.lazySet('password', false, 'streak');
		return false;
	}

	var ratio = passwordRatioCheck(password);

	if (ratio >= 0.59) {
		coordinator.lazySet('password', false, 'ratio');
		return false;
	}

	coordinator.lazySet('password', true);
	return true;
};

/* qualifyPassword
 *
 * Returns a qualitative assessment of a given password
 * by scoring the password and measuring it to the equivilent
 * strength of another type of password.
 *
 * Required:
 *    [0] password
 *    [1] username
 *    [2] coordinator
 *
 * Returns one of: "terrible", "poor", "acceptable", "good", "strong"
 */
Password.qualifyPassword = function (password, username, coordinator) {
	var valid = Password.quickValidatePasswordNoLength(password, username, coordinator);
	
	if (!valid) {
		return 0;
	}
	
	var score = scorePassword(password);

	var poor = 6 * Math.log(10); // 6 characters, lowest classes
	var acceptable = 8 * Math.log(10 + 26); // 8 characters, two classes
	var good = 8 * Math.log(10 + 26 + 26 + 30); // 8 characters, three classes
	var strong = 10 * Math.log(10 + 26 + 26 + 30); // 10 characters, 4 classes

	return score / strong;
};

/* scorePassword
 * 
 * The password is scored by the following 
 * algorithm:
 *
 * N = number of possibilities per character
 *  l = # of lowercase (26)
 *  u = # of uppercase (26)
 *  d = # of digits (10)
 *  s = # of symbols
 *
 * The algorithm checks for the number of classes
 * inherent in the password, and then assumes
 * that an attacker would then have to search
 * those classes at each position in the password.
 *
 * This may not be an awesome assumption, but it allows
 * for the following calculation:
 *
 * N = l + u + d (for example, as the password contained those three classes)
 *
 * The number of permutations possible is N^(password length)
 *
 * Since this is a very large number, it's best to express it as a logarithm:
 *
 * Score = (password length) * ln(N)
 *
 * The minimum acceptable score = 8 * ln(10 + 26 + 26) = 33.017
 *
 * Required:
 *   [0] password
 *
 * Returns: score
 */
function scorePassword (password) {
	password = password || "";

	if (!password.length) {
		return 0;
	}

	var classes = [
		[ /[a-z]/, 26 ],
		[ /[A-Z]/, 26 ],
		[ /\d/, 10], 
		[ /[^\da-zA-Z]/, 33], // non-alphanumeric (33) on en-US keyboards
	];

	var n = 0;
	for (var i = 0; i < classes.length; i++) {
		var re = classes[i][0];
		var val = classes[i][1];

		if (password.match(re)) {
			n += val;
		}
	}

	return password.length * Math.log(n);
}

/* mapSequenceToNumberInARow
 *
 * Converts an array like: ['a', 'a', 'a', 'b', 'a', 'c']
 * to [1, 2, 3, 1, 1, 1]. i.e.  it counts how many characters
 * are in a row.
 *
 * Required:
 *   [0] sequence
 *
 * Returns: sequence mapped to integer values
 */
function mapSequenceToNumberInARow (sequence) {
	var currentchar = sequence[0];
	var ct = 1;
	for (var i = 0; i < sequence.length; i++) {
		if (sequence[i] === currentchar) {
			sequence[i] = ct;
			ct++;
		}
		else {
			currentchar = sequence[i];
			ct = 1;
			sequence[i] = ct;
		}
	}

	return sequence;
}

/* passwordRatioCheck
 *
 * Required:
 *    [0] password
 *
 * Returns: ratio of most frequent character to the password length
 */
function passwordRatioCheck (password) {
	password = password || "";

	var chars = password.split(''); 
	chars.sort();

	chars = mapSequenceToNumberInARow(chars);
	return Math.max.apply(undefined, chars) / password.length;
}

/* passwordStreakCheck
 *
 * Required:
 *   [0] password
 *
 * Returns: Highest number of consecutive characters
 */
function passwordStreakCheck (password) {
	password = password || "";

	var chars = password.split(''); 
	chars = mapSequenceToNumberInARow(chars);
	return Math.max.apply(undefined, chars);
}

module.exports = Password;
