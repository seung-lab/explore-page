
let React = require('react/addons'),
	utils = require('../utils.js'),
	Timeline = require('../../components/timeline.jsx'),
	AmazingModule = require('./amazing.jsx');

let _modules = [],
	_normalization = 1,
	_timeline = null,
	_t = 0;

let TimelineController = {};

TimelineController.initialize = function () {
	TimelineController.setModules([
		(new AmazingModule({
			parent: TimelineController,
		}))
	]);
};

TimelineController.setModules = function (modules) {
	_modules = modules || [];
	_normalization = computeNormalization(modules);

	let begin = 0;
	_modules.forEach(function (module) {
		module.begin = begin;
		begin += module.duration;
	});
};

TimelineController.currentModule = function () {
	return TimelineController.moduleAt(_t);
};

TimelineController.moduleAt = function (t) {
	if (!_modules.length) {
		throw new Error("No modules were defined for this timeline.");
	}

	let tau = 0,
		current = _modules[0];

	for (let i = 0; i < _modules.length; i++) {
		if (tau >= t) {
			return current;
		}

		_modules[i].duration = _modules[i].duration || 1;

		tau += _modules[i].duration / _normalization;
	}

	if (tau >= t) {
		return _modules[_modules.length - 1];
	}

	throw new Error(`Something got out of sync. t = {t}, tau = {tau}, modules: {modules.length}`);
};

TimelineController.update_t = function (module, sub_t) {
	var current = TimelineController.currentModule();

	if (module == current) {
		_t = (current.begin + (sub_t * current.duration)) / _normalization; 
	}


};

TimelineController.t = function (tee) {
	if (tee !== undefined) {
		_t = utils.clamp(tee, 0, 1);
	}

	return _t;
};

TimelineController.render = function () {
	let mod = TimelineController.currentModule();
	let t_mod = (_t - mod.begin) / mod.duration;

	let Module = mod.view();

	React.render(<div className="fullscreen column">
		<Module t={t_mod} />
		<Timeline t={_t} />
	</div>, document.getElementById('explore'));
}


function computeNormalization (modules) {
	return modules.map(function (module) {
		return module.duration;
	})
	.reduce(function (a, b) {
		return a + b;
	}, 0);
}

module.exports = TimelineController;
