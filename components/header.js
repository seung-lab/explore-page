let $ = require('jquery'),
	Utils = require('../clientjs/utils.js'),
	Easing = require('../clientjs/easing.js'),
	Synapse = require('./synapse.js'),
	ModuleCoordinator = require('../clientjs/controllers/ModuleCoordinator.js');

let Login = null;

class Header extends Synapse {
	constructor(args = {}) {
		super(args);

		Login = args.login;

		this.view = this.generateView();

		this.mode = args.mode || 'share';
		this.hide = false;

		this.state = {
			share_activated: false,
			exploring: false,
		};
	}

	generateView () {
		let container = $('<div>').addClass('header');
		let logo = $('<div>').addClass('logotype invisible');

		let share = $('<div>').addClass('icon share');
		let before = $('<div>').addClass('before');
		let permalink = $("<div>").addClass('permalink');
		let at_moment = $("<input>").attr('type', 'checkbox');

		share.append(before, permalink);//, at_moment)

		let login = $('<div>')
			.addClass('tertiary login')
			.text("Player Login");

		let register = $('<div>')
			.addClass('register')
			.append(
				$("<div>").addClass("icon"),
				$("<div>")
					.text("Create new account")
					.addClass("content")
			);

		container.append(logo, share, login, register);

		return {
			module: container,
			logo: logo,
			login: login,
			register: register,
			share: {
				container: share,
				icon: before,
				permalink: permalink,
				at_moment: at_moment,
			},
		};
	}

	attachEventListeners () {
		let _this = this;

		_this.view.logo.ion('click', function () {
			document.location.href = document.location.origin;
		});

		_this.view.share.icon.ion('click', function () {
			_this.state.share_activated = !_this.state.share_activated;
			_this.render();
		});

		_this.view.share.at_moment.ion('click', function () {
			_this.render();
		});

		_this.view.register.ion('click', function () {
			Utils.UI.curtainFall(function () {
				document.location.href = 'https://eyewire.org/signup';
			})
		});
	}

	afterEnter (transition) {
		let _this = this;
		
		transition.done(function () {
			_this.view.module.removeClass('invisible');
		});
	}

	renderShare () {
		let _this = this;

		_this.view.share.container.addClass('visible');

		let share_url = `${document.location.href}`;
		if (_this.view.share.at_moment.is(":checked")) {
			let t = Math.floor(ModuleCoordinator.timeline.t * 100);
			share_url = `${document.location.href}?t=${t}`; 
		}

		_this.view.share.permalink.text(share_url);

		_this.view.share.container.removeClass('activated');
		if (_this.state.share_activated) {
			_this.view.share.container.addClass('activated');
		}
	}

	render () {
		let _this = this;

		this.view.module.removeClass('invisible');
		if (this.hide) {
			this.view.module.addClass('invisible');
			return;
		}

		this.view.logo.removeClass('invisible');
		if (Utils.isMobile() && !this.exploring && this.mode === 'share') {
			this.view.logo.addClass("invisible")
		}

		[ 'login', 'register' ].forEach(function (icon) {
			_this.view[icon].removeClass('visible');
		});

		_this.view.share.container.removeClass('visible');

		if (_this.mode === 'login') {
			_this.view.login.addClass('visible');
		}
		else if (_this.mode === 'register') {
			_this.view.register.addClass('visible');	
		}
		else {
			_this.renderShare();
		}

		this.attachEventListeners();
	}
}

module.exports = Header;