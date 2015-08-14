var ContinueBtn = React.createClass({
	getInitialState: function () {
		return {
			text: "Start Playing",
		};
	},
	render: function () {
		return (
			<button className="primary">{this.state.text}</button>
		);
	},
})

React.render(
	<ContinueBtn></ContinueBtn>,
	document.getElementById('continuebtn')
);


