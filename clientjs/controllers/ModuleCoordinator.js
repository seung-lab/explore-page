
let utils = require('../utils.js'),
	$ = require('jquery'),
	Easing = require('../easing.js'),
	Timeline = require('../../components/timeline.js'),
	Amazing = require('../../components/modules/amazing.js'),
	Galileo = require('../../components/modules/galileo.js');

let _t = 0;

let ModuleCoordinator = {
	modules: [],
	timeline: null,
	container: null,
	transition: $.Deferred(),
};

ModuleCoordinator.initialize = function () {
	let anchor = $('#explore');

	function moduleFactory(module, duration) {
		return new module({
			parent: ModuleCoordinator,
			anchor: anchor,
			duration: duration,
			mobile: true,
		})
	}

	ModuleCoordinator.setModules([
		moduleFactory(Amazing),
		moduleFactory(Galileo)
	]);

	ModuleCoordinator.timeline = new Timeline({
		parent: ModuleCoordinator,
		anchor: anchor,
	});

	ModuleCoordinator.container = anchor;

	ModuleCoordinator.timeline.enter();

	ModuleCoordinator.initHotkeys();
};


ModuleCoordinator.initHotkeys = function () {
	$(document).ion('keyup', function (evt) {
		let key = evt.keyCode;
		if (key === 39 || key === 40) { // right or down key
			ModuleCoordinator.next();
		}
		else if (key === 37 || key == 38) { // left or up key
			ModuleCoordinator.previous();
		}
	});
};

ModuleCoordinator.previous = function () {
	let mod = ModuleCoordinator.currentModule();
	return mod.previous();	
};

ModuleCoordinator.next = function () {
	let mod = ModuleCoordinator.currentModule();
	return mod.next();
};

ModuleCoordinator.setModules = function (modules) {
	ModuleCoordinator.modules = modules || [];
	let normalization = computeNormalization(modules);

	let begin = 0;
	ModuleCoordinator.modules.forEach(function (module) {
		module.duration /= normalization;

		module.begin = begin;
		begin += module.duration;
	});
};

ModuleCoordinator.currentModule = function () {
	return ModuleCoordinator.moduleAt(_t);
};


ModuleCoordinator.nextModule = function () {
	let current_module = ModuleCoordinator.currentModule();

	let modules = ModuleCoordinator.modules;

	let boundary = current_module.begin;
		boundary += current_module.duration;

	for (let i = 0; i < modules.length; i++) {
		if (modules[i].begin >= boundary) {
			return modules[i];
		}
	}

	return modules[0];
};

ModuleCoordinator.previousModule = function () {
	let current_module = ModuleCoordinator.currentModule();

	let modules = ModuleCoordinator.modules;

	let prev = modules[0];
	for (let i = 0; i < modules.length; i++) {
		if (modules[i].begin < current_module.begin) {
			prev = modules[i];
		}
		else {
			break;
		}
	}

	return prev;
};


ModuleCoordinator.moduleComplete = function () {
	let currentmod = ModuleCoordinator.currentModule();
	let nextmod = ModuleCoordinator.nextModule();

	if (currentmod === nextmod) {
		return;
	}

	let MC = ModuleCoordinator;

	MC.transition.reject();

	MC.transition = nextmod.enter();

	let spacer = $("<div>").addClass('spacer');

	MC.transition.done(function () {
		MC.container.append(spacer);

		MC.updateTimeline(nextmod.begin);

		_t = nextmod.begin;

		MC.transition.reject();

		MC.transition = MC.container.scrollTo(nextmod.view.module, {
			msec: 1500,
			easing: Easing.springFactory(.9, 0),
		})
		.done(function () {
			if (nextmod.begin === _t) {
				MC.seek(nextmod.begin);
			}

			currentmod.exit();
		})
		.fail(function () {
			MC.transition.done(function () {
				nextmod.exit();
			})
		})
		.always(function () {
			spacer.remove();
		})
	})
};

ModuleCoordinator.moduleUncomplete = function () {
	let currentmod = ModuleCoordinator.currentModule();
	let prevmod = ModuleCoordinator.previousModule();

	if (currentmod === prevmod) {
		return;
	}

	let MC = ModuleCoordinator;

	MC.transition.reject();

	MC.transition = prevmod.enter();

	let spacer = $("<div>").addClass('spacer');

	MC.transition.done(function () {
		MC.container.append(spacer);

		let global_time = prevmod.begin + prevmod.last() * prevmod.duration;

		MC.updateTimeline(global_time);

		_t = global_time;

		MC.transition.reject();

		MC.transition = MC.container.scrollTo(prevmod.view.module, {
			msec: 1500,
			easing: Easing.springFactory(.9, 0),
		})
		.done(function () {
			if (global_time === _t) {
				MC.seek(global_time);
			}

			currentmod.exit();
		})
		.fail(function () {
			MC.transition.done(function () {
				prevmod.exit();
			})
		})
		.always(function () {
			spacer.remove();
		})

	});
};

ModuleCoordinator.moduleAt = function (t) {
	let modules = ModuleCoordinator.modules;

	if (!modules.length) {
		throw new Error("No modules were defined for this timeline.");
	}

	for (let i = 0; i < modules.length; i++) {
		let current = modules[i];
		if (t >= current.begin && t < current.begin + current.duration) {
			return current;
		}
	}

	throw new Error(`Something got out of sync. t = ${t}, modules: ${modules.length}`);
};

ModuleCoordinator.sub_t_update = function (module_name, sub_t) {
	var current = ModuleCoordinator.currentModule();

	if (module_name == current.name) {
		_t = (current.begin + (sub_t * current.duration)); 
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

	ModuleCoordinator.updateTimeline(t);
}

ModuleCoordinator.updateTimeline = function (t) {
	ModuleCoordinator.timeline.seek(t);

	let current_mod = ModuleCoordinator.moduleAt(t);

	ModuleCoordinator.timeline.view.module
		.removeClass('light dark')
		.addClass(current_mod.allegience);
};


function computeNormalization (modules) {
	return modules.map(function (module) {
		return module.duration;
	})
	.reduce(function (a, b) {
		return a + b;
	}, 0);
}

module.exports = ModuleCoordinator;
