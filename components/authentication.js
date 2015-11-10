var Coordinator = require('../clientjs/coordinator.js').Coordinator,
	Utils = require('../clientjs/utils.js'),
	Synapse = require('./synapse.js'),
	Validate = require('../clientjs/validate.js'),
	Password = require('../clientjs/password.js'),
	GLOBAL = require('../clientjs/GLOBAL.js');

let Login; // avoid circular reference

class Authentication extends Synapse {
	constructor (args = {}) {
		super(args);

		this.view = this.generateView();

		Login = args.login;

		this.coordinator = this.createCoordinator();

		this.state = {
			showing_password: false,
			username: "",
			password: "",
		};
	}

	createCoordinator () {
		let _this = this;

		return Coordinator({
				username: true, 
				password: true,
			})
			.done(function () {
				_this.clearErrors();
			})
			.fail(function (conds, data) {
				_this.assignErrorMessages();
			});
	}

	assignErrorMessages () {
		let _this = this;

		let stack = [
			{
				fixtextfn: Validate.Login.usernameFixtext,
				condition: 'username',
			},
			{
				fixtextfn: Validate.Login.passwordFixtext,
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
		_this.attachPasswordEvents();
		_this.attachFacebookEvents();

		let okfn = function () {
			_this.authenticate();
		};
		
		_this.view.ok.ion('click', okfn);
		_this.view.module.ion('keydown.login', function (evt) {
			if (evt.keyCode === 13) {
				if (GLOBAL.lastclick === 'facebook') {
					Login.loginFacebookSelectionHandler(_this.state.username, _this.coordinator);	
				}
				else {
					okfn();	
				}
			}
		});
	}

	attachFacebookEvents () {
		let _this = this;

		_this.view.fb.ion('click', function () {
			GLOBAL.lastclick = 'facebook';
			Login.loginFacebookSelectionHandler(_this.state.username, _this.coordinator);
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

	attachUsernameEvents () {
		let _this = this; 

		let val = function () {
			return _this.view.username.val().trim();
		};

		_this.view.username
			.ithinking({ idle: 750 }, function () {
				Validate.Login.usernameNoLength(val(), _this.coordinator);
			})
			.ion('keydown.state input.state', function () {
				_this.state.username = val();
				_this.adjustPasswordMeter();
			})
			.ion('keyup.validation keypress.validation', function () {
				Validate.Login.usernameNoLengthInstant(val(), _this.coordinator);
			})
			.ion('focus.adjust', Utils.UI.trim())
			.ion('blur.validation', Utils.UI.trim(function () {
				Validate.Login.usernameNoLength(val(), _this.coordinator);
			}));
	}

	assignErrorMessages () {
		let _this = this;

		let stack = [
			{
				fixtextfn: Validate.Login.usernameFixtext,
				condition: 'username',
			},
			{
				fixtextfn: Validate.Login.passwordFixtext,
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

		let container = $("<div>").addClass('authentication column');		

		let logo = $('<img>')
			.addClass('logo')
			.attr({
				src: "/images/ew.svg",
				alt: "EyeWire Logo",
			});

		let location = $('<div>')
			.addClass('location-text');

		let col = $('<div>').addClass('column');

		let okbtn = $('<button>')
			.addClass('primary')
			.text("PLAY");

		let fieldfn = function (placeholder, klass, type) {
			return $('<input>').attr({
				placeholder: placeholder,
				type: type || "text",
			})
			.addClass('field ' + klass);
		};

		let errormsg = function () {
			return $('<div>').addClass('errormsg');
		};

		let username = fieldfn('Username or Email', 'username'),
			usernameerror = errormsg();

		let password = fieldfn('Password', 'password', 'password'),
			passworderror = errormsg();

		let forgot = $('<div>').addClass('rlabel').text("Forgot?");

		let pwshow = $('<div>').addClass('rlabel').text("Show");

		let fb = $('<div>')
			.addClass('fb-connect tertiary')
			.text("Facebook Connect");
		let fberror = errormsg();

		col.append(
			username,
			usernameerror,
			password,
			passworderror,
			okbtn
		);

		container.append(
			logo,
			location,
			col,
			fb,
			fberror
		);

		return {
			module: container,
			username: username,
			password: password,
			location: location,
			ok: okbtn,
			fb: fb,
			error: {
				username: usernameerror,
				password: passworderror,
				fb: fberror,
			},
		};
	}

	authenticate () {
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
	}
}

module.exports = Authentication;


