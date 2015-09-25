

exports.index = function (req, res) {
	res.render('index', { 
		language: 'en',
		title: "Explore | EyeWire",
		mode: "login",
		translation: "",
	});
};

exports.index2 = function (req, res) {
	res.render('index2', { 
		language: 'en',
		title: "Explore | EyeWire",
		mode: "login",
		translation: "",
	});
};