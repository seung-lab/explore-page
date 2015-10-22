
let React = require('react/addons'),
	$ = require('../zepto.js'),
	utils = require('../utils.js'),
	AmazingView = require('../../components/modules/amazing.jsx')


module.exports = function (args) {
	args = args || {};

	this.t = 0,
	this.name = 'Amazing',
	this.begin = null,
	this.duration = utils.nvl(args.duration, 1),
	this.parent = args.parent,
	this.selector = $(args.selector)[0];

	this.entry = function (from) {};
	this.exit = function (from) {};
	this.seek = function (t) {
		this.t = utils.clamp(t, 0, 1);

		this.parent.update_t(this.name, this.t);

		this.render();
	};

	this.view = function () {
		return AmazingView;
	};
};


