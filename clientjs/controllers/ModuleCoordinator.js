
let utils = require('../utils.js'),
	$ = require('jquery'),
	Timeline = require('../../components/timeline.js'),
	AmazingModule = require('../../components/modules/amazing.js');

let _t = 0;

let ModuleCoordinator = {
	modules: [],
	normalization: 1,
	timeline: null,
};

ModuleCoordinator.initialize = function () {
	let anchor = $('#explore');

	function moduleFactory(module, duration) {
		return new module({
			parent: ModuleCoordinator,
			anchor: anchor,
			duration: duration,
		})
	}

	ModuleCoordinator.setModules([
		moduleFactory(AmazingModule),
	]);

	ModuleCoordinator.timeline = new Timeline({
		parent: ModuleCoordinator,
		anchor: anchor,
	});

	ModuleCoordinator.timeline.enter();
};

ModuleCoordinator.setModules = function (modules) {
	ModuleCoordinator.modules = modules || [];
	ModuleCoordinator.normalization = computeNormalization(modules);

	let begin = 0;
	ModuleCoordinator.modules.forEach(function (module) {
		module.begin = begin;
		begin += module.duration;
	});
};

ModuleCoordinator.currentModule = function () {
	return ModuleCoordinator.moduleAt(_t);
};

ModuleCoordinator.moduleAt = function (t) {
	let modules = ModuleCoordinator.modules;

	if (!modules.length) {
		throw new Error("No modules were defined for this timeline.");
	}

	let tau = 0,
		current = modules[0];

	for (let i = 0; i < modules.length; i++) {
		if (tau >= t) {
			return current;
		}

		modules[i].duration = modules[i].duration || 1;

		tau += modules[i].duration / ModuleCoordinator.normalization;
	}

	if (tau >= t) {
		return modules[modules.length - 1];
	}

	throw new Error(`Something got out of sync. t = ${t}, tau = ${tau}, modules: ${modules.length}`);
};

ModuleCoordinator.sub_t_update = function (module_name, sub_t) {
	var current = ModuleCoordinator.currentModule();

	if (module_name == current.name) {
		_t = (current.begin + (sub_t * current.duration)) / ModuleCoordinator.normalization; 
	}

	ModuleCoordinator.timeline.seek(_t);
};

ModuleCoordinator.t = function (tee) {
	if (tee !== undefined) {
		ModuleCoordinator.seek(_t);
	}

	return _t;
};

ModuleCoordinator.seek = function (t) {
	let prev_t = _t;
	_t = t;
	return ModuleCoordinator.render(prev_t, t);
};

ModuleCoordinator.render = function (prev_t, t) {
	prev_t = utils.nvl(prev_t, _t);
	t = utils.nvl(t, _t);

	let prev_mod = ModuleCoordinator.moduleAt(prev_t);
	let current_mod = ModuleCoordinator.moduleAt(t);

	let entry_promise = $.Deferred().resolve();

	if (prev_mod !== current_mod) {
		entry_promise = prev_mod.exit().done(function () {
			current_mod.enter();
		})
	}
	else if (!current_mod.visible) {
		current_mod.enter();
	}

	let t_mod = (t - current_mod.begin) / current_mod.duration;

	current_mod.seek(t_mod);

	ModuleCoordinator.timeline.seek(t);
}


function computeNormalization (modules) {
	return modules.map(function (module) {
		return module.duration;
	})
	.reduce(function (a, b) {
		return a + b;
	}, 0);
}

module.exports = ModuleCoordinator;
