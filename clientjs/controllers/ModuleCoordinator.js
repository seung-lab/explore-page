
let utils = require('../utils.js'),
	$ = require('jquery'),
	Easing = require('../easing.js'),
	Timeline = require('../../components/timeline.js'),
	Amazing = require('../../components/modules/amazing.js'),
	Galileo = require('../../components/modules/galileo.js'),
	Wonderers = require('../../components/modules/wonderers.js'),
	Superheroes = require('../../components/modules/superheroes.js'),
	Melt = require('../../components/modules/melt.js'),
	MeltMobile = require('../../components/modules/melt-mobile.js'),
	GLOBAL = require('../GLOBAL.js');

let _t = 0;

let ModuleCoordinator = {
	modules: [],
	timeline: null,
	container: null,
	transition: null,
	initialized: false,
};

ModuleCoordinator.initialize = function (animation) {
	let anchor = $('#explore');

	let MC = ModuleCoordinator;

	MC.transition = $.Deferred();

	let mobile = utils.isMobile();

	if (mobile) {
		anchor.addClass('mobile');
	}

	function moduleFactory(module, duration) {
		return new module({
			parent: MC,
			anchor: anchor,
			duration: duration,
			mobile: mobile,
		})
	}

	if (!MC.initialized) {
		MC.setModules([
			moduleFactory(Amazing),
			moduleFactory(Galileo),
			moduleFactory(Wonderers),
			moduleFactory(mobile ? MeltMobile : Melt),
			moduleFactory(Superheroes),
		]);

		MC.timeline = new Timeline({
			parent: MC,
			anchor: anchor,
		});
	}

	MC.container = anchor;

	MC.timeline.enter(animation);

	MC.initHotkeys();

	animation.done(function () {
		MC.timeline.anchorToBody();
		$(GLOBAL.viewport).addClass('parallax-off'); // GPU performance boost
	});

	$(window).ion('scrollStart', function (e, down) {
		if (down) {
			MC.next();
		} else {
			MC.previous();
		}
	});

	$(window).ion('swipe', function (e, evt) {
		if (evt.deltaY < 0) {
			MC.next();
		} else {
			MC.previous();
		}
	});

	MC.initialized = true;
};

ModuleCoordinator.reset = function (animation) {
	$(window).off('scrollStart swipe');
	$(document).off('keydown');

	$(GLOBAL.viewport).removeClass('parallax-off'); // GPU performance boost

	ModuleCoordinator.timeline.anchorToAnchor();

	animation.done(function () {
		ModuleCoordinator.timeline.exit();
	});
};

ModuleCoordinator.tForName = function (name) {
	if (typeof name === 'number') {
		return utils.clamp(name, 0, 1);
	}

	let mods = ModuleCoordinator.modules;

	for (let i = 0; i < mods.length; i++) {
		if (mods[i].name.toLowerCase() === name.toLowerCase()) {
			return mods[i].begin;
		}
	}

	return 0;
};


ModuleCoordinator.initHotkeys = function () {
	$(document).ion('keydown', function (evt) {
		let key = evt.keyCode;

		// right or down key or spacebar or enter
		if (key === 39 || key === 40 || key === 32 || key === 13) { 
			evt.preventDefault();
			ModuleCoordinator.next();
			return false;
		}
		else if (key === 37 || key == 38) { // left or up key
			evt.preventDefault();
			ModuleCoordinator.previous();
			return false;
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

	return current_module; // we're at the end
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
	let cur = ModuleCoordinator.currentModule();
	let next = ModuleCoordinator.nextModule();

	let animationargs;

	if (cur.name === 'Amazing' && next.name === 'Galileo') {
		let sigmoid = Easing.sigmoidFactory(12);
		animationargs = {
			msec: 1000,
			easing: function (t) {
				return 2 * sigmoid(t / 2); // do first half of animation in module transition
			},
		};
	}

	ModuleCoordinator.timeline.fullManual(!!cur.manual_timeline && !!next.manual_timeline);

	simpleTransition(cur, next, next.begin, animationargs);
};

ModuleCoordinator.moduleUncomplete = function () {
	let cur = ModuleCoordinator.currentModule();
	let prev = ModuleCoordinator.previousModule();

	let t = prev.begin + prev.last() * prev.duration;

	ModuleCoordinator.timeline.fullManual(!!prev.manual_timeline && !!cur.manual_timeline);

	simpleTransition(cur, prev, t);
};

function simpleTransition (cur, next, t, animationargs) {
	if (cur === next) {
		return;
	}

	let MC = ModuleCoordinator;

	let spacer = $("<div>").addClass('spacer');

	let scrolled = $.Deferred();

	next.preload();
	next.enter(scrolled, cur.name);
	
	MC.container.append(spacer);

	MC.updateTimeline(t);

	_t = t;

	MC.transition.reject();

	next.seek(ModuleCoordinator.toModuleT(next, t));

	animationargs = animationargs || {
		msec: 1250,
		easing: Easing.sigmoidFactory(13),
	};

	MC.transition = MC.container.scrollTo(next.view.module, animationargs)
		.done(function () {
			scrolled.resolve();

			if (t === _t) {
				MC.seek(t);
			}

			MC.timeline.fullManual(next.manual_timeline);

			cur.exit(null, cur.name);
		})
		.fail(function () {
			scrolled.reject();

			MC.timeline.fullManual(cur.manual_timeline);

			MC.transition.always(function () {
				MC.exitNonDisplayed();
			})
		})
		.always(function () {
			spacer.remove();
		})
};

ModuleCoordinator.moduleAt = function (t) {
	let modules = ModuleCoordinator.modules;

	if (!modules.length) {
		throw new Error("No modules were defined for this timeline.");
	}

	if (Math.abs(1 - t) < 0.00001) {
		return modules[modules.length - 1];
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

ModuleCoordinator.seek = function (t, transition) {
	try {
		mixpanel.track('seek', {
			global_t: t,
			module_t: ModuleCoordinator.toModuleT(t),
			module: ModuleCoordinator.moduleAt(t).name,
		});
	}
	catch (e) {
		console.trace();
	}

	let prev_t = _t;
	_t = t;
	return ModuleCoordinator.render(prev_t, t, transition);
};

ModuleCoordinator.toModuleT = function (module, t) {
	t = (t - module.begin) / module.duration;
	return utils.clamp(t, 0, 1);
}

ModuleCoordinator.render = function (prev_t, t, transition) {
	prev_t = utils.nvl(prev_t, _t);
	t = utils.nvl(t, _t);

	let prev_mod = ModuleCoordinator.moduleAt(prev_t);
	let current_mod = ModuleCoordinator.moduleAt(t);

	ModuleCoordinator.timeline.fullManual(!!current_mod.manual_timeline);

	current_mod.preload();

	if (prev_mod !== current_mod) {
		prev_mod.exit();
		current_mod.enter(transition);
	}
	else if (!current_mod.visible) {
		current_mod.enter(transition);
	}

	ModuleCoordinator.exitNonDisplayed(t);

	ModuleCoordinator.updateTimeline(t);

	let t_mod = ModuleCoordinator.toModuleT(current_mod, t);
	current_mod.seek(t_mod);
}

ModuleCoordinator.exitNonDisplayed = function (t) {
	t = utils.nvl(t, _t);

	let current_mod = ModuleCoordinator.moduleAt(t);

	let mods = ModuleCoordinator.modules.filter(function (mod) {
		return mod !== current_mod;
	});

	mods.forEach(function (mod) {
		mod.exit();
	});
};

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
