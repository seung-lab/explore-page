


var Registration = React.createClass({
	displayName: "Registration",
	getInitialState: function () {
		return {
			mode: "username", 
		};
	},
	buttonName: function () {
		return this.state.mode === "play"
			? "OK"
			: "Play";
	},
	render: function () {
		var btnlabel = this.buttonName();

		return (
			<div>
				<img src="/images/ew.png" alt="EyeWire Logo"></img>
				<div className="location-text">{this.state.locationName}</div>
				<div className="progress-indicator"></div>
				<div>
					<input placeholder="Username" type="text"></input>
					<input placeholder="Email" type="text"></input>
					<input placeholder="Password" type="text"></input>
					<input type="text"></input>
					<button>{btnlabel}</button>
				</div>
				<div className="fb-connect">Facebook Connect</div>
			</div>
		);
	},
});

React.render(
	<Registration></Registration>,
	document.getElementById('registration')
);

