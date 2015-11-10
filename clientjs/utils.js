"use strict";

/*
 *	Utils.js
 *
 *	This is a grab bag of utility functions that would be useful
 *	througout the program that mostly manipulate data.
 *
 * Dependencies: 
 *   jQuery (tested with 1.7.1)
 *
 * Author: William Silversmith
 * Affiliation: Seung Lab, MIT 
 * Date: June-August 2013
 */

let $ = require('jquery');

var Utils = {};	

/* getDomainName
 *
 * Gets the top level domain for this website to avoid
 * doing things like hard coding cookies.
 *
 * e.g. play.eyewire.org => eyewire.org
 *
 * Required: None
 *
 * Return: highest level domain string
 */
Utils.getDomainName = function () {
	var host = document.location.hostname;
	host = host.replace(/https?(:\/\/)?/, '');

	var matches = /\.(\w+\.(:?com|org|net|gov|edu|mil|us|ca|eu|co\\.uk))$/.exec(host);

	return matches[1];
};

/* toCollection
 *
 * Converts arrays to jQuery collections.
 *
 * Required:
 *   [0] array
 *
 * Return: jQuery collection
 */
Utils.toCollection = function (array) {
	return array.reduce(function (jqo, x) {
		return jqo.add(x);
	}, $())
};

/* fScore
 *
 * Computes 
 *
 * Required:
 *  tp: True Positives
 *  fp: False Positives
 *  fn: False negatives
 *
 * Returns: { fscore, precision, recall }
 */
Utils.fScore = function (args) {
	args = args || {};

	var tp = args.tp;
	var fp = args.fp;
	var fn = args.fn;

	if (!tp) {
		return {
			fscore: null,
			precision: null,
			recall: null
		};
	}

	var precision = tp / (tp + fp);
	var recall = tp / (tp + fn);

	var fscore = 2 * precision * recall / (precision + recall);

	return {
		fscore: fscore,
		precision: precision,
		recall: recall
	};
};

/* significandAndMagnitude
 * 
 * Converts a number into a significand and magnitude.
 *
 * e.g. 2412479.24 => { significand: 2.4, magnitude: 6 }
 *
 * Required:
 *   number: The number to convert
 * 
 * Optional:
 *   precision: The number of places past the decimal to leave
 *
 * Returns: { number, magnitude }
 */
Utils.significandAndMagnitude = function (args) {
	var precision = args.precision || null;
	var number = args.number;
	var negative = false;

	if (number === 0) {
		return {
			significand: 0,
			magnitude: 1,
		};
	}
	else if (number < 0) {
		negative = true;
		number = Math.abs(number);
	}

	Math.log10 = Math.log10 || function (x) {	
			return Utils.round(Math.log(x) / Math.LN10, 10);
	};

	var magnitude = Math.floor(Math.log10(number));
	var significand = number / Math.pow(10, magnitude);

	if (precision !== null) {
		significand = significand.toFixed(precision);
	}

	if (negative) {
		significand = -significand;
	}

	return {
		significand: significand,
		magnitude: magnitude
	};
};

/* round
 * 
 * Same as Math.round, but you can pick which decimal
 * place to round to. Defaults to the same as Math.round.
 *
 * Required:
 *   [0] x: Floating point
 *   [1] precison: How many decimal places? Can be positive or negative int.
 *
 * Return: rounded float
 */
Utils.round = function (x, precision) {
	precision = precision || 0;
	return Math.round(x * Math.pow(10, precision)) / Math.pow(10, precision);
};

/* numberToCondensedSI
 * 
 * Converts a number into the most condensed SI notation possible.
 *
 * e.g. 2412479.24 => 2.4M
 *
 * Required:
 *   number: The number to convert
 * 
 * Optional:
 *   conversionminimum: (int) Don't perform the conversion below and at this threshold
 *   maxchars: (int) Don't perform the conversion below and at this number of characters
 * 
 *   Mutually Exclusive:
 *     fit: (int) Set the precision to fit this number of characters.
 *         This value must be > 2 to be meaningful (X.X is 3 characters).
 *         If the amount of space is too small to accomodate a decimal point,
 *         fit will simply remove the decimal to provide more space for the integer
 *         component.
 *     precision: (int) The number of places past the decimal to leave (defaults to 1)
 *
 * Returns: HTML encoded string representing significand and a letter indicating the magnitude
 */
