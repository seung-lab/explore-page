

var $ = require('jquery');

window.jQuery = $; // need to define this for imagesLoaded

require('jquery.cookie');
require('imagesloaded'); 
require('./jquery-extra.js');
require('./jquery-url.js');
require('./jquery-animation.js');
require('./thinking.js');
require('./jquery-scrollstart.js');
require('./jquery-hammer.js');

let Login = require('./login.js'),
	Utils = require('./utils.js'),
	ModuleCoordinator = require('./controllers/ModuleCoordinator.js'),
	GLOBAL = require('./GLOBAL.js');

var _intakectrl = new Login.IntakeController();

$(document).ready(function () {
	// if you simply use overflow-y: hidden, the animation is laggy 
	// so here are some hacks to display like scrolling is allowed without 
	// actually allowing it
	//
	// scrolling is enabled at all times but the scrollbar is pushed off the screen
	// we want manually control the scrolling so we prevent the default behavior
	$(document).disableScrolling();

	Login.initialize();

	let t = $.url(window.location.href).param('t');

	if (t === undefined) {
		Utils.UI.curtainRise(function () {
			_intakectrl.playIntro();
		}, 250);
	}
	else {
		let transition = $.Deferred();
		ModuleCoordinator.initialize(transition);

		if (t.match(/^\d+(\.\d+)?$/)) {
			t = parseFloat(t, 10) / 100;
		}
		else {
			t = ModuleCoordinator.tForName(t);
		}

		jumpToExplore(t, transition);
	}
});

// Ensure browsers don't save the previous
// blacked out state when navigating.
$(window).unload(function () {
	$('.curtain').remove();
});

function jumpToExplore (t, transition) {
	Login.takeMeTo('explore');

	Utils.UI.curtainRise(function () {
		transition.resolve();
	});

	ModuleCoordinator.seek(t, transition);
}

// Globals

window.Login = Login;
window.Utils = Utils;
window.ModuleCoordinator = ModuleCoordinator;
window.Easing = require('./easing.js');
window.GLOBAL = GLOBAL;
window.$ = $;

// Polyfills

window.performance = window.performance || {
	now: Date.now
};

if (!GLOBAL.production) {
	window.mixpanel = {
		track: function () {},
	};
}


