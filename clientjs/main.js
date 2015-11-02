

var $ = require('jquery');
var login = require('./login.js');

require('./jquery-extra.js');
require('./jquery-animation.js');

var _intakectrl = new Login.IntakeController();

$(document).ready(function () {
	Login.bindReact();
	_intakectrl.playIntro();

	Login.bindResizeEvents('gateway');
});


// Globals

window.Login = Login;
window.ModuleCoordinator = require('./controllers/ModuleCoordinator.js');
window.Easing = require('./easing.js');
window.$ = $;