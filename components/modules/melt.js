let $ = require('jquery'),
	utils = require('../../clientjs/utils.js'),
	TeaTime = require('../teatime.js');


class Melt extends TeaTime {
	constructor(args = {}) {
		super(args);

		this.name = 'Melt';
		this.allegience = 'dark';

		let path = function (name) {
			return "/animations/melt/" + name;
		};

		this.duration = 10; // seconds

		this.view = this.generateView();
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
		let text = d('text caps').html(splitter("EyeWire is the first of it's kind", true));
		let counter = d('counter');
		textcontainer.append(text, counter);
		// TODO, fade out before cube goes underneath

		vidContainer.append(textcontainer);

		return {
			module: container,
			vidContainer: vidContainer
		};
	}

	afterEnter (from) {
		var _this = this;
		window.addEventListener('resize', function () {
			resizeVideo(_this.currentVideo);
		});
	}

	next () { // next slide
		SequenceManager.scrollHandler(true);
	}

	previous () { // previous slide
		SequenceManager.scrollHandler(false);
	}

	last () {
		return 0.9;
	}

	render (t_prev, t) {
		console.log('render', t);

		var totalFrames = SEQUENCE_LENGTHS.reduce((a, b) => a + b);

		var targetFrame = t * totalFrames;

		console.log(targetFrame)

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
		this.t = t;
		this.parent.sub_t_update(this.name, t);


		if (SequenceManager.active) {
			SequenceManager.active.pause();
		}

		return this.render(t_prev, t);
	}

	loadVideo(forward, sequence, start, autoplay) {
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

		var src = document.createElement('source');
		src.src = "./animations/Melt_Sequence/small2/melt_" + fString + "_" + sequence + ".mp4";

		seqEl.appendChild(src);

		seqEl.style.position = 'absolute';
		seqEl.style.display = 'none';

		this.view.vidContainer.append(seqEl);

		resizeVideo(seqEl);

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
			resizeVideo(seqEl);

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
				}
			}, 10); // TODO, maybe increase this? there is still a slight glitch in safari after second playthrough
				// TODO with safari, try to change the z-index before switching them
		});


		var ended = false;

		function tTime() {
			var currentFrame = seqEl.currentTime * 30;

			var currentLength = SEQUENCE_LENGTHS[seqEl.seqNum];

			var frameTime = Math.min(currentFrame, currentLength);//forward ? currentFrame : currentLength - currentFrame;

			// var realSeqNum = forward ? seqEl.seqNum : SEQUENCE_COUNT - seqEl.seqNum - 1;

			// console.log('realSeqNum', realSeqNum, currentFrame);

			if (forward) {
				for (var i = 0; i < seqEl.seqNum; i++) {
					frameTime += SEQUENCE_LENGTHS[i];
				};
			} else {
				for (var i = seqEl.seqNum + 1; i < SEQUENCE_COUNT; i++) {
					frameTime += SEQUENCE_LENGTHS[i];
				};
			}

			var totalFrames = SEQUENCE_LENGTHS.reduce((a, b) => a + b);

			var teaTime = frameTime / totalFrames;

			console.log('tTime', forward, seqEl.seqNum, teaTime);

			// return 0.5;

			if (!forward) {
				return 1 - teaTime;
			}

			return teaTime;
		}

		seqEl.addEventListener('pause', function () {
			if (seqEl.currentTime === seqEl.duration) {
				console.log('sequence ended', forward, sequence);
				ended = true;
			}
		});

		setInterval(function () {
			if (SequenceManager.active === seqEl) {
				_this.parent.sub_t_update(_this.name, tTime());
			}
		}, 15);


		seqEl.scrollHandler = function (down) {
			if (!seqEl.started && down === forward) {
				seqEl.play();
				seqEl.started = true;
				return;
			}

			if (!ended) {
				console.log('not ended', down, forward);
				if (down === forward) {
					console.log('double playback', forward, sequence);
					seqEl.playbackRate = 2;
					return;
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
			}
		};

		return seqEl;
	}
}

var videoCache = {
	true: [],
	false: []
};

function resizeVideo(video) {
	video.height = window.innerHeight;
	var videoWidth = 4000 / 2260 * window.innerHeight;
	video.style.left = `${-(videoWidth - window.innerWidth) / 2}px`;
}

var SEQUENCE_COUNT = 4;

var SEQUENCE_LENGTHS = [
	79, 45, 45, 300
];

var SequenceManager = {
	active: null,
	scrollHandler: function (down) {
		if (SequenceManager.active) {
			SequenceManager.active.scrollHandler(down);
		}
	}
};

function splitter (txt, inverted) {
	let tokens = txt.split(" ").filter(function (str) { return str !== "" });

	if (tokens.length < 4) {
		return txt;
	}

	if (inverted) {
		return ipyramid_splitter(txt);
	}

	return pyramid_splitter(txt);
}

function ipyramid_splitter (txt) {
	let tokens = txt.split(" ");
	let html = "";

	let midpt = txt.length / 2;
	let len = 0;

	let broken = false;

	for (let i = 0; i < tokens.length; i++) {
		html += tokens[i];
		len += tokens[i].length;

		if (!broken && len > midpt) {
			html += '<br>';
			broken = true;
		}
		else {
			html += " ";
			len++;
		}
	}

	return html;
}

function pyramid_splitter (txt) {
	let tokens = txt.split(" ");
	let html = "";

	let midpt = txt.length / 2;
	let len = 0;

	let broken = false;

	for (let i = tokens.length - 1; i >= 0; i--) {
		html += utils.sreverse(tokens[i]);
		len += tokens[i].length;

		if (!broken && len > midpt) {
			html += utils.sreverse('<br>');
			broken = true;
		}
		else {
			html += " ";
			len++;
		}
	}

	return utils.sreverse(html);
}

module.exports = Melt;