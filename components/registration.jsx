var React = require('react/addons'),
	Conditional = require('../clientjs/conditional.js').Conditional;

module.exports = React.createClass({
	mixins: [ React.addons.LinkedStateMixin ],
	displayName: "Registration",
	getInitialState: function () {
		return {
			stage: 1,
			forgot: false,
			username: null,
			email: null,
			password: null,

			coordinator: new Conditional({
				set: { username: true, password: true, email: true },
				test: function (conds) { return conds.username; },
				success: function (conds) {
				},
				failure: function (conds, data) { 
				},
			}),
		};
	},
	componentWillMount: function () {
		this.state.coordinator.lazySet('username', function () {

		});
	},
	activateStageTwo: function () {
		this.setState({ stage: 2 });
	},
	register: function () {

		Login.standardRegistration({
			username: this.state.username,
			email: this.state.email,
			password: this.state.password,
		})
		.done(function () {
			Login.continueOn();
		})
		.fail(function (response) {
			if (!response) {
				return;
			}

			var keys = ['username', 'password', 'email'];

			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];

				if (response.reasons[key]) {
					this.state.coordinator.lazySet(key, false, response.reasons[key]);
				}
			}
			
			this.state.coordinator.execute();
		})
	},
	stage_one_render: function () {
		return (
			<div className="registration column">
				<img className="logo" src="/images/ew.svg" alt="EyeWire Logo"></img>
				<div className="location-text">Select Username</div>
				<div className="progress-indicator one"></div>
				<div className="column">
					<input className="username" placeholder="Username" type="text" valueLink={this.linkState('username')}></input>
					<button onClick={this.activateStageTwo} className="primary">OK</button>
				</div>
			</div>
		);
	},
	stage_two_render: function () {
		return (
			<div className="registration column">
				<img className="logo" src="/images/ew.svg" alt="EyeWire Logo"></img>
				<div className="location-text">Registration</div>
				<div className="progress-indicator two"></div>
				<div className="column">
					<input className="username" placeholder="Username" type="text" valueLink={this.linkState('username')}></input>
					<input className="email" placeholder="Email" type="text" valueLink={this.linkState('email')}></input>
					<input className="password" placeholder="Password" type="password" valueLink={this.linkState('password')}></input>
					<button onClick={this.register} className="primary">PLAY</button>
				</div>
				<div className="fb-connect tertiary">Facebook Connect</div>
			</div>
		);
	},
	render: function () {
		if (this.state.stage === 1) {
			return this.stage_one_render();
		}
		else {
			return this.stage_two_render();
		}
	},
});
