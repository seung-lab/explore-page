let $ = require('jquery'),
	utils = require('../clientjs/utils.js'),
	Easing = require('../clientjs/easing.js'),
	Synapse = require('./synapse.js');

class Header extends Synapse {
	constructor(args = {}) {
		super(args);

		this.view = this.generateView();
	}

	generateView () {
		let container = $('<div>').addClass('header invisible');
		let logo = $('<div>').addClass('logotype');

		let share = $('<div>').addClass('icon share');

		container.append(logo, share);

		return {
			module: container,
			logo: logo,
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
		
	}
}

module.exports = Header;