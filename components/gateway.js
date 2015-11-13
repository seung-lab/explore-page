let $ = require('jquery'), 
	Utils = require('../clientjs/utils.js'),
	ModuleCoordinator = require('../clientjs/controllers/ModuleCoordinator.js'),
 	Easing = require('../clientjs/easing.js'),
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

 	afterEnter () {
 		let _this = this;

 		this.view.explorebtn.hide();

 		if (!Utils.isMobile()) {
	 		setTimeout(function () {
	 			_this.view.explorebtn.drop({
					msec: 2000,
					easing: Easing.bounceFactory(0.5),
					side: 'bottom',
					displacement: 25,
				});
				_this.view.explorebtn.show();
	 		}, 3500);
	 	}

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
				if ($.cookie('visited')) {
					document.location.href = 'https://eyewire.org/login';
				}
				else {
					document.location.href = 'https://eyewire.org/signup';
				}
			});
 		});

 		$(window).one('scrollStart', function () {
 			_this.beginExploring();
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

 	beginExploring () {
 		let _this = this;

 		_this.animations.dip.reject();
		_this.view.explorebtn.off('mouseenter mouseleave');

		$('#registration').hide();

		let transition = $('#viewport')
			.scrollTo('#explore', {
				msec: 2000,
				easing: Easing.sigmoidFactory(12),
			});

		Login.initExploring(transition);
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
