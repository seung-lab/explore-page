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

 		setTimeout(function () {
 			_this.view.explorebtn.drop({
				msec: 2000,
				easing: Easing.bounceFactory(0.5),
				side: 'bottom',
				displacement: 25,
			});
			_this.view.explorebtn.show();
 		}, 6000);

 		this.view.startbtn.ion('click', function () {
 			$('#explore').hide();

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

			Utils.UI.curtainFall(function () {
				if ($.cookie('visited')) {
					document.location.href = 'https://eyewire.org/login';
				}
				else {
					document.location.href = 'https://eyewire.org/signup';
				}
			});
 		});

 		this.view.explorebtn.ion('click', function () {
 			$('#registration').hide();

 			Login.initExploring();

			let transition = $('#viewport')
				.scrollTo('#explore', {
					msec: 2000,
					easing: Easing.sigmoidFactory(9),
				});

			ModuleCoordinator.initialize(transition);
			ModuleCoordinator.seek(0);
 		})
 	}
 }

module.exports = Gateway;
