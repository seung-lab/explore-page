

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
		if (t.match(/^\d+$/)) {
			t = parseInt(t, 10) / 100;
		}
		else {
			t = ModuleCoordinator.tForName(t);
		}

		jumpToExplore(t);
	}
});

function jumpToExplore (t) {
	let curtain = $('<div>').addClass('curtain');
	$('body').append(curtain);

	Login.takeMeTo('explore');

	let transition = $.Deferred();

	setTimeout(function () {
		curtain.cssAnimation('fall')
			.always(function () {
				curtain.remove();
			});

		transition.resolve();
	}, 100);

	ModuleCoordinator.initialize(transition);
	ModuleCoordinator.seek(t);
}


// Globals

window.Login = Login;
window.ModuleCoordinator = ModuleCoordinator;
window.Easing = require('./easing.js');
window.$ = $;