var should = require('should'),
	Kruskal = require('../components/neurons/kruskal.js');

var graphs = {
	empty: {
		V: [],
		E: [],
	},
	trivial: {
		V: ["A"],
		E: [],
	},
	disconnected: {
		V: ["A", "B"],
		E: [],
	},
	cyclic_connected: {
		V: [ "A", "B", "C", "D", "E", "F", "G" ],
		E: [
			["A", "B", 7], ["A", "D", 5],
			["B", "C", 8], ["B", "D", 9], ["B", "E", 7],
			["C", "E", 5],
			["D", "E", 15], ["D", "F", 6],
			["E", "F", 8], ["E", "G", 9],
			["F", "G", 11]
		],
	},
	linear: {
		V: [ "A", "B", "C" ],
		E: [
			[ "A", "B", 1 ],
			[ "B", "C", 1 ],
		],
	},
	linear_cyclic: {
		V: [ "A", "B", "C" ],
		E: [
			[ "A", "B", 1 ],
			[ "B", "C", 1 ],
			[ "C", "A", 2 ],
		],
	},
	number_tree: {
		V: [ "0", "5", "50", "52.3" ],
		E: [  
			[ "0", "5", 1 ],
			[ "5", "50", 2 ],
			[ "50", "52.3", 3 ],
		],
	}
};

describe('Kruskal', function () {
	it('Should not crash', function () {
		Kruskal.kruskal(graphs.linear.V, graphs.linear.E);
	});

	it('Single node is single tree', function () {
		var forest = Kruskal.kruskal(graphs.trivial.V, graphs.trivial.E);
		forest.length.should.equal(1);
	});

	it('Linear connected graph returns single tree', function () {
		var forest = Kruskal.kruskal(graphs.linear.V, graphs.linear.E);
		forest.length.should.equal(1);
	});

	it('Linear connected graph returns correct verticies', function () {
		var forest = Kruskal.kruskal(graphs.linear.V, graphs.linear.E);
		var tree = forest[0];

		tree.V.contains("A").should.equal(true);
		tree.V.contains("B").should.equal(true);
		tree.V.contains("C").should.equal(true);
	});

	it('Linear connected graph returns correct edge list', function () {
		var forest = Kruskal.kruskal(graphs.linear.V, graphs.linear.E);
		var tree = forest[0];

		tree.E.contains([ "A", "B", 1 ]).should.equal(true);
		tree.E.contains([ "B", "C", 1 ]).should.equal(true);
	});

	it('Disconnected graph should have more than one tree in forest', function () {
		var forest = Kruskal.kruskal(graphs.disconnected.V, graphs.disconnected.E);
		forest.length.should.equal(2);
	});

	it('Linear disconnected graph returns correct edge list', function () {
		var forest = Kruskal.kruskal(graphs.disconnected.V, graphs.disconnected.E);
		forest[0].V.contains("A").should.equal(true);
		forest[1].V.contains("B").should.equal(true);

		forest[0].E.get().length.should.equal(0);
		forest[1].E.get().length.should.equal(0);
	});

	it('Linear cyclic graph correct', function () {
		var forest = Kruskal.kruskal(graphs.linear_cyclic.V, graphs.linear_cyclic.E);
		
		forest.length.should.equal(1);

		var tree = forest[0];

		tree.V.contains("A").should.equal(true);
		tree.V.contains("B").should.equal(true);
		tree.V.contains("C").should.equal(true);

		tree.E.contains([ "A", "B", 1 ]).should.equal(true);
		tree.E.contains([ "B", "C", 1 ]).should.equal(true);
		tree.E.contains([ "C", "A", 2 ]).should.equal(false);

		tree.E.get().length.should.equal(2);
	});

	it('Cyclic connected', function () {
		var forest = Kruskal.kruskal(graphs.cyclic_connected.V, graphs.cyclic_connected.E);
		var forest_mst = Kruskal.mst(graphs.cyclic_connected.V, graphs.cyclic_connected.E);
		
		forest.length.should.equal(1);

		var tree = forest[0];

		tree.V.contains("A").should.equal(true);
		tree.V.contains("B").should.equal(true);
		tree.V.contains("C").should.equal(true);
		tree.V.contains("D").should.equal(true);
		tree.V.contains("E").should.equal(true);
		tree.V.contains("F").should.equal(true);
		tree.V.contains("G").should.equal(true);

		tree.E.contains([ "A", "B", 7 ]).should.equal(true);
		tree.E.contains([ "A", "D", 5 ]).should.equal(true);
		tree.E.contains([ "B", "E", 7 ]).should.equal(true);
		tree.E.contains([ "C", "E", 5 ]).should.equal(true);
		tree.E.contains([ "D", "F", 6 ]).should.equal(true);
		tree.E.contains([ "E", "G", 9 ]).should.equal(true);

		tree.E.get().length.should.equal(6);
	});

	it("Number tree", function () {
		var forest = Kruskal.kruskal(graphs.number_tree.V, graphs.number_tree.E);

		forest.length.should.equal(1);

		var tree = forest[0];

		tree.V.contains("0").should.equal(true);
		tree.V.contains("5").should.equal(true);
		tree.V.contains("50").should.equal(true);
		tree.V.contains("52.3").should.equal(true);

		tree.E.contains([ "0", "5", 1 ]).should.equal(true);
		tree.E.contains([ "5", "50", 2 ]).should.equal(true);
		tree.E.contains([ "50", "52.3", 3 ]).should.equal(true);
		
		tree.V.get().length.should.equal(4);
		tree.E.get().length.should.equal(3);
	})
});

describe('MST', function () {
	it('Should crash on empty graph', function () {
		(function () {
			Kruskal.mst(graphs.empty.V, graphs.empty.E)	
		}).should.throw();
	});

	it('Should crash on a disconnected graph', function () {
		(function () {
			Kruskal.mst(graphs.disconnected.V, graphs.disconnected.E)	
		}).should.throw();
	});

	it('Should return an MST', function () {
		var mst = Kruskal.mst(graphs.linear_cyclic.V, graphs.linear_cyclic.E);

		mst.V.contains("A").should.equal(true);
		mst.V.contains("B").should.equal(true);
		mst.V.contains("C").should.equal(true);

		mst.E.contains([ "A", "B", 1 ]).should.equal(true);
		mst.E.contains([ "B", "C", 1 ]).should.equal(true);
		mst.E.contains([ "C", "A", 2 ]).should.equal(false);
	});
})