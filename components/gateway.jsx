var React = require('react/addons'),
 	Easing = require('../clientjs/easing.js');

module.exports = React.createClass({
	displayName: "Gateway",
	getInitialState: function () {
		return {};
	},
	gotoRegistration: function () {
		$('#explore').hide();

		$('#viewport').scrollTo('#registration', {
			msec: 4000,
			easing: Easing.springFactory(.9, 1),
		});
	},
	gotoExplore: function () {
		$('#registration').hide();

		$('#viewport').scrollTo('#explore', {
			msec: 2500,
			easing: Easing.springFactory(.9, 0),
		});
	},
	render: function () {
		return (
			<div>
				<div id="opening">
					<div className="login">
						<div>A Game to Map the Brain</div>
					</div>
				</div>
				<div id="continuebtn">
					<button onClick={this.gotoRegistration} className="primary">Start Playing</button>
				</div>

				<button onClick={this.gotoExplore} className="explorebtn secondary">Explore</button>
			</div>
		);
	},
});
