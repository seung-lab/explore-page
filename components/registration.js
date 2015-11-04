var Coordinator = require('../clientjs/coordinator.js').Coordinator,
	Utils = require('../clientjs/utils.js'),
	Synapse = require('./synapse.js'),
	PasswordUtils = require('../clientjs/PasswordUtils.js'),
	GLOBAL = require('../clientjs/GLOBAL.js');

let Login; // avoid circular reference

class Registration extends Synapse {
	constructor (args = {}) {
		super(args);

		this.view = this.generateView();

		Login = args.login;

		this.coordinator = this.createCoordinator();

		this.state = {
			stage: 1,
			username: "",
			email: "",
			password: "",
		};
	}

	createCoordinator () {
		let _this = this;

		return Coordinator({ 
				username: true, 
				password: true, 
				email: true,
			}, function (conds) { 
				return !!conds.username;
			})
			.done(function (conds) {
				_this.view.username.removeClass('error');
				_this.view.error.username.removeClass('error');
			})
			.fail(function (conds, data) { 
				let fixtext = Login.registrationUsernameFixtext(data.username);
				_this.view.username.addClass('error');
				_this.view.error.username
					.addClass('error')
					.text(fixtext);
			})
	}

	stageTwoCoordinator () {

	}

	attachEventListeners () {
		let _this = this;

		Login.bindResizeEvents('intake');

		_this.attachUsernameEvents();
		_this.attachEmailEvents();
		_this.attachPasswordEvents();

		let okfn = function () {
			Login.validateUsername(_this.state.username, _this.coordinator)
				.done(function () {
					if (!playcoordinator.execute()) {
						_this.view.username.focus();
					}
					else {
						_this.state.stage = 2;
						_this.render();
					}
				})
		};

		if (this.state.stage === 2) {
			okfn = function () {
				_this.register();
			};
		}
		
		_this.view.ok.ion('click', okfn);
		_this.view.module.ion('keydown.registration', function (evt) {
			if (evt.keyCode === 13) {
				if (GLOBAL.registration.lastclick === 'facebook') {
					Login.registrationFacebookSelectionHandler(_this.state.username, _this.coordinator);	
				}
				else {
					okfn();	
				}
			}
		});
	}

	attachPasswordEvents () {
		let _this = this;

		let uval = function () {
			return _this.view.username.val().trim();
		};

		let pval = function () {
			return _this.view.password.val(); // don't trim passwords
		};

		_this.view.password
			.ion('focus.validation', function () {
				var valid = PasswordUtils.quickValidatePassword(pval(), uval(), _this.coordinator);
				if (valid) {
					_this.coordinator.execute();
				}
			})
			.ion('keydown.state', function () {
				_this.state.password = pval();
			})
			.ion('blur.validation', function () {
				PasswordUtils.quickValidatePasswordNoLength(pval(), uval(), _this.coordinator);
				_this.coordinator.execute();
			})
			.ion('keyup.validation keypress.validation', function () {
				PasswordUtils.adjustPasswordMeter({
					meter: _this.view.password_meter,
					password: pval(),
					username: uval(), 
					coordinator: _this.coordinator,
				});
				var valid = PasswordUtils.quickValidatePassword(pval(), uval(), _this.coordinator);

				if (valid) {
					_this.coordinator.execute();
				}
			})
			.ithinking({ idle: 1500 }, function () {
				PasswordUtils.quickValidatePassword(pval(), uval(), _this.coordinator);
				_this.coordinator.execute();
			});
	}

	attachEmailEvents () {
		let _this = this;

		let val = function () {
			return _this.view.email.val().trim();
		};

		_this.view.email
			.ithinking({ idle: 2000 }, function () {
				Login.validateEmail(val(), _this.coordinator);
				_this.coordinator.execute();
			})
			.ion('keydown.state', function () {
				_this.state.email = val().trim();
			})
			.ion('focus.validation keyup.validation keypress.validation', function () {
				Login.validateEmailNoLength(val(), _this.coordinator)
					.done(function () {
						_this.coordinator.execute();	
					});
			})
			.ion('blur.validation', Utils.UI.trim(function () {
				Login.validateEmailNoLength(val(), _this.coordinator);
				_this.coordinator.execute();
			}));
	}

	attachUsernameEvents () {
		let _this = this; 

		let val = function () {
			return _this.view.username.val().trim();
		};

		_this.view.username
			.ithinking({ idle: 750 }, function () {
				Login.validateUsernameNoLength(val(), _this.coordinator);
			})
			.ion('keydown.state', function () {
				_this.state.username = _this.view.username.val();
			})
			.ion('keyup.validation keypress.validation', function () {
				Login.quickValidateUsernameNoLength(val(), _this.coordinator);
			})
			.ion('focus.adjust', Utils.UI.trim())
			.ion('blur.validation', Utils.UI.trim(function () {
				Login.validateUsernameNoLength(val(), _this.coordinator);
			}));
	}

	generateView () {
		let _this = this;

		let container = $("<div>").addClass('registration column');		

		let logo = $('<img>')
			.addClass('logo')
			.attr({
				src: "/images/ew.svg",
				alt: "EyeWire Logo",
			});

		let location = $('<div>')
			.addClass('location-text');

		let progress = $('<div>')
			.addClass('progress-indicator');

		let col = $('<div>').addClass('column');

		let okbtn = $('<button>')
			.addClass('primary')
			.text("OK");

		let fieldfn = function (name) {
			return $('<input>').attr({
				placeholder: name,
				type: "text",
			})
			.addClass('field ' + name.toLowerCase());
		};

		let errormsg = function () {
			return $('<div>').addClass('errormsg');
		};

		let username = fieldfn('Username'),
			usernameerror = errormsg();

		let email = fieldfn('Email'),
			emailerror = errormsg();


		let password = fieldfn('Password'),
			passworderror = errormsg();

		let pwmeter = $('<div>').addClass('password-strength');

		let fb = $('<div>')
			.addClass('fb-connect tertiary')
			.text("Facebook Connect");
		let fberror = errormsg();

		col.append(
			username,
			usernameerror,
			email,
			emailerror,
			password,
			passworderror,
			pwmeter,
			okbtn
		);

		container.append(
			logo,
			location,
			progress,
			col,
			fb,
			fberror
		);

		return {
			module: container,
			username: username,
			email: email,
			password: password,
			password_meter: pwmeter,
			location: location,
			progress: progress,
			ok: okbtn,
			error: {
				username: usernameerror,
				email: emailerror,
				password: passworderror,
				fb: fberror,
			},
		};
	}

	register () {
		Login.standardRegistration({
			username: this.state.username,
			email: this.state.email,
			password: this.state.password,
		})
		.done(function () {
			Login.continueOn();
		})
		.fail(function (response) {
			if (!response) {
				return;
			}

			['username', 'password', 'email'].forEach(function (key) {
				if (response.reasons[key]) {
					this.state.coordinator.lazySet(key, false, response.reasons[key]);
				}
			});
			
			this.state.coordinator.execute();
		})
	}

	afterEnter () {
		this.render();
	}

	render () {
		let _this = this;

		let stage = this.state.stage === 1
			? 'one'
			: 'two';

		_this.view.module
			.removeClass('one two')
			.addClass(stage);

		this.attachEventListeners();

		if (_this.state.stage === 1) {
			_this.view.location.text("Select Username");
		}
		else {
			_this.view.location.text("Complete Registration");
		}

	}
}

module.exports = Registration;