Utils.numberToCondensedSI = function (args) {
	var precision = args.precision;
	var fit = args.fit;
	var number = args.number || 0;

	if (precision === undefined) {
		precision = 1;
	}

	var precisenum;
	if (number === 0) {
		precisenum = "0";
		for (var i = 0; i < precision; i++) {
			precisenum += "0";
		};
	}
	else {
		precisenum = Math.round(number * Math.pow(10, precision)).toString();
	}

	if (precision > 0) {
		precisenum = precisenum.substr(0, precisenum.length - precision) + 
			"." + precisenum.substr(precisenum.length - 1, precision);
	}

	if (args.maxchars && precisenum.length <= args.maxchars) {
		return precisenum;
	}
	else if (args.conversionminimum && Math.abs(number) <= args.conversionminimum) {
		return number.toString();
	}
	else if (fit && number === 0) {
		return precisenum.substr(0, fit);
	}

	var components = Utils.significandAndMagnitude({
		number: number,
	});

	var magnitude = components.magnitude;

	var suffixes = {
		"-10": "p", "-11": "p", "-12": "p",
		"-7": "n", "-8": "n", "-9": "n",
		"-4": "&mu;", "-5": "&mu;", "-6": "&mu;",
		"-1": "m", "-2": "m", "-3": "m",
		0: "", 1: "", 2: "",
		3: "k", 4: "k", 5: "k",
		6: "M", 7: "M", 8: "M",
		9: "G", 10: "G", 11: "G",
		12: "P", 13: "P", 14: "P",
		15: "E", 16: "E", 17: "E"
	};

	var significand;

	// Get significand to be as large as possible within three orders of magnitude
	// i.e. 121,024,141 (1.21024141, magnitude 6) should look like 121.024141
	// and 1,131,141 should look like 1.131141
	if (magnitude >= 0) {
		significand = components.significand * Math.pow(10, (Math.abs(magnitude) % 3));
	}
	else {
		significand = components.significand * Math.pow(10, 3 - (Math.abs(magnitude) % 3));	
	}

	if (fit) {
		var wholepart = Utils.truncate(significand) + "";

		var adjustments = 1; // room for decimal point

		if (suffixes[magnitude] !== "") {
			adjustments += 1; // room for SI letter
		}

		if (wholepart.length >= fit - adjustments) {
			precision = 0;
		}
		else {
			precision = fit - wholepart.length - adjustments;
		}
	}

	// Fix floating point issues
	var value = significand * Math.pow(10, precision);

	value = Utils.truncate(value) + ""; // convert to string so we can be precise

	if (precision > 0) {
		// insert the decimal point in the right place
		value = value.slice(0, value.length - precision) + "." + value.slice(-precision);
	}

	return value + suffixes[magnitude];
};

/* ellipsisText
 *
 * Take a long string and return it trimed to a particular length
 * with trailing ellipses.
 *
 * Required:
 *   [0] str
 *   [1] maxlen: int >= 3
 *
 * Return: Possibly truncated string
 */
Utils.ellipsisText = function (str, maxlen) {
	if (maxlen < 3) {
		throw "Unable to trim string to less than size 3. String: " + Utils.ellipsisText(str, 100);
	}

	if (str.length <= maxlen) {
		return str;
	}

	return str.substr(0, maxlen - 3) + "...";
};

/* nvl
 *
 * "Null value." Usually you should use
 * x = x || y, however sometimes a valid
 * value of x is 0 or false (especially in array indicies). 
 *
 * This function makes things into a neat one liner.
 * nvl(x, y)
 *
 * Required:
 *   [0] val
 *   [1] ifnull 
 *
 * Return: val || ifnull (but accounting for false and 0)
 */
