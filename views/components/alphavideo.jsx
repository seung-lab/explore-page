var React = require('react');

module.exports = React.createClass({
	displayName: "AlphaVideo",
	getInitialState: function () {
		return {
			webm_alpha_support: undefined,
		};
	},
	detectNativeAlphaSupport: function () {
		var _this = this;

		if (this.state.webm_alpha_support !== undefined) {
			return $.Deferred().resolve(this.state.webm_alpha_support).promise();
		}

		var context = $('<canvas>')[0].getContext('2d');
		
		var test_video = $('<video>')
					.css('display', 'none')
					.attr('src', '/animations/alpha-test.webm');

		test_video = test_video[0];

		var deferred = $.Deferred();

		function processFrame() {
			output.drawImage(test_video, 0, 0);

			var data = output.getImageData(0,0, canvas.width, canvas.height);
			var uint8arr = data.data;

			var hasalpha = false;
			for (var i = 3; i < uint8arr.length; i += 4) {
				hasalpha = hasalpha || (uint8arr[i] < 255);

				if (hasalpha) {
					deferred.resolve(true);
					break;
				}
			}

			deferred.resolve(false);
		}

		test_video
			.addEventListener('playing', function () {
				processFrame();
				test_video.pause();
				test_video.src = "";
			}, false)
			.addEventListener('error', function () {
				deferred.reject();
			});

		test_video.play();

		deferred
			.done(function (supported) {
				_this.setState({ webm_alpha_support: supported });
			})
			.fail(function () {
				_this.setState({ webm_alpha_support: false });
			});

		return deferred.promise();
	},
	renderNativeAlpha: function () {
		var source = this.props.src.replace(/\.[\w\d]+$/, '.webm');
		return <video {...this.props} src="{source}"></video>
	},
	renderHackedAlpha: function () {
		var source_base = this.props.src.replace(/\.[\w\d]+$/, '');
		var source = source_base + '.mp4',
			alpha_mask = source_base + '-mask.mp4';

		

	},
	componentWillMount: function () {
		this.detectNativeAlphaSupport();
	},
	render: function () {
		if (this.state.webm_alpha_support === undefined) {
			return <div></div>
		}

		if (this.state.webm_alpha_support) {
			return this.renderNativeAlpha();
		}
		else {
			return this.renderHackedAlpha();
		}

		var source = this.props.source.replace(/\.[\w\d]+$/, 'webm');

		var webm = <video src="{source}"></video>

		return (
			<div>
			</div>
		);
	},
});

