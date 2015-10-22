let React = require('react/addons'),
	utils = require('../clientjs/utils.js');

module.exports = React.createClass({
	mixins: [ React.addons.PureRenderMixin ],
	displayName: "Timeline",
	getInitialState: function () {
		return {};
	},
	componentWillMount: function () {

	},
	render: function () {
		let t = utils.clamp(this.props.t, 0, 1);

		let styles = {
			width: (t * 100) + "%",
		};

		return (<div className="timeline">
			<div style={styles} className="progress"></div>
		</div>);
	},
});