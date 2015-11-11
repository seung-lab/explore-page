let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	TeaTime = require('../teatime.js');


var EPS = 0.01;

class Melt extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Melt';
		this.allegience = 'dark';

		let path = function (name) {
			return "/animations/melt/" + name;
		};

		this.duration = 10; // seconds

		this.text = [
			splitter("EyeWire is the first of its kind", true),
			splitter("It's a 3D puzzle game", true)
		];

		this.view = this.generateView();

		this.slideIndex = 0;

		var _this = this;

		window.onresize = function () {
			_this.resize();
		};
		_this.resize();
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};


		let container = $('<div>').addClass('melt bg-dark module');
		let vidContainer = $('<div>', { id: 'vidContainer' });

		container.append(vidContainer);

		let textcontainer = d('story-text');
		{
			let text = d('text caps').html(this.text[0]);
			let counter = d('counter');

			textcontainer.append(text, counter);
		}
		vidContainer.append(textcontainer);


		let textcontainer3 = d('story-text bottom');
		{
			let text3 = d('text caps').html(this.text[1]);
			let counter3 = d('counter');
			textcontainer3.append(text3, counter3);
		}
		container.append(textcontainer3);

		let whitePart = d('whitePart');

		container.append(whitePart);

		// TODO, fade out before cube goes underneath


		let supertext = d('super-text').html("as you solve puzzles");
		let textcontainer2 = d('story-text visible-supertext on-white bottom');
		let text2 = d('text caps').html(splitter("You're mapping the brain", true));
		let counter2 = d('counter');
		textcontainer2.append(supertext, text2, counter2);

		container.append(textcontainer2);

		return {
			module: container,
			vidContainer: vidContainer,
			texts: [
				textcontainer,
				textcontainer3,
				textcontainer2
			],
			white: whitePart
		};
	}

	resize() {
		var aspect = window.innerWidth / window.innerHeight;
		if (aspect > (16 / 10) && aspect < 2) {
			this.view.module.addClass('wide');
		} else {
			this.view.module.removeClass('wide');
		}
	}

	next () { // next slide
		console.log('next', SequenceManager.tTime(), this.t);
		if (SequenceManager.tTime() > 1 - EPS) {
			this.parent.moduleComplete();
		} else {
			SequenceManager.scrollHandler(true)
		}
	}

	previous () { // previous slide
		console.log('previous', SequenceManager.tTime(), this.t);
		if (SequenceManager.tTime() < EPS) {
			this.parent.moduleUncomplete();
		} else {
			SequenceManager.scrollHandler(false)
		}
	}

	last () {
		return 0.999;
	}

	timeUpdate (t) {
		console.log('timeUpdate', t);
		this.t = t;
		this.parent.sub_t_update(this.name, t);

		var i = 0;

		if (t < 0.01) {
			this.view.texts[i].css('opacity', '1');
			this.view.texts[i].css('transition', 'opacity 0s');
		} else {
			this.view.texts[i].css('transition', 'opacity 0.5s');
			this.view.texts[i].css('opacity', '0');
		}

		i++;

		if (t > 0.16 && t < 0.37) {
			this.view.texts[i].css('opacity', '1');
		} else {
			this.view.texts[i].css('opacity', '0');
		}

		i++;

		if (t > 0.89 && t < 1) {
			this.view.texts[i].css('opacity', '1');
		} else {
			this.view.texts[i].css('opacity', '0');
		}

		var whiteTStart = 0.87;

		if (t > whiteTStart) {
			var p = (t - whiteTStart) / (1 - whiteTStart);

			var heightStart = 27;
			var heightEnd = 37;


			this.view.white.css('opacity', p); 
			this.view.white.css('height', (p * heightEnd + (1-p) * heightStart) + '%');
		} else {
			this.view.white.css('opacity', 0);
		}
	}

	render (t_prev, t) {
		console.log('render', t);

		var totalFrames = SEQUENCE_LENGTHS.reduce((a, b) => a + b);

		var targetFrame = t * totalFrames;

		for (var i = 0; i < SEQUENCE_LENGTHS.length; i++) {
			let length = SEQUENCE_LENGTHS[i];

			if (targetFrame > length) {
				targetFrame -= length;
			} else {
				break;
			}
		};

		var targetSecond = targetFrame / 30;

		console.log('load', i, targetSecond);

		var vid = this.loadVideo(true, i, targetSecond, false);
		SequenceManager.active = vid;
	}

	seek (t) {
		console.log('seek', t);
		let t_prev = this.t;
		this.timeUpdate(t);


		if (SequenceManager.active) {
			SequenceManager.active.pause();
		}

		return this.render(t_prev, t);
	}

	loadVideo(forward, sequence, start, autoplay) {
		console.log('loadVideo', forward, sequence, start, autoplay);
		start = start || 0;
		var cacheResult = videoCache[forward][sequence];

		if (cacheResult) {
			cacheResult.myautoplay = autoplay;
			cacheResult.started = false;

			cacheResult.playbackRate = 1;
			cacheResult.currentTime = start;
			return cacheResult;
		}

		var fString = forward ? 'forward' : 'backward';

		var seqEl = document.createElement('video');

		seqEl.myautoplay = autoplay;

		seqEl.forward = forward;

		var src = document.createElement('source');
		src.src = "./animations/Melt_Sequence/small2/melt_" + fString + "_" + sequence + ".mp4";

		seqEl.appendChild(src);

		seqEl.style.position = 'absolute';
		seqEl.style.display = 'none';

		this.view.vidContainer.append(seqEl);

		seqEl.seqNum = sequence;

		videoCache[forward][sequence] = seqEl;

		seqEl.addEventListener('loadeddata', function () {
			console.log('loadeddata');
			seqEl.currentTime = start;
		});

		var _this = this;

		seqEl.addEventListener('seeked', function () {
			_this.currentVideo = seqEl;
			console.log('seeked', forward, sequence);
			// ended = false;

			seqEl.setupAndReadyToGo = true;
			seqEl.style.display = 'inherit';

			setTimeout(function () {
				var videos = videoCache[true].concat(videoCache[false]);

				for (var i = 0; i < videos.length; i++) {
					var video = videos[i];

					if (video) {
						if (video !== seqEl) {
							video.style.display = 'none';
						}
					}
				};

				// ended = false;

				if (seqEl.myautoplay) {
					seqEl.play();
					seqEl.started = true;
				} else if (sequence === 0 && forward) {
					setTimeout(function () {
						if (!seqEl.started) {
							seqEl.play();
							seqEl.started = true;
						}
					}, 3000);
				}
			}, 10); // TODO, maybe increase this? there is still a slight glitch in safari after second playthrough
				// TODO with safari, try to change the z-index before switching them
		});


		var ended = false;

		seqEl.addEventListener('pause', function () {
			if (seqEl.currentTime === seqEl.duration) {
				console.log('sequence ended', forward, sequence, SequenceManager.tTime());
				ended = true;
			}
		});

		setInterval(function () {
			if (SequenceManager.active === seqEl) {
				_this.timeUpdate(SequenceManager.tTime());
			}
		}, 15);


		seqEl.scrollHandler = function (down) {
			if (!seqEl.started) {
				console.log('not started', sequence);
				if (down === forward) {
					console.log('starting', sequence);
					seqEl.play();
					seqEl.started = true;

					return true;
				} else {
					// return true;
					// return false; // TODO, this may be a mistake if we start at the end
				}
			}

			if (!ended) {
				console.log('not ended', down, forward);
				if (down === forward) {
					console.log('double playback', forward, sequence);
					seqEl.playbackRate = 2;
					return true;
				} else {
					console.log('pausing', forward, sequence);
					// pleaseEnd = true;
					seqEl.pause();
					// jumpTime = seqEl.duration - seqEl.currentTime;
				}
			} else {
				console.log('scrollstart and is sended', forward, sequence);
			}

			var diff = 0;

			if (down) {
				if (forward) {
					diff = 1;
				}
			} else {
				if (forward) {
				} else {
					diff = -1;
				}
			}

			var nextIdx = sequence + diff;//.mod(SEQUENCE_COUNT);

			// console.log('switching from', forward, sequence, 'to', down, nextIdx);

			if (nextIdx >= 0 && nextIdx < SEQUENCE_COUNT) {
				ended = false; // prevents double triggers, ended really means just ended
				console.log('switching from', forward, sequence, 'to', down, nextIdx);

				// console.log('boo', seqEl.duration - seqEl.currentTime);

				var next = _this.loadVideo(down, nextIdx, seqEl.duration - seqEl.currentTime, true);
				SequenceManager.active = next;
				// if (next.setupAndReadyToGo) {
					// next.currentTime = seqEl.duration - seqEl.currentTime;
					// next.playbackRate = 1;
				// }
			} else {
				console.log('ignoring');
				// return false;
			}

			// return true;
		};

		return seqEl;
	}
}

var videoCache = {
	true: [],
	false: []
};

var SEQUENCE_COUNT = 4;

var SEQUENCE_LENGTHS = [
	79, 45, 45, 300
];

var SequenceManager = {
	active: null,
	scrollHandler: function (down) {
		if (SequenceManager.active) {
			return SequenceManager.active.scrollHandler(down);
		}
	},
	tTime: function () {
		var video = SequenceManager.active;


		var currentFrame = video.currentTime * 30;

		var currentLength = SEQUENCE_LENGTHS[video.seqNum];

		var frameTime = Math.min(currentFrame, currentLength);//forward ? currentFrame : currentLength - currentFrame;

		// var realSeqNum = forward ? seqEl.seqNum : SEQUENCE_COUNT - seqEl.seqNum - 1;

		// console.log('realSeqNum', realSeqNum, currentFrame);

		if (video.forward) {
			for (var i = 0; i < video.seqNum; i++) {
				frameTime += SEQUENCE_LENGTHS[i];
			};
		} else {
			for (var i = video.seqNum + 1; i < SEQUENCE_COUNT; i++) {
				frameTime += SEQUENCE_LENGTHS[i];
			};
		}

		var totalFrames = SEQUENCE_LENGTHS.reduce((a, b) => a + b);

		var teaTime = frameTime / totalFrames;

		// console.log('tTime', forward, seqEl.seqNum, teaTime);

		// return 0.5;

		if (!video.forward) {
			return Math.min(1 - teaTime, 0.999);
		}

		return Math.min(teaTime, 0.999);
	}
};

function splitter (txt, inverted) {
	let tokens = txt.split(" ").filter(function (str) { return str !== "" });

	if (tokens.length < 4) {
		return txt;
	}

	if (inverted) {
		return utils.invertedPyramidLineBreak(txt);
	}

	return utils.pyramidLineBreak(txt);
}

module.exports = Melt;