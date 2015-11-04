

var $ = require('jquery');

require('./jquery-extra.js');
require('./jquery-url.js');
require('./jquery-animation.js');
require('./thinking.js');

let Login = require('./login.js'),
	ModuleCoordinator = require('./controllers/ModuleCoordinator.js');

var _intakectrl = new Login.IntakeController();

$(document).ready(function () {

	Login.initialize();

	let t = $.url(window.location.href).param('t');

	if (t === undefined) {
		_intakectrl.playIntro();
		Login.bindResizeEvents('gateway');
	}
	else {
		ModuleCoordinator.initialize();

		if (t.match(/^\d+$/)) {
			t = parseInt(t, 10) / 100;
		}
		else {
			t = ModuleCoordinator.tForName(t);
		}

		ModuleCoordinator.seek(t);

		let curtain = $('<div>').addClass('curtain');
		$('body').append(curtain);

		Login.takeMeTo('explore');

		setTimeout(function () {
			curtain.cssAnimation('fall')
				.always(function () {
					curtain.remove();
				});

			// This trick is done so that the timeline scrolls smoothly into view
			// but is then fixed to the window rather than the module. The ol' switcharoo

			ModuleCoordinator.timeline.anchor = $('body'); 
			ModuleCoordinator.timeline.enter();
		}, 100);
	}
});


// Globals

window.Login = Login;
window.ModuleCoordinator = ModuleCoordinator;
window.Easing = require('./easing.js');
window.$ = $;