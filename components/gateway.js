let $ = require('jquery'), 
	Utils = require('../clientjs/utils.js'),
	ModuleCoordinator = require('../clientjs/controllers/ModuleCoordinator.js'),
 	Easing = require('../clientjs/easing.js'),
 	GLOBAL = require('../clientjs/GLOBAL.js'),
 	Synapse = require('./synapse.js');

let Login; // avoid circular reference

class Gateway extends Synapse { // You can only build within a pylon field
 	constructor (args = {}) {
 		args.name = args.name || "Gateway";
 		super(args);

 		Login = args.login;

 		this.view = this.generateView();

 		this.animations = {
 			dip: $.Deferred().resolve(),
 		};
 	}

 	generateView () {
 		let _this = this;

 		let container = $('<div>');

 		let opening = $('<div>').addClass('opening');
 		let logintxt = $('<div>')
 			.addClass('login')
 			.text('A Game to Map the Brain');

 		opening.append(logintxt);

 		let startplayingbtn = $('<button>')
 			.addClass('primary play-now')
 			.text('Play Now');

 		let explorebtn = $('<div>')
 			.addClass('explorebtn')
 			.append(
 				$('<div>').addClass('arrow'),
 				$('<div>').addClass('text').text('EXPLORE')
 			);

 		container.append(
 			opening,
 			startplayingbtn,
 			explorebtn
 		);

 		return {
 			module: container,
 			startbtn: startplayingbtn,
 			explorebtn: explorebtn,
 		};
 	}

 	attachEvents () {
 		let _this = this;

 		$(window).ion('scrollStart.gateway', function (e, up) {
 			if (up) {
	 			_this.beginExploring();
	 			$(window).off('scrollStart.gateway');
	 		}
 		});

		$(window).ion('swipe.gateway', function (e, evt) {
			if (evt.deltaY < 0) {
				_this.beginExploring();
				$(window).off('swipe.gateway');
			}
		});

		$(window).ion('unload.track.gateway', function () {
			mixpanel.track('unload', {
				from: 'gateway',
			});
		});

 		this.view.explorebtn.ion('click', function () {
 			_this.beginExploring();	
 		})

 		this.view.explorebtn.ion('mouseenter', function () {
 			_this.dipReveal(5);
 		});

 		this.view.explorebtn.ion('mouseleave', function () {
 			_this.dipReveal(0);
 		});
 	}

 	unattachSwipeEvents () {
 		$(window).off('scrollStart.gateway swipe.gateway');
 	}

 	enableButton () {
 		let _this = this;
 		
 		this.view.startbtn.ion('click', function () {
 			// $('#explore').hide();

			// let transition = $('#viewport').scrollTo('#intake', {
			// 	msec: 4000,
			// 	easing: Easing.springFactory(.9, 1),
			// });

			// if ($.cookie('visited')) {
			// 	Login.initLogin(transition);
			// }
			// else {
			// 	Login.initRegistration(transition);
			// }

			if (Utils.isMobile()) {
				_this.beginExploring();
				return;
			}

			Utils.UI.curtainFall(function () {
				$(window).off('unload.track');

				if ($.cookie('visited')) {
					document.location.href = `https://${GLOBAL.host}/login`;
				}
				else {
					document.location.href = `https://${GLOBAL.host}/signup`;
				}
			});

			mixpanel.track('play-now', {
				from: 'gateway',
			});
 		});
 	}

 	afterEnter (transition) {
 		let _this = this;

 		this.view.explorebtn.hide();

 		if (!Utils.isMobile()) {
	 		transition.done(function () {
	 			_this.view.explorebtn.drop({
					msec: 2000,
					easing: Easing.bounceFactory(12),
					side: 'bottom',
					displacement: 25,
				});
				_this.view.explorebtn.show();
	 		});
	 	}

  		_this.enableButton();

	 	transition.done(function () {
	 		_this.attachEvents();
	 	});
 	}

 	preloadExplore () {
 		ModuleCoordinator.preload('Amazing');
 	}

 	beginExploring () {
 		let _this = this;

		mixpanel.track('begin-exploring', {
			delay: Math.round(window.performance.now() / 1000),
		});

 		_this.animations.dip.reject();
		_this.view.explorebtn.off('mouseenter mouseleave');

		$('#registration').hide();
		$(window).off('unload.gateway');

		let transition = Login.takeMeTo('explore', {
			msec: 2000,
			easing: Easing.sigmoidFactory(12),
		});
		
		ModuleCoordinator.initialize(transition);
		ModuleCoordinator.seek(0, transition);
 	}

 	dipReveal (offset) {
 		let _this = this;
 		
 		_this.animations.dip.reject();

		_this.animations.dip = $('#viewport').scrollTo(_this.view.module.parent(), {
			msec: 300,
			easing: Easing.parabolic,
			offset: offset,
		});
 	}

 	render () {
 		let _this = this;
 		let mobile = Utils.isMobile();

 		if (mobile) {
 			_this.view.explorebtn.hide();
 			_this.view.startbtn.text("Explore");
 		}
 		else {
 			_this.view.startbtn.text("Play Now");
 		}
 	}
 }

module.exports = Gateway;
