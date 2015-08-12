var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Introduction = React.createClass({
	displayName: "Introduction",
	render: function () {
		return (
			<div>
				<ReactCSSTransitionGroup transitionName="loading" transitionAppear={true}>
					<img id="loader" src="/images/loader.gif"></img>
				</ReactCSSTransitionGroup>
			</div>
		);
	},
});