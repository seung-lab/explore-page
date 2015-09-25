var FixedHeader = React.createClass({
	displayName: "FixedHeader",
	getInitialState: function () {
		return {
			stage: 'gateway',
			visible: false,
		};
	},
	renderGateway: function () {
		var cx = React.addons.classSet;

		var classes = cx({
			container: true,
			invisible: !this.state.visible,
		});

		return (
			<div className={classes}>
				<div className="logotype"></div>
				<div onClick="" className="icon share"></div>
			</div>
		);
	},
	render: function () {
		if (this.state.stage === 'gateway') {
			return this.renderGateway();
		}
	},
});