Utils.nvl = function (val, ifnull) {
	return !(val === undefined || val === null)
		? val
		: ifnull;
};

/* plural
 *
 * Given a count and a string encoded as described below,
 * parse it so that it is either singular or plural.
 *
 * Strings may be written as such:
 *
 * var x = 1;
 * Utils.plural(x, "I have " + x + " cars[[s]]")
 * => "I have 1 car"
 *
 * x = ['porshe']
 * Utils.plural(x, "I have [[a|some]] car[[s]]. [[It|The first]] is a " + x[0]) 
 * => "I have a car. It is a porshe".
 * 
 * x = 2;
 * Utils.plural(x, "Do you have [[a child|children]]?")
 * => "Do you have children?"
 *
 * Required:
 *   [0] ct: A number or an array whose quantity 
 *          or length indicates the singularness or plurality
 *   [1] phrase: A suitably encoded phrase
 *
 * Returns: A pluralized string
 */
Utils.plural = function (ct, phrase) {
	var isplural = false;

	if (typeof(ct) === 'number') {
		isplural = (ct !== 1);
	}
	else {
		isplural = (ct.length !== 1);
	}

	var multicapture = /\[\[([^\]])+?\]\]/g;
	var singlecapture = /\[\[([^\]])+?\]\]/;

	var phrasecopy = phrase;

	var match;
	while (match = multicapture.exec(phrase)) {
		var maybepair = match[1].split(/\|/);

		var singular;
		var pluralversion;
		if (maybepair.length === 2) {
			singular = maybepair[0];
			pluralversion = maybepair[1];
		}
		else {
			singular = "";
			pluralversion = maybepair[0];
		}

		var replacement = isplural 
			? pluralversion
			: singular;

		phrasecopy = phrasecopy.replace(singlecapture, replacement);
	}

	return phrasecopy;
};

/* numberToText
 *
 * Follows AP style and spells out 0-9 
 * and certain special high numbers
 *
 * e.g. 1 => one
 *     -1 => negative one
 *
 * Required:
 *   [0] number
 *
 * Return: text or number
 */
Utils.numberToText = function (number) {
	var mappings = {
		0: _("zero"),
		1: _("one"),
		2: _("two"),
		3: _("three"),
		4: _("four"),
		5: _("five"),
		6: _("six"),
		7: _("seven"),
		8: _("eight"),
		9: _("nine"),
		100: _("a hundred"),
		1000: _("a thousand"),
		1000000: _("a million"),
	};

	var positive = Math.abs(number);

	var text = "";
	if (mappings[positive]) {				
		if (number < 0) {
			text = _("negative ");
		}

		text += mappings[positive];
	} 
	else {
		text = number;
	}

	return text;
};

/* findCallback
 *
 * Often functions are designed so that the final positional
 * argument is the callback. The problem occurs when you can have
 * multiple optional positional arguments.
 *
 * Pass "arguments" to this function and it'll find the callback
 * for you.
 *
 * Required:
 *   [0] args: literally the "arguments" special variable
 *
 * Return: fn or null
 */
 Utils.findCallback = function (args) {
 	var callback = null;

 	for (var i = args.length - 1; i >= 0; i--) {
 		if (typeof(args[i] === 'function')) {
 			callback = args[i];
 			break;
 		}
 	}

 	return callback;
 };

/* compose
 *
 * Compose N functions into a single function call.
 *
 * Required: 
 *   [0-n] functions or arrays of functions
 * 
 * Returns: function
 */
Utils.compose = function () {
	var fns = Utils.flatten(arguments);

	return function () {
		for (var i = 0; i < fns.length; i++) {
			fns[i].apply(this, arguments);
		}
	};
};

/* listeq
 *
 * Tests if the contents of two scalar
 * arrays are equal. 
 *
 * Required:
 *   [0] a: array
 *	 [1] b: array
 *
 * Return: boolean
 */
