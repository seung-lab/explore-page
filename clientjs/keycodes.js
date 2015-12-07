let $ = require('jquery');

let Keycodes = {};

Keycodes.codes = {
	zero: 48,
	one: 49,
	two: 50,
	three: 51,
	four: 52,
	five: 53,
	six: 54,
	seven: 55,
	eight: 56,
	nine: 57,
	a: 65,
	b: 66,
	c: 67,
	d: 68,
	e: 69,
	f: 70,
	g: 71,
	h: 72,
	i: 73,
	j: 74,
	k: 75,
	l: 76,
	m: 77,
	n: 78,
	o: 79,
	p: 80,
	q: 81,
	r: 82,
	s: 83,
	t: 84,
	u: 85,
	v: 86,
	w: 87,
	x: 88,
	y: 89,
	z: 90,
	up: 38,
	down: 40,
	left: 37,
	right: 39,
	shift: 16,
	esc: 27,
	enter: 13,
	'/': 191, 
};

Keycodes.keys = {};

for (var key in Keycodes.codes) {
	Keycodes.keys[Keycodes.codes[key]] = key;
}

let _SIZE = 50,
	_buffer = new Array(_SIZE),
	_i = 0;

$(document).on('keydown', function (evt) {
	_buffer[_i] = evt.keyCode;
	_i = (_i + 1) % _SIZE;
});

Keycodes.lastCodes = function (amt) {
	amt = Math.max(Math.min(amt, _SIZE), 0);

	var fwdbuff = [];
	for (var j = _i - 1; amt > 0; j--, amt--) {
		j = (j === -1) ? _SIZE - 1 : j;
		fwdbuff.push(_buffer[j]);
	}

	fwdbuff = fwdbuff.filter(function (x) { return x !== undefined && x !== null; });
	fwdbuff.reverse();

	return fwdbuff;
};

Keycodes.lastKeys = function (amt) {
	return Keycodes.lastCodes(amt).map(function (code) {
		return Keycodes.keys[code];
	});
};

Keycodes.flush = function (amt) {
	amt = Math.max(Math.min(amt, _SIZE), 0);

	for (var j = _i; amt > 0; j--, amt--) {
		_buffer[j] = null;
	}
};

module.exports = Keycodes;

