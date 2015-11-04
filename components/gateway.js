let $ = require('jquery'), 
	ModuleCoordinator = require('../clientjs/controllers/ModuleCoordinator.js'),
 	Easing = require('../clientjs/easing.js'),
 	Synapse = require('./synapse.js');

let Login; // avoid circular reference

 class Gateway extends Synapse {
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

 			Login.initRegistration();

			$('#viewport').scrollTo('#intake', {
				msec: 4000,
				easing: Easing.springFactory(.9, 1),
			});
 		});

 		this.view.explorebtn.ion('click', function () {
 			$('#registration').hide();

 			Login.bindResizeEvents('explore');

			ModuleCoordinator.initialize();
			ModuleCoordinator.seek(0);

			$('#viewport')
				.scrollTo('#explore', {
					msec: 2000,
					easing: Easing.springFactory(.9, 0),
				})
				.done(function () {
					// This trick is done so that the timeline scrolls smoothly into view
					// but is then fixed to the window rather than the module. The ol' switcharoo

					ModuleCoordinator.timeline.anchor = $('body'); 
					ModuleCoordinator.timeline.enter();
				})
 		})
 	}
 }

module.exports = Gateway;
