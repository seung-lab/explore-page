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
		let login = $('<div>')
			.addClass('tertiary login')
			.text("Player Login");

		let register = $('<div>')
			.addClass('tertiary register')
			.text("Create New Account");

		container.append(logo, share, login, register);

		return {
			module: container,
			logo: logo,
			login: login,
			register: register,
			share: share,
		};
	}

	attachEventListeners () {
		let _this = this;

		_this.view.login.ion('click', function () {

		});
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

		if (_this.mode === 'login') {
			_this.view.register.addClass('visible');
		}
		else if (_this.mode === 'register') {
			_this.view.login.addClass('visible');	
		}
		else {
			_this.view.share.addClass('visible');		
		}		
	}
}

module.exports = Header;