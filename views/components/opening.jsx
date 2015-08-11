// var Login = React.createClass({
// 	getInitialState: function () {
// 		return {};
// 	},
// 	render: function () {
// 		return (
			
// 		);
// 	},
// });

var Welcome = React.createClass({
	getInitialState: function () {
		return {
			
		};
	},
	render: function () {
		return (
			<div className="pitch">
				<img className="logo" src="images/ew.png" />
				<div>Play a Game to Map the Brain</div>
			</div>
		);
	},
});

React.render(
	<Welcome></Welcome>,
	document.getElementById('opening')
);

