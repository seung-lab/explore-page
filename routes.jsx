var React = require('react'),
	Gateway = require('./views/components/gateway.jsx'),
	Registration = require('./views/components/registration.jsx'),
	FixedHeader = require('./views/components/header.jsx');

exports.index = function (req, res) {
	res.render('index', { 
		language: 'en',
		title: "Explore | EyeWire",
		mode: "login",
		translation: " ",

		reactGateway: React.renderToString(<Gateway />),
		reactRegistration: React.renderToString(<Registration />),
		reactHeader: React.renderToString(<FixedHeader />),
	});
};