let $ = require('jquery'),
	Utils = require('../clientjs/utils.js'),
	Easing = require('../clientjs/easing.js'),
	Synapse = require('./synapse.js'),
	ModuleCoordinator = require('../clientjs/controllers/ModuleCoordinator.js');

let Login = null;

// Thanks veryshare.us
var _social_networks = {
	facebook: { 
		name: 'Facebook', 
		url: 'https://www.facebook.com/sharer.php?u=#{URL}&t=#{TITLE}&s=#{DESCRIPTION}',
	},
	twitter: { 
		name: 'Twitter', 
		url: 'http://twitter.com/intent/tweet?source=sharethiscom&text=#{DESCRIPTION}&url=#{URL}',
	},
	tumblr: { 
		name: 'Tumblr', 
		url: 'http://www.tumblr.com/share?v=3&u=#{URL}&t=#{TITLE}&s=#{DESCRIPTION}',
	},
	//{ name: 'Reddit', url: 'https://www.facebook.com/sharer.php?u=#{URL}&t=#{TITLE}&s=#{DESCRIPTION}' },
	
	pinterest: { 
		name: 'Pinterest', 
		url: 'http://pinterest.com/pin/create/button/?url=#{URL}&media=http://#{URL}/#{MEDIA}&description=#{DESCRIPTION}', 
	},
	gplus: { 
		name: 'Google Plus', 
		url: 'https://plus.google.com/share?url=#{URL}', 
	},
	email: { 
		name: 'Email', 
		url: 'mailto:myfriends@example.com?subject=#{TITLE}&body=#{DESCRIPTION}',
	},
};

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
		let d = function (classes) { 
			return $('<div>').addClass(classes);
		};

		let container = d('header');
		let logo = d('logotype invisible');

		let fbshare = d('fb-share social');
		let tshare = d('twitter-share social');
		let emailshare = d('email-share social');

		let share_text = d('text').text("Share");

		let icon = d('before');

		// let share = d('icon share').append(share_text, icon, fbshare, tshare, emailshare);
		let share = d('icon share').append(share_text, icon, fbshare, emailshare);

		let login = d('tertiary login').text("Player Login");

		let register = $('<div>')
			.addClass('register')
			.append(
				d("icon"),
				d('content').text("Create Account")
			);

		container.append(logo, share, login, register);

		return {
			module: container,
			logo: logo,
			login: login,
			register: register,
			share: {
				container: share,
				fb: fbshare,
				twitter: tshare,
				email: emailshare,
				icon: icon,
				text: share_text,
			},
		};
	}

	attachShareEvents () {
		let _this = this;

		function activateshare () {
			_this.state.share_activated = !_this.state.share_activated;
			_this.render();
		}

		_this.view.share.text.ion('click', activateshare);
		_this.view.share.icon.ion('click', activateshare);

		_this.view.share.fb.ion('click', function () {
			shareOnSelectedNetwork({
				network: "facebook",
				title: "",
				description: "",
			});
		});

		_this.view.share.twitter.ion('click', function () {
			shareOnSelectedNetwork({
				network: "twitter",
				title: "",
				description: "",
			});
		});		

		_this.view.share.email.ion('click', function () {
			shareOnSelectedNetwork({
				network: "email",
				title: "",
				description: "",
			});
		});

		_this.view.logo.ion('click', function () {
			document.location.href = document.location.origin;
		});
	}

	attachRegisterEvents () {
		let _this = this;

		_this.view.register.ion('click', function () {
			mixpanel.track('play-now', {
				from: 'header',
			});
			
			Utils.UI.curtainFall(function () {
				document.location.href = 'https://eyewire.org/signup';
			})
		});

		_this.view.logo.ion('click', function () {
			let animation = $.Deferred();

			ModuleCoordinator.reset(animation);

			let transition = Login.takeMeTo('gateway', {
				msec: 1500,
				easing: Easing.sigmoidFactory(12),
			});

			_this.setMode('share', transition);

			transition
				.done(function () {
					animation.resolve();
				})
				.fail(function () {
					animation.reject();
				})
		});
	}

	attachEvents () {
		let _this = this;

		_this.view.share.icon.off('click');
		_this.view.register.off('click');

		if (this.mode === 'share') {
			_this.attachShareEvents();
		}
		else if (this.mode === 'register') {
			_this.attachRegisterEvents();
		}
	}

	setMode (mode, animation) {
		animation = animation || $.Deferred().resolve();

		let _this = this;

		let hidestate = this.hide;

		this.mode = mode;
		this.hide = true;
		this.render();

		animation.always(function () {
			_this.hide = hidestate;
			_this.render();
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

		this.attachEvents();
	}
}

function shareOnSelectedNetwork (args = {}) {
	var socialnetwork = _social_networks[args.network];
	
	var url = format_url(socialnetwork.url, {
		URL: 'https://eyewire.org/explore/',
		TITLE: args.title,
		DESCRIPTION: args.description,
		MEDIA: args.media,
	});

	// Too dangerous for prototype phase

	var win = window.open(url, '_blank');
	win.focus();
}

function format_url (url, fmt) {
	Object.keys(fmt).forEach(function (key) {
		fmt[key] = encodeURIComponent(fmt[key]);
	});

	return format(url, fmt);
}

function format (str, fmt) {
	Object.keys(fmt).forEach(function (key) {
		str = str.replace(new RegExp('#\{' + key + '\}', 'g'), fmt[key])
	});

	return str;
};

module.exports = Header;