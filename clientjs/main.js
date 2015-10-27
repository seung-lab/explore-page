

var $ = require('jquery');
var login = require('./login.js');

require('./jquery-extra.js');
require('./jquery-animation.js');

var _intakectrl = new Login.IntakeController();

$(document).ready(function () {
	Login.bindReact();
	_intakectrl.playIntro();
});


// Globals

window.ModuleCoordinator = require('./controllers/ModuleCoordinator.js');
window.easing = require('./easing.js');