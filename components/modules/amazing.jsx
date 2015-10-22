let React = require('react/addons'),
	utils = require('../../clientjs/utils.js');

module.exports = React.createClass({
	mixins: [ React.addons.PureRenderMixin ],
	displayName: "Amazing",
	getInitialState: function () {
		return {
			t: this.props.t,
			slides: [
				{
					text: "Your brain makes you amazing!",
				},
				{
					supertitle: "It allows you to:",
					text: "Learn intricate skills",
				},
				{
					text: "Dream fantastic dreams",
				},
				{
					text: "Event laugh at goofy cat videos",
				},
				{
					text: "But how?",
				},
			],
		};
	},
	componentWillMount: function () {

	},
	currentSlide: function () {
		let N = this.state.slides.length;

		let index = Math.floor(this.state.t * N);

		return this.state.slides[index];
	},
	render: function () {

		let slide = this.currentSlide();

		return (<div className="amazing bg-light">
			<video controls>
				<source src="/animations/out.mp4"></source>
			</video>
			<div className="story-text">{slide.text}</div>
		</div>);
	},
});