Utils.listeq = function (a, b) {
	if (!Array.isArray(a) || !Array.isArray(b)) {
		return false;
	}
	else if (a.length !== b.length) {
		return false;
	}

	for (var i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
};

/* hasheq
 *
 * Tests if two objects are equal at a 
 * shallow level. Intended to be used with
 * scalar values.
 *
 * Required:
 *   [0] a
 *   [1] b
 *
 * Return: bool 
 */
Utils.hasheq = function (a, b) {
	var akeys = Object.keys(a);

	if (!Utils.listeq(akeys, Object.keys(b))) {
		return false;
	}

	for (var i = 0; i < akeys.length; i++) {
		var key = akeys[i];

		if (a[key] !== b[key]) {
			return false;
		}
	}

	return true;
};

/* flatten
 *
 * Take an array that potentially contains other arrays 
 * and return them as a single array.
 *
 * e.g. flatten([1, 2, [3, [4]], 5]) => [1,2,3,4,5]
 *
 * Required: 
 *   [0] array
 * 
 * Returns: array
 */
Utils.flatten = function (array) {
	array = array || [];

	var flat = [];

	var len = array.length;
	for (var i = 0; i < len; i++) {
		var item = array[i];

		if (typeof(item) === 'object' && Array.isArray(item)) {
			flat = flat.concat(Utils.flatten(item));
		}
		else {
			flat.push(item);
		}
	} 

	return flat;
};

/* arrayToHashKeys
 *
 * Converts [1,2,3,'a','b','c'] into
 * { 1: true, 2: true, 3: true, 'a': true, 'b': true, 'c': true }
 * so that you can e.g. efficiently test for existence.
 *
 * Required: 
 *   [0] array: Contains only scalar values
 * 
 * Returns: { index1: true, ... }
 */
Utils.arrayToHashKeys = function (array) {
	var hash = {};
	for (var i = array.length - 1; i >= 0; i--) {
		hash[array[i]] = true;
	}

	return hash;
};

/* forEachItem
 *
 * Iterate through each key/value in the hash
 *
 * Required:
 *   [0] hash
 *   [1] fn(key, value)
 *
 * Return: void (iteration construct)
 */
Utils.forEachItem = function (hash, fn) {
	hash = hash || {};

	var keys = Object.keys(hash);
	keys.sort();

	keys.forEach(function (key) {
		fn(key, hash[key]);
	});
};

/* unique
 *
 * Take an array of elements and return only 
 * unique values. This function respects
 * the stability of the array based on
 * first occurrence.
 *
 * Required:
 *   [0] list: e.g. [ 1, 1, 4, 5, 2, 4 ]
 *
 * Return: [ e.g. 1, 4, 5, 2 ]
 */
Utils.unique = function (list) {
	var obj = {};
	var order = [];
	list.forEach(function (item) {
		if (!obj[item]) {
			order.push(item);
		}

		obj[item] = true;
	});

	return order;
};

/* slice
 *
 * Gives a subset of the given hash.
 *
 * Required:
 *   [0] hash
 *   [1..n] keys to slice
 *
 * Return: hash slice
 */
Utils.slice = function (hash) {
	var sliced = {};
	
	for (var i = 1; i < arguments.length; i++) {
		var key = arguments[i];
		sliced[key] = hash[key];
	}

	return sliced;
};

/* clamp
 *
 * Bound a value between a minimum and maximum value.
 *
 * Required: 
 *   [0] value: The number to evaluate
 *   [1] min: The minimum possible value
 *   [2] max: The maximum possible value
 * 
 * Returns: value if value in [min,max], min if less, max if more
 */
Utils.clamp = function (value, min, max) {
	return Math.max(Math.min(value, max), min);
};

/* indexOfAttr
 *
 * For use with arrays of objects. It's
 * Array.indexOf but against an attribute
 * of the array.
 *
 * Required: 
 *   [0] value: searching for this
 *   [1] array
 *   [2] attr: e.g. description in [ { description }, { description } ]
 * 
 * Returns: index or -1 if not found
 */
Utils.indexOfAttr = function (value, array, attr) {
	for (var i in array) {
		if (array[i][attr] === value) {
			return i;
		}
	}

	return -1;
};

/* invertHash
 *
 * Turns a key => value into value => key.
 *
 * Required:
 *   [0] hash
 *
 * Return: inverted hash { value: key }
 */
Utils.invertHash = function (hash) {
	hash = hash || {};

	var inversion = {};
	for (var key in hash) {
		if (!hash.hasOwnProperty(key)) { continue; }
		inversion[hash[key]] = key;
	}

	return inversion;
};

/* sumattr
 *
 * Since javascript doesn't do summing maps very gracefully,
 * here's a hack to take care of a common case of a single
 * level of depth.
 *
 * Required:
 *   [0] list: array of numbers
 *   [1] attr: The name of an attribute common to all the elements in list (e.g. list[0].attr )
 *
 * Returns: sum of all the attributes
 */
Utils.sumattr = function (list, attr) {
	var total = 0;
	for (var i = list.length - 1; i >= 0; i--) {
		total += list[i][attr];
	};

	return total;		
};

/* sum
 *
 * Returns the sum off all the elements of an array.
 *
 * Required: 
 *  [0] array of numbers
 *
 * Returns: sum of array
 */
Utils.sum = function (list) {
	var total = 0;
	for (var i = list.length - 1; i >= 0; i--) {
		total += list[i];
	};

	return total;
};

/* median
 *
 * Given an array of numbers, returns the median.
 *
 * Required: array of numbers
 *
 * Returns: median
 */
Utils.median = function (list) {
	list.sort();

	if (list.length === 0) {
		return null;
	}

	var middle = Math.ceil(list.length / 2);
	if (list.length % 2 === 0) {
		return (list[middle] + list[middle - 1]) / 2;
	}
	return list[middle];
};

/* truncate
 *
 * Provides a method of truncating the decimal 
 * of a javascript number.
 *
 * Required:
 *  [0] n: The number you wish to truncate
 *
 * Returns: The truncated number
 */
Utils.truncate = function (n) {
	if (n > 0) {
		return Math.floor(n);
	}

	return Math.ceil(n);
};

/* seemingly_random
 *
 * A pseudo-random number generator that takes
 * a seed. Useful for creating random seeming events
 * that are coordinated across all players' computers.
 *
 * Cribbed from: http://stackoverflow.com/questions/521295/javascript-random-seeds
 *
 * Required: 
 *   [0] seed
 * 
 * Returns: floating point [0, 1] determined by the seed 
 * 
 * NOTE: YOU MUST MANUALLY INCREMENT THE SEED YOURSELF
 */
Utils.seemingly_random = function (seed) {
	var x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
};

/* random_choice
 *
 * Selects a random element from an array with replacement.
 *
 * Required:
 *   [0] array
 *
 * Returns:
 */
Utils.random_choice = function (array) {
	if (!array.length) {
		return undefined;
	}

	var random_int = Math.round(Math.random() * (array.length - 1));

	return array[random_int];
};

/* biased_random_choice
 *
 * Select an index at random with a probability equal to its relative
 * proportion of weight.
 * 
 * Algorithm: 
 *   1. Generate a random number betwen 0 and sum(weight)
 *   2. Considering each cell as a bin of cubes on the number line
 *      lined up next to each other, select the cell whose bin the random
 *      number lands in.
 *   3. If all the weights are 0, make a uniformly random choice.
 *
 * Required: 
 *   [0] array: A list of objects or numbers (if objects, you must set property)
 *   
 * Optional:
 *   [1] property: If set, the weights will be assigned by mapping this property
 *
 * Returns: An index
 */
Utils.biased_random_choice = function (array, property) {
	if (!array.length) {
		return undefined;
	}

	var weights = array;
	if (property !== undefined) {
		weights = array.map(function (x) { return x[property]; });
	}

	var total = Utils.sum(weights);

	if (total === 0) {
		return Utils.random_choice(array);
	}

	var magicnumber = Math.round(Math.random() * total);

	var accumulation = 0;
	for (var i = 0; i < weights.length; i++) {
		accumulation += weights[i];
		if (accumulation >= magicnumber) {
			return array[i];
		}
	}

	return Utils.random_choice(array);
}

/* numberWithCommas
 *
 * Renders a given number with a delimiter for
 * ease of reading. e.g. 1412000 => 1,412,000
 *
 * TODO: We may want to condition on locale as
 * commas and decimals are reversed in other
 * parts of the world.
 *
 * Required:
 *   [0] x: The number to render
 *   [1] delimiter: defaults to ','
 */
Utils.numberWithCommas = function (x, delimiter) {
	delimiter = delimiter || ",";
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
};

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 * from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
Utils.shuffleArray = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/* ellipsisText
 *
 * Take a long string and return it trimed to a particular length
 * with trailing ellipses.
 *
 * Required:
 *   [0] str
 *   [1] maxlen: int >= 3
 *
 * Return: Possibly truncated string
 */
Utils.ellipsisText = function (str, maxlen) {
	if (maxlen < 3) {
		throw "Unable to trim string to less than size 3. String: " + Utils.ellipsisText(str, 100);
	}

	if (str.length <= maxlen) {
		return str;
	}

	return str.substr(0, maxlen - 3) + "...";
};

/**
 * Merge the queries from the first url with the second url
 * Params from the second url's query will overwrite those in the first query
 */
Utils.mergeQueries = function () {
	var args = Array.prototype.slice.call(arguments);

	var queries = args.map(function (x) {
		return $.url(x).data.param.query;
	});

	var mergedQueries = $.extend.apply(null, [{}].concat(queries));
	var finalQuery = $.param(mergedQueries);

	if (finalQuery) {
		finalQuery = '?' + finalQuery;
	}

	return finalQuery;
};

/* xor
 *
 * Logical xor.
 *
 * Required:
 *   [0] p: boolean
 *   [1] q: boolean
 *
 * Return: p xor q
 */
Utils.xor = function (p,q) {
	return !(p && q) && (p || q);
}

/* guid
 *
 * Generate a globally unique id.
 *
 * Required: None
 *   
 * Return: Random string like '7ac4631c-5fce-99c8-de4b-3088479860aa'
 */
Utils.guid = function () {
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};

	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

Utils.replaceAt = function (str, chr, index) {
	return str.slice(0, index) + chr + str.slice(index + chr.length);
}

Utils.sreverse = function (str) {
	var new_string = "";

	for (var i = str.length - 1; i >= 0; i--) {
		new_string += str[i];
	}

	return new_string;
}

Utils.invertedPyramidLineBreak = function (txt) {
	let tokens = txt.split(" ");
	let html = "";

	let midpt = txt.length / 2;
	let len = 0;

	let broken = false;

	for (let i = 0; i < tokens.length; i++) {
		html += tokens[i];
		len += tokens[i].length;

		if (!broken && len >= midpt) {
			html += '<br>';
			broken = true;
		}
		else {
			html += " ";
			len++;
		}
	}

	return html;
};

Utils.pyramidLineBreak = function (txt) {
	let tokens = txt.split(" ");
	let html = "";

	let midpt = txt.length / 2;
	let len = 0;

	let broken = false;

	for (let i = tokens.length - 1; i >= 0; i--) {
		html += Utils.sreverse(tokens[i]);
		len += tokens[i].length;

		if (!broken && len >= midpt) {
			html += Utils.sreverse('<br>');
			broken = true;
		}
		else {
			html += " ";
			len++;
		}
	}

	return Utils.sreverse(html);
};

// Method to abstract call-once variable logic
Utils.cacheify = function (f) {
	var cache = null;
	var first = true;

	return function() {
		if (first) {
			first = false;
			cache = f.apply(this, arguments);
		}

		return cache;
	}
};
	
// Method to abstract call-once logic
Utils.onceify = function(f) {
    var called = false;
    
    return function() {
        if (!called) {
            called = true;
            return f.apply(this, arguments);
        }
    }
};

Utils.ui = require('./utils.ui.js');
Utils.UI = Utils.ui;

module.exports = Utils;


