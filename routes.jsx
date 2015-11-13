
let GLOBAL = require('./clientjs/GLOBAL.js');

exports.index = function (req, res) {
	res.render('index', { 
		language: 'en',
		title: "Explore | EyeWire",
		mode: "login",
		translation: " ",
		base_url: GLOBAL.base_url,
	});
};