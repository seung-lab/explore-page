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
 			.addClass('primary')
 			.text('Start Playing');

 		let explorebtn = $('<button>')
 			.addClass('explorebtn secondary')
 			.text('Explore');

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
					easing: Easing.springFactory(.9, 0),
				});

			ModuleCoordinator.initialize(transition);
			ModuleCoordinator.seek(0);
 		})
 	}
 }

module.exports = Gateway;
