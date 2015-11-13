var Utils = {
	
	cacheify: function (f) {
		var cache = null;
		var first = true;

		return function() {
			if (first) {
				first = false;
				cache = f.apply(this, arguments);
			}

			return cache;
		}
	},
	
	// Function to abstract call-once logic
	onceify: function(f) {
	    var called = false;
	    
	    return function() {
	        if (!called) {
	            called = true;
	            return f.apply(this, arguments);
	        }
	    }
	},

};
