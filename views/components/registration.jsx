var Registration = React.createClass({
	displayName: "Registration",
	getInitialState: function () {
		return {
			stage: 1,
		};
	},
	activateStageTwo: function () {
		this.setState({ stage: 2 });
	},
	stage_one_render: function () {
		return (
			<div className="registration">
			//	<img className="logo" src="/images/ew.svg" alt="EyeWire Logo"></img>
				<div className="location-text">{this.state.locationName}</div>
				<div className="progress-indicator"></div>
				<div>
					<input className="username" placeholder="Username" type="text"></input>
					<button onClick={this.activateStageTwo} className="primary">OK</button>
				</div>
			</div>
		);
	},
	stage_two_render: function () {
		return (
			<div className="registration">
				//<img className="logo" src="/images/ew.svg" alt="EyeWire Logo"></img>
				<div className="location-text">{this.state.locationName}</div>
				<div className="progress-indicator"></div>
				<div>
					<input className="username" placeholder="Username" type="text"></input>
					<input className="email" placeholder="Email" type="text"></input>
					<input className="password" placeholder="Password" type="text"></input>
					<button className="primary">PLAY</button>
				</div>
				<div className="fb-connect">Facebook Connect</div>
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
