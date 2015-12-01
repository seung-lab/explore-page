/* The MIT License (MIT)

Copyright (c) 2011-2012 George "Gary" Katsevman

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE S
OFTWARE.
*/
"use strict";

let Set = require('set');

// See http://en.wikipedia.org/wiki/Kruskal's_algorithm
// and http://programmingpraxis.com/2010/04/06/minimum-spanning-tree-kruskals-algorithm/

module.exports.mst = function (nodes, edges) {
  let forest = module.exports.kruskal(nodes, edges);

  if (forest.length > 1) {
    throw new Error("Your graph is not connected.");
  }
  else if (forest.length === 0) {
    throw new Error("Graph has no verticies.");
  }

  return forest[0];
};

module.exports.kruskal = function (nodes, edges) {
  // forest (F) on Wikipedia
  let forest = nodes.map(function(node) {
    return new Tree({
      vertex: node,
    })
  });

  // edge list sorted by minimum cost (set S on Wikipedia)
  // Make local deep copy of edges
  edges = edges.slice();

  // Sort edges by increasing cost
  edges.sort(function (a, b) {
    if (a[2] === b[2]) {
      return 0;
    }
    else if (a[2] < b[2]) {
      return 1;
    }
    
    return -1;
  });

  while (edges.length) { 
    let edge = edges.pop();
    let n1 = edge[0],
        n2 = edge[1];

    let t1 = find_tree_in_forest(forest, n1);
    let t2 = find_tree_in_forest(forest, n2);

    // If t1 + t1 are not part of the same tree
    // We should add them 
    if (!treeEqual(t1, t2)) {
      // Update forest array with current edge
      // Create a new Tree Object that merges t1 + t2
      let tn = merge(t1, t2);

      // Remove t1 + t2 from forest array
      forest.splice(findKey(forest, t1.V.get()[0]), 1);
      forest.splice(findKey(forest, t2.V.get()[0]), 1);

      tn.E.add(edge);

      // Add tn to forest array
      forest.push(tn);
    }
  }

  return forest;
}

// Tree Class
function Tree (args) {
  args = args || {};

  this.V = new Set(args.vertex);
  this.E = new Set();
} 

function find_tree_in_forest (forest, n) {
  console.log(forest);
  let t3 = forest.filter( (tree) => tree.V.contains(n) );
  return t3[0];
}

// Merge t1 + t2 into a new Tree Object
function merge (t1, t2) {
  let tn = new Tree();

  // Make union of vertices between t1 + t2
  tn.V = t1.V.union(t2.V);

  // Make union of edges between t1 + t2
  tn.E = t1.E.union(t2.E);

  return tn;
}

// Check set difference
function treeEqual (t1, t2) {
  return (
    !(
      t1.V.difference(t2.V).size() +
      t2.V.difference(t1.V).size()
    )
  );
}

// Helper function to find key in associative array
function findKey (obj, value) {
  for (let key of Object.keys(obj)) {
    if (obj[key].V.get()[0] === value) {
      return key;
    }
  }

  return null;
}

// Helper function to log forest contents
function forest_log (forest) {
  forest.forEach(function (tree) {
    console.log(tree.V.get());
  });
}

module.exports.forest_log = function (forest) {
  forest.forEach(function (tree) {
    console.log(tree.V.get());
    console.log(tree.E.get());
  });
};



