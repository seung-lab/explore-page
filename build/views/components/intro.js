"use strict";

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Introduction = React.createClass({
	displayName: "Introduction",
	render: function render() {
		return React.createElement(
			"div",
			null,
			React.createElement(
				ReactCSSTransitionGroup,
				{ transitionName: "loading", transitionAppear: true },
				React.createElement("img", { id: "loader", src: "/images/loader.gif" })
			)
		);
	}
});