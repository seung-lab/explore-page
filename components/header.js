let $ = require('jquery'),
	utils = require('../clientjs/utils.js'),
	Easing = require('../clientjs/easing.js'),
	Synapse = require('./synapse.js');

class Header extends Synapse {
	constructor(args = {}) {
		super(args);

		this.view = this.generateView();

		this.mode = args.mode || 'share';
	}

	generateView () {
		let container = $('<div>').addClass('header invisible');
		let logo = $('<div>').addClass('logotype');

		let share = $('<div>').addClass('icon share');
		let login = $('<div>').addClass('icon login');
		let register = $('<div>').addClass('icon register');

		container.append(logo, share, login, register);

		return {
			module: container,
			logo: logo,
			login: login,
			register: register,
			share: share,
		};
	}

	afterEnter () {
		let _this = this;
		setTimeout(function () {
			_this.view.module.removeClass('invisible');
		}, 5000);
	}

	render () {
		let _this = this;

		[ 'login', 'register', 'share' ].forEach(function (icon) {
			_this.view[icon].removeClass('visible');
		});

		_this.view[_this.mode].addClass('visible');		
	}
}

module.exports = Header;