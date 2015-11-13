// var React = require('react'),
// 	Gateway = require('./components/gateway.jsx'),
// 	Registration = require('./components/registration.jsx');

exports.index = function (req, res) {
	res.render('index', { 
		language: 'en',
		title: "Explore | EyeWire",
		mode: "login",
		translation: " ",

		base_url: "http://eyewire.org/explore",

		// reactGateway: React.renderToString(<Gateway />),
		// reactRegistration: React.renderToString(<Registration />),
	});
};