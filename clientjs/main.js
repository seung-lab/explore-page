

var $ = require('jquery');

require('./jquery-extra.js');
require('./jquery-animation.js');
require('./thinking.js');

var Login = require('./login.js');

var _intakectrl = new Login.IntakeController();

$(document).ready(function () {
	Login.initialize();
	
	_intakectrl.playIntro();

	Login.bindResizeEvents('gateway');
});


// Globals

window.Login = Login;
window.ModuleCoordinator = require('./controllers/ModuleCoordinator.js');
window.Easing = require('./easing.js');
window.$ = $;