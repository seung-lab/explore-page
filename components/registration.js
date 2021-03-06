var Coordinator = require('../clientjs/coordinator.js').Coordinator,
	Utils = require('../clientjs/utils.js'),
	Synapse = require('./synapse.js'),
	Validate = require('../clientjs/validate.js'),
	Password = require('../clientjs/password.js'),
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
			showing_password: false,
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
				_this.clearErrors();
			})
			.fail(function (conds, data) { 
				let fixtext = Validate.Registration.usernameFixtext(data.username);
				_this.view.username.addClass('error');
				_this.view.error.username
					.addClass('error')
					.text(fixtext);
			})
	}

	stageTwoCoordinator () {
		let _this = this; 

		return Coordinator(this.coordinator.conds, this.coordinator.data)
			.done(function () {
				_this.clearErrors();
			})
			.fail(function (conds, data) {
				_this.assignErrorMessages();
			})
	}

	clearErrors () {
		let _this = this; 
		
		Object.keys(_this.view.error).forEach(function (field) {
			_this.view[field].removeClass('error');
			_this.view.error[field].removeClass('error');
		});
	}

	attachEventListeners () {
		let _this = this;

		Login.bindResizeEvents('intake');

		_this.attachUsernameEvents();
		_this.attachEmailEvents();
		_this.attachPasswordEvents();

		_this.view.fb.ion('click', function () {
			GLOBAL.lastclick = 'facebook';
			Login.registrationFacebookSelectionHandler(_this.state.username, _this.coordinator);
		});

		let okfn = function () {
			let stage2 = function () {
				_this.state.stage = 2;
				_this.coordinator = _this.stageTwoCoordinator();
				_this.render();
			};

			_this.view.loading.addClass('onscreen').removeClass('error');
			Validate.Registration.username(_this.state.username, _this.coordinator)
				.done(function () {
					if (!_this.coordinator.execute()) {
						_this.view.username.focus();
					}
					else {
						stage2();	
					}
				})
				.fail(function (reason) {
					_this.view.loading.addClass('error');
					// debugging
					// if (reason === 'network-failure') {
					// 	stage2();
					// }
				})
				.always(function () {
					_this.view.loading.removeClass('onscreen');
				});
		};

		if (this.state.stage === 2) {
			okfn = function () {
				_this.register();
			};
		}
		
		_this.view.ok.ion('click', okfn);
		_this.view.module.ion('keydown.registration', function (evt) {
			if (evt.keyCode === 13) {
				if (GLOBAL.lastclick === 'facebook') {
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
				var valid = Password.quickValidatePassword(pval(), uval(), _this.coordinator);
				if (valid) {
					_this.coordinator.execute();
				}
			})
			.ion('keydown.state change.state input.state', function (evt) {
				_this.state.password = pval();
				_this.adjustPasswordMeter();
			})
			.ion('blur.validation', function () {
				Password.quickValidatePasswordNoLength(pval(), uval(), _this.coordinator);
				_this.coordinator.execute();
			})
			.ion('keyup.validation keypress.validation', function () {
				var valid = Password.quickValidatePassword(pval(), uval(), _this.coordinator);

				if (valid) {
					_this.coordinator.execute();
				}
			})
			.ithinking({ idle: 1500 }, function () {
				Password.quickValidatePassword(pval(), uval(), _this.coordinator);
				_this.coordinator.execute();
			});

		_this.view.password_show.ion('click', function () {
			
			if (_this.state.showing_password) {
				_this.view.password.attr('type', 'password');
				_this.view.password_show.removeClass('showing');
			}
			else {
				_this.view.password.attr('type', 'text');
				_this.view.password_show.addClass('showing');
			}

			_this.state.showing_password = !_this.state.showing_password;
		});
	}

	attachEmailEvents () {
		let _this = this;

		let val = function () {
			return _this.view.email.val().trim();
		};

		_this.view.email
			.ithinking({ idle: 2000 }, function () {
				Validate.Registration.email(val(), _this.coordinator);
				_this.coordinator.execute();
			})
			.ion('keydown.state', function () {
				_this.state.email = val().trim();
			})
			.ion('focus.validation keyup.validation keypress.validation', function () {
				Validate.Registration.emailNoLength(val(), _this.coordinator)
					.done(function () {
						_this.coordinator.execute();	
					});
			})
			.ion('blur.validation', Utils.UI.trim(function () {
				Validate.Registration.emailNoLength(val(), _this.coordinator);
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
				Validate.Registration.usernameNoLength(val(), _this.coordinator);
			})
			.ion('keydown.state input.state', function () {
				_this.state.username = val();
				_this.adjustPasswordMeter();
			})
			.ion('keyup.validation keypress.validation', function () {
				Validate.Registration.usernameNoLengthInstant(val(), _this.coordinator);
			})
			.ion('focus.adjust', Utils.UI.trim())
			.ion('blur.validation', Utils.UI.trim(function () {
				Validate.Registration.usernameNoLength(val(), _this.coordinator);
			}));
	}

	adjustPasswordMeter () {
		let ratio = Password.qualifyPassword(
			this.state.password,
			this.state.username, 
			this.coordinator
		);

		ratio = Utils.clamp(ratio * 100, 0, 100);
		this.view.password_meter.find('.strength').css('width',  `${ratio}%`);
	}

	assignErrorMessages () {
		let _this = this;

		let stack = [
			{
				fixtextfn: Validate.Registration.usernameFixtext,
				condition: 'username',
			},
			{
				fixtextfn: Validate.Registration.emailFixtext,
				condition: 'email',
			},
			{
				fixtextfn: Validate.Registration.passwordFixtext,
				condition: 'password',
			}
		];

		let first = true;

		for (let i = 0; i < stack.length; i++) {
			let condition = stack[i].condition;
			let fixtextfn = stack[i].fixtextfn;

			let field = _this.view[condition],
				msg = _this.view.error[condition];

			if (!_this.coordinator.ok(condition)) {
				field.addClass('error');
				
				if (first) {
					msg
						.addClass('error')
						.text(
							fixtextfn(_this.coordinator.data[condition])
						);
					
					first = false;
				}
				else {
					msg.removeClass('error');
				}
			}
			else {
				if (_this.state[condition] === '') {
					first = false; // prevents flickering cascades
				}

				field.removeClass('error');
				msg.removeClass('error').text("");
			}
		}
	}

	/* focusOnFirstError
	 *
	 * Moves the focus to the first error in the registration
	 * workflow.
	 *
	 * Returns: void
	 */
	focusOnFirstError () {
		let _this = this;

		let order = ['username', 'email', 'password' ];

		for (let i = 0; i < order.length; i++) {
			let key = order[i];

			let elem = _this.view[key];

			if (_this.coordinator.ok(key)) {
				continue;
			}

			return elem
					.one('focus', function (evt) {
						evt.stopImmediatePropagation();
					})	
					.focus()
					.thinking('cancel');
		}

		return null;
	}

	generateView () {
		let _this = this;

		let container = $("<div>").addClass('registration column');		

		let logo = $('<img>')
			.addClass('logo')
			.attr({
				src: GLOBAL.base_url + "/images/ew.svg",
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

		let fieldfn = function (name, type) {
			return $('<input>').attr({
				placeholder: name,
				type: type || "text",
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


		let password = fieldfn('Password', 'password'),
			passworderror = errormsg();

		let pwshow = $('<div>').addClass('rlabel').text("Show");

		let pwmeter = $('<div>')
			.addClass('password-meter')
			.append(
				$('<div>').addClass('bar').append(
					$('<div>').addClass('strength')
				),
				$('<div>').addClass('label').text("Strength"),
				pwshow
			);

		let fb = $('<div>')
			.addClass('fb-connect')
			.text("Facebook Connect");
		let fberror = errormsg();

		let loading = $('<div>').addClass('spinny');

		col.append(
			username,
			usernameerror,
			email,
			emailerror,
			password,
			passworderror,
			pwmeter,
			okbtn,
			loading
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
			password_show: pwshow,
			location: location,
			progress: progress,
			ok: okbtn,
			fb: fb,
			loading: loading,
			error: {
				username: usernameerror,
				email: emailerror,
				password: passworderror,
				fb: fberror,
			},
		};
	}

	register () {
		let _this = this;

		_this.view.loading
			.removeClass('error')
			.addClass('onscreen');

		Login.standardRegistration({
			username: this.state.username,
			email: this.state.email,
			password: this.state.password,
		})
		.done(function () {
			Login.continueOn();
		})
		.fail(function (response) {
			['username', 'password', 'email'].forEach(function (key) {
				if (response.reasons[key]) {
					_this.coordinator.lazySet(key, false, response.reasons[key]);
				}
			});
			
			_this.coordinator.execute();

			_this.focusOnFirstError();

			if (response.reasons['network-failure']) {
				_this.view.loading.addClass('error');
			}
		})
		.always(function () {
			_this.view.loading.removeClass('onscreen');
		})
	}

	focusOnField (field) {
		this.view[field].one('focus', function (evt) {
			evt.stopImmediatePropagation();
		})
		.focus()
	}

	afterEnter (transition) {
		let _this = this;
		this.render();

		transition.done(function () {
			_this.focusOnField('username');
		})
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


