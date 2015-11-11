

var $ = require('jquery');

require('jquery.cookie');
require('./jquery-extra.js');
require('./jquery-url.js');
require('./jquery-animation.js');
require('./thinking.js');

let Login = require('./login.js'),
	Utils = require('./utils.js'),
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
		let transition = $.Deferred();
		ModuleCoordinator.initialize(transition);

		if (t.match(/^\d+$/)) {
			t = parseInt(t, 10) / 100;
		}
		else {
			t = ModuleCoordinator.tForName(t);
		}

		jumpToExplore(t, transition);
	}
});

function jumpToExplore (t, transition) {
	Login.takeMeTo('explore');

	Utils.UI.curtainRise(function () {
		transition.resolve();
	});

	ModuleCoordinator.seek(t);
}

// Globals

window.Login = Login;
window.ModuleCoordinator = ModuleCoordinator;
window.Easing = require('./easing.js');
window.$ = $;


