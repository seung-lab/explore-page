"use strict";

var ContinueBtn = React.createClass({
	displayName: "ContinueBtn",

	getInitialState: function getInitialState() {
		return {
			text: "Start Playing"
		};
	},
	render: function render() {
		return React.createElement(
			"button",
			{ className: "primary" },
			this.state.text
		);
	}
});

React.render(React.createElement(ContinueBtn, null), document.getElementById('continuebtn'));