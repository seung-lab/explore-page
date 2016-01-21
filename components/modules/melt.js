let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	TeaTime = require('../teatime.js'),
	GLOBAL = require('../../clientjs/GLOBAL.js'),
	Easing = require('../../clientjs/easing.js');

let EPS = 0.01;

let videoCache = {
	true: [],
	false: []
};

let FRAME_RATE = 45;

let SEQUENCE_LENGTHS = [
	73, 194
];

let TOTAL_FRAMES = SEQUENCE_LENGTHS.reduce((a, b) => a + b);

let SEQUENCE_COUNT = SEQUENCE_LENGTHS.length;

class Melt extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Melt';
		this.allegience = 'dark';
		this.manual_timeline = true;

		this.duration = 10; // seconds

		this.text = [
			splitter("EyeWire is the first of its kind", true),
			"It's a 3D puzzle game"
		];

		this.view = this.generateView();

		this.slideIndex = 0;

		var _this = this;

		this.timeouts = {
			initial_play: false,
		};
		
		this.loaded = false;
	}

	generateView () {
		let _this = this;

		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let container = d('melt bg-dark module');
		let vidContainer = $('<div>', { id: 'vidContainer' });

		container.append(vidContainer);

		let textcontainer = d('story-text');
		{
			let text = d('text caps').html(this.text[0]);
			let counter = d('counter');

			textcontainer.append(text); // --> Trying no Counter
		}
		vidContainer.append(textcontainer);


		let textcontainer3 = d('story-text bottom');
		{
			let text3 = d('text caps').html(this.text[1]);
			let counter3 = d('counter');
			textcontainer3.append(text3); // --> Trying no Counter
		}
		container.append(textcontainer3);

		let whitePart = d('whitePart');

		container.append(whitePart);

		// TODO, fade out before cube goes underneath

		let supertext = d('super-text').html("as you solve puzzles");
		let textcontainer2 = d('story-text visible-supertext on-white bottom');
		let text2 = d('text caps').html("You're mapping the brain");
		let counter2 = d('counter');
		textcontainer2.append(supertext, text2); // --> Trying no Counter

		let next = d('next')
			.append(d('arrow'))
			.ion('click', function () {
				_this.next();
			});

		container.append(textcontainer2, next);

		return {
			module: container,
			vidContainer: vidContainer,
			texts: [
				textcontainer,
				textcontainer3,
				textcontainer2
			],
			white: whitePart,
			next: next,
		};
	}

	preload () {
		if (this.loaded) {
			return;
		}

		this.loaded = true;

		for (var i = 0; i < SEQUENCE_COUNT; i++) {
			$('<video>', { src: urlForVideo(true, i)});
		};
	}

	next () { // next slide
		if (TOTAL_FRAMES - this.currentFrame() <= 1) {
			this.parent.moduleComplete();
		} else {
			this.scrollHandler(true)
		}
	}

	previous () { // previous slide
		if (this.currentFrame() < 1) {
			this.parent.moduleUncomplete();
		} else {
			this.scrollHandler(false)
		}
	}

	last () {
		return 0.999;
	}

	frameUpdate () {
		let _this = this;

		let currentFrame = this.currentFrame();

		this.t = Math.min(0.999, currentFrame / TOTAL_FRAMES);
		this.parent.sub_t_update(this.name, this.t);

		function easeInWaitOut(in_start_frame, last_frame, in_duration, out_duration, cb) {
			let in_end_frame = in_start_frame + in_duration;
			let out_begin_frame = last_frame - out_duration;

			let frame = currentFrame;

			if (frame < in_start_frame || frame > last_frame) {
				cb(0);
				return;
			}

			if (frame < in_end_frame) {
				let t = (frame - in_start_frame) / in_duration;
				cb(Easing.parabolic(t)); // U shape
				return;
			}

			if (frame > out_begin_frame) {
				let t = 1 - (frame - out_begin_frame) / out_duration;
				cb(Easing.parabolic(t)); // upside-down U shape
				return;
			}

			cb(1);
		}

		this.view.texts[0].css('transition', 'opacity 0s');
		this.view.texts[1].css('transition', 'opacity 0s');
		this.view.texts[2].css('transition', 'opacity 0s');

		easeInWaitOut(0, 15, 0, 10, function (p) {
			_this.view.texts[0].css('opacity', p);
		});

		easeInWaitOut(30, 73 + 15, 15, 15, function (p) {
			_this.view.texts[1].css('opacity', p);
		});

		easeInWaitOut(TOTAL_FRAMES - 10, TOTAL_FRAMES, 15, 0, function (p) {
			_this.view.texts[2].css('opacity', p);
		});

		let whiteTStart = 0.87; // global t = 91.2, end = 96.1

		let heightStart = 28;
		let heightEnd = 38;

		easeInWaitOut(226, TOTAL_FRAMES, (TOTAL_FRAMES - 226), 0, function (p) {
			_this.view.white.css('height', (p * heightEnd + (1-p) * heightStart) + '%');
			_this.view.white.css('opacity', p);
		});
	}

	render (t_prev, t) {
		let totalFrames = SEQUENCE_LENGTHS.reduce((a, b) => a + b);

		let targetFrame = t * totalFrames;

		for (var i = 0; i < SEQUENCE_LENGTHS.length; i++) {
			let length = SEQUENCE_LENGTHS[i];

			if (targetFrame > length) {
				targetFrame -= length;
			} else {
				break;
			}
		};

		let targetSecond = targetFrame / FRAME_RATE;

		this.activeVideo = this.loadVideo(true, i, targetSecond, false);
	}

	seek (t) {
		let t_prev = this.t;
		this.frameUpdate();

		if (this.activeVideo) {
			this.activeVideo.pause();
		}

		return this.render(t_prev, t);
	}

	dropTheBeat () {
		let _this = this;

		_this.view.next.drop({
			msec: 1500,
			easing: Easing.bounceFactory(11),
			side: 'bottom',
			displacement: 25,
		});

		_this.view.next.show();
	}

	afterEnter (transition) {
		let _this = this;

		_this.view.next.hide();

		transition.done(function () {
			_this.dropTheBeat();
		});
	}

	beforeExit () {
		clearTimeout(this.timeouts.initial_play);
		if (this.activeVideo) {
			this.activeVideo.pause();
		}
	}

	scrollHandler (down) {
		if (this.activeVideo) {
			return this.activeVideo.scrollHandler(down);
		}
	}

	currentFrame () {
		let video = this.activeVideo;

		if (!video) {
			return Math.floor(this.t * TOTAL_FRAMES);
		}

		let currentSeqFrame = video.currentTime * FRAME_RATE;

		var currentLength = SEQUENCE_LENGTHS[video.seqNum];

		let lagBuffer = 0; //video.forward ? 0 : 5;

		var frameTime = Math.min(currentSeqFrame + lagBuffer, currentLength);

		if (video.forward) {
			for (var i = 0; i < video.seqNum; i++) {
				frameTime += SEQUENCE_LENGTHS[i];
			};
		} else {
			for (var i = video.seqNum + 1; i < SEQUENCE_COUNT; i++) {
				frameTime += SEQUENCE_LENGTHS[i];
			};
		}

		return Math.floor(video.forward ? frameTime : TOTAL_FRAMES - frameTime); 
	}

	loadVideo(forward, sequence, start, autoplay) {
		let _this = this;

		// console.log('loadVideo', forward, sequence, start, autoplay);
		start = start || 0;
		var cacheResult = videoCache[forward][sequence];

		if (cacheResult) {
			cacheResult.myautoplay = autoplay;
			cacheResult.started = false;

			cacheResult.playbackRate = 1;
			cacheResult.currentTime = start;
			return cacheResult;
		}

		var seqEl = document.createElement('video');

		seqEl.myautoplay = autoplay;

		seqEl.forward = forward;

		var src = document.createElement('source');
		src.src = urlForVideo(forward, sequence);

		seqEl.appendChild(src);

		seqEl.style.position = 'absolute';
		seqEl.style.display = 'none';

		this.view.vidContainer.append(seqEl);

		seqEl.seqNum = sequence;

		videoCache[forward][sequence] = seqEl;

		seqEl.addEventListener('loadeddata', function () {
			seqEl.currentTime = start;

			var lastTime = -1;

			setInterval(function () {
				if (_this.activeVideo === seqEl) {
					let frame = seqEl.currentTime * FRAME_RATE;
					_this.frameUpdate();
				}
			}, 15);
		});

		seqEl.addEventListener('play', function () {
			_this.view.next.hide();
		});

		seqEl.addEventListener('seeked', function () {
			_this.currentVideo = seqEl;

			seqEl.setupAndReadyToGo = true;
			seqEl.style.display = 'inherit';

			setTimeout(function () {
				if (_this.currentVideo !== seqEl) {
					return;
				}

				var videos = videoCache[true].concat(videoCache[false]);

				for (var i = 0; i < videos.length; i++) {
					var video = videos[i];

					if (video) {
						if (video !== seqEl) {
							video.style.display = 'none';
						}
					}
				}

				// ended = false;

				if (seqEl.myautoplay) {
					seqEl.play();
					seqEl.started = true;
				} 
				else if (sequence === 0 && forward) {
					_this.timeouts.initial_play = setTimeout(function () {
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
				ended = true;
			}
		});

		seqEl.addEventListener('ended', function () {
			_this.dropTheBeat();
		});

		seqEl.scrollHandler = function (down) {
			if (!seqEl.started) {
				if (down === forward) {
					seqEl.play();
					seqEl.started = true;

					return;
				}
			}

			if (!ended) {
				if (down === forward) {
					seqEl.playbackRate = 2;
					return;
				} else {
					// pleaseEnd = true;
					seqEl.pause();
					// jumpTime = seqEl.duration - seqEl.currentTime;
				}
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

			var nextIdx = sequence + diff;


			if (nextIdx >= 0 && nextIdx < SEQUENCE_COUNT) {
				ended = false; // prevents double triggers, ended really means just ended

				var next = _this.loadVideo(down, nextIdx, seqEl.duration - seqEl.currentTime, true);
				_this.activeVideo = next;
				// if (next.setupAndReadyToGo) {
					// next.currentTime = seqEl.duration - seqEl.currentTime;
					// next.playbackRate = 1;
				// }
			}
		};

		return seqEl;
	}
}

function urlForVideo(forward, sequence) {
	return `${GLOBAL.base_url}/animations/melt/desktop/oooo${sequence}${forward ? '' : 'r'}.mp4`;
}

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