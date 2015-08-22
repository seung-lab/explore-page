"use strict";

var Login = React.createClass({
	displayName: "Login",

	getInitialState: function getInitialState() {
		return {};
	},
	render: function render() {
		return React.createElement(
			"div",
			{ className: "login" },
			React.createElement("img", { className: "logo", src: "images/ew.png" }),
			React.createElement(
				"div",
				null,
				"Play a Game to Map the Brain"
			)
		);
	}
});

var Welcome = React.createClass({
	displayName: "Welcome",

	getInitialState: function getInitialState() {
		return {};
	},
	render: function render() {
		return React.createElement(
			"div",
			{ className: "pitch" },
			React.createElement("img", { className: "logo", src: "images/ew.png" }),
			React.createElement(
				"div",
				null,
				"Play a Game to Map the Brain"
			)
		);
	}
});

React.render(React.createElement(Welcome, null), document.getElementById('opening'));