let React = require('react/addons'),
	$ = require('jquery'), 
	ModuleCoordinator = require('../clientjs/controllers/ModuleCoordinator.js'),
 	Easing = require('../clientjs/easing.js'),
 	Login = require('../clientjs/login.js');

module.exports = React.createClass({
	displayName: "Gateway",
	getInitialState: function () {
		return {};
	},
	gotoRegistration: function () {
		$('#explore').hide();

		$(window).ion('resize', function () {
			$('#viewport').scrollTo('#registration', {
				msec: 0,
			})
		});

		$('#viewport').scrollTo('#registration', {
			msec: 4000,
			easing: Easing.springFactory(.9, 1),
		});
	},
	gotoExplore: function () {
		$('#registration').hide();

		$(window).ion('resize', function (evt) {
			$('#viewport').scrollTo('#explore', {
				msec: 0,
			});
		});

		ModuleCoordinator.initialize();
		ModuleCoordinator.seek(0);

		$('#viewport')
			.scrollTo('#explore', {
				msec: 2000,
				easing: Easing.springFactory(.9, 0),
			})
			.done(function () {
				// This trick is done so that the timeline scrolls smoothly into view
				// but is then fixed to the window rather than the module. The ol' switcharoo

				ModuleCoordinator.timeline.anchor = $('body'); 
				ModuleCoordinator.timeline.enter();
			})
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
