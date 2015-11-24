
let base_url = '';
if (process.env.NODE_ENV === 'production') {
	base_url = 'http://eyewire.org/explore'
}

exports.index = function (req, res) {
	res.render('index', { 
		language: 'en',
		title: "Explore | EyeWire",
		mode: "login",
		translation: " ",
		base_url: base_url,
		production: process.env.NODE_ENV === 'production',
	});
};