var Logo = React.createClass({
	render: function () {
		return (
			<img className="logo" src="images/ew.png" />
		);
	},
})

var Welcome = React.createClass({
	getInitialState: function () {
		return {
			neuron_open: false,
		};
	},
	neuralRuleClick: function (evt) {
		this.setState({ neuron_open: true });
	},
	render: function () {
		var open = this.neuron_open ? 'open' : '';

		return (
			<div className="pitch">
				<Logo></Logo>
				<div>Play a Game to Map the Brain</div>
				<div className="neural-rule {open}" onClick={this.neuralRuleClick}></div>
			</div>
		);
	},
})

React.render(
	<Welcome></Welcome>,
	document.getElementById('gateway'),
	function () {
		setTimeout(function () {
			$('.logo').alwaysCenterIn('.pitch', { direction: "horizontal" });
		}, 0);
	}
);

