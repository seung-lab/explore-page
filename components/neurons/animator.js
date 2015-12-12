

// A class for an animation controller

// Contructor: frameCount --> Duration
"use strict";

let $ = require('jquery');


new Animator({
	step: 1 / frames,

});


function Animator (args = {}) {
	
	this.step = args.step;
	this.progress = args.progress || 0;

	let _this = this;
	let _output;

	let minus_promise = $.Deferred();	
	let plus_promise = $.Deferred();

	this.minus = function () {

		// If we are about to countdown, set our gloabl progress counter to 1
		minus_promise.resolve();
		minus_promise.done(function() {
			_this.progress = 1;
			plus_promise.reject();
			plus_promise = $.Deferred();
		});

		if (_this.progress >= 0) {
			_this.progress -= _this.step; 
			output = _this.progress;
		}

		return output;
	}

	this.plus = function () {

		// If we are about to count, set our gloabl progress counter to 0
		plus_promise.resolve();
		plus_promise.done(function() {
			_this.progress = 0;
			minus_promise = $.Deferred();
		});

		if (_this.progress <= 1) {
			_this.progress += _this.step; 
			output = _this.progress;
		}

		return output;
	}

}

module.exports = Animator;