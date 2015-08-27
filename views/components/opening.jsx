//=require login.jsx

var Welcome = React.createClass({
	getInitialState: function () {
		return {
			
		};
	},
	render: function () {
		return (
			<div className="pitch">
				<div>Play a Game to Map the Brain</div>
			</div>
		);
	},
});

React.render(
	<Welcome></Welcome>,
	document.getElementById('opening')
);

