"use strict";

/* Coordinator.js
 *
 * This is essentially an if/else block with
 * conditions that can be updated dynamically
 * to trigger behavior.
 *
 * When writing forms, often mutliple pieces of
 * data must be validated before submission is
 * acceptable. Because the conditions are fufilled
 * in a non-sequential manner accross a page, this 
 * is often implemented with global variables.
 *
 * This class produces an object that can register
 * several conditions and perform a callback when
 * they evaluate to true and another when they 
 * evaluate to false. For instance, if a user
 * enters valid data into all fields then 
 * screws one up. 
 *
 * This is essentially a type of event aggregator
 * that focuses on validation.
 * 
 * Dependencies: None (EMCAScript 5)
 *
 * Author: William Silversmith
 * Affiliation: Seung Lab, Brain and Cognitive Sciences Dept., MIT
 * Date: August 2013, adapted for browserify Sept. 2015, Nov. 2015
 */

/* Coordinator
 *
 * Creates a new Coordinator object.
 *
 * Required:
 *   [0] set { name1: true, name2: false, etc }, a way of initializing some conditions
 * 
 * Optional:
 *   [1] data: { name2: something, name2: something, etc } link some data to conditions
 *   [2] test: callback that returns a boolean based on status of registered conditions
 *      defaults to ANDing all of them.
 *
 * Returns: Coordinator object (use new)
 */
var Coordinator = function (set = {}, data = {}, test = module.exports.and) {
	var _this = this;

	if (typeof data === 'function') {
		test = data;
		data = {};
	}

	this.conds = {};
	this.data = {};

	Object.keys(set).forEach(function (cond) {
		_this.lazySet(cond, set[cond]);
	});

	this.failure = [];
	this.success = [];
	this.test = test;
	this.data = data;
};

Coordinator.prototype.ok = function (condition) {
	return this.conds[condition]();
};

/*  All callbacks provided to done and fail are of the following form:
 *
 *  function (conditions, data) { ... }
 *   
 *  Where:
 *	  conditions: { name1: bool, name2: bool, etc }
 *     data: { name1: somedata, name2: somedata, etc }
 */
Coordinator.prototype.done = function (fn) {
	this.success.push(fn);
	return this;
};

Coordinator.prototype.fail = function (fn) {
	this.failure.push(fn);
	return this;
};

Coordinator.prototype.always = function (fn) {
	this.success.push(fn);
	this.failure.push(fn);
	return this;
};

Coordinator.prototype.clearCallbacks = function () {
	this.success = [];
	this.failure = [];
	return this;
};

/* assess
*
* Peek at the test state without executing anything.
*
* Required: void
*    
* Returns: boolean result of test
*/
Coordinator.prototype.assess = function () {
	return this.test(this.conds, this.data);
};

/* execute
*
* Executes the test and appropriate callbacks.
*
* Required: void
*
* Returns: boolean result of test
*/
Coordinator.prototype.execute = function () {
	let _this = this; 

	if (_this.test(_this.conds, _this.data)) {
		_this.success.forEach(function (fn) {
			fn(_this.conds, _this.data);
		});

		return true;
	}
	else {
		_this.failure.forEach(function (fn) {
			fn(_this.conds, _this.data);
		});
		
		return false;
	}
};

/* set
*
* Add or reset the value of a registered condition and executes.
*
* Required:
*    [0] name: Name of the condition
*    [1] value: boolean
*
* Optional:
*    [2] data: Some sort of data structure to associate with 
*       this name. 
*
* Returns: void
*/
Coordinator.prototype.set = function (name, value, data) {
	this.lazySet(name, value, data);
	this.execute();

	return this;
};

/* lazySet
*
* Sets a condition.
*
* Parameters: same as set
*
* Returns: void
*/
Coordinator.prototype.lazySet = function (name, value, data) {
	value = value || false;

	if (typeof value !== 'function') {
		value = (function (v) { return v }).bind(this, value);
	}

	this.conds[name] = value;

	if (data !== undefined) {
		this.data[name] = data;
	}
	else {
		this.data[name] = null;
	}

	return this;
};

/* remove
*
* Deletes a condition and executes.
*
* Required: 
*   [0] name: Name of the condition 
*
* Returns: void
*/
Coordinator.prototype.remove = function (name) {
	this.lazyRemove(name);
	this.execute();

	return this;
};

/* lazyRemove
*
* Deletes a condition and does not execute.
*
* Required:
*   [0] name: The name of the condition
* Returns: void
*/
Coordinator.prototype.lazyRemove = function (name) {
	delete this.conds[name];
	delete this.data[name];

	return this;
};

/* The following functions are not part of the Coordinator object,
* however, they may be useful in constructing test functions.
*/

module.exports.Coordinator = function (set, data, test) {
	return new Coordinator(set, data, test);
};

/* and
*
* Simply ANDs every Coordinator together.
*
* Required:
*   [0] conds
*   [1] data
*
* Returns: boolean
*/
module.exports.and = function (conds, data) {
	var values = Object.keys(conds).map(function (key) { return conds[key]() });
	return values.reduce(function (a, b) { return a && b }, true);
};

 /* nand
*
* Simply nots the conjuntion of every Coordinator.
*
* Required: same as and
*
* Returns: boolean
*/
module.exports.nand = function () {
	return !module.exports.and.apply(this, arguments);
};

/* or
*
* Simply ORs every Coordinator together.
*
* Required:
*   [0] conds
*   [1] data
*
* Returns: boolean
*/
module.exports.or = function (conds, data) {
	var values = Object.keys(conds).map(function (key) { return conds[key]() });
	return values.reduce(function (a, b) { return a || b }, true);
};

/* nor
*
* Negation of: the disjunction of all the conditions.
*
* Required: same as or
*
* Returns: boolean
*/
module.exports.nor = function () {
	return !module.exports.or.apply(this, arguments);
};

/* xor
*
* Simply XORs every Coordinator together.
*
* Required:
*   [0] conds
*   [1] data
*
* Returns: boolean
*/
module.exports.xor = function (conds, data) {
	var values = Object.keys(conds).map(function (key) { return conds[key]() });
	return values.reduce(function (a, b) { return !(a && b) && (a || b) }, true);
}; 