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

var Set = function () {

var value = true
  , jsonify = function (item) {
     if (typeof item === "object") {
       return item = JSON.stringify(item)
     }
     return item;
  }
  , unique = function(iset){
      var set = Object.create(null)
        , i = 0
        , l = iset.length

      for(; i < l; i++) {
        set[jsonify(iset[i])] = value
      }

      return set
  }

var Set = function(input){
  this._set = unique(input || [])
}

Set.prototype.contains = function(prop){
  return !!this._set[jsonify(prop)]
}

Set.prototype.empty = function(){
  return Object.keys(this._set).length == 0
}

Set.prototype.size = function(){
  return Object.keys(this._set).length
}

Set.prototype.get = function(){
  return Object.keys(this._set)
}

Set.prototype.add = function(prop){
  this._set[jsonify(prop)] = value
}

Set.prototype.remove = function(prop){
  delete this._set[jsonify(prop)]
}

Set.prototype.union = function(iset){
  return new Set(this.get().concat(iset.get()))
}


Set.prototype.intersect = function(iset){
  var items = iset.get()
    , i = 0
    , l = items.length
    , oset = new Set()
    , prop

  for(; i < l; i++){
    prop = items[i]
    if(this.contains(prop)){
      oset.add(prop)
    }
  }

  items = this.get()

  for(i = 0, l = items.length; i < l; i++){
    prop = items[i]
    if(iset.contains(prop)){
      oset.add(prop)
    }
  }

  return oset
}

Set.prototype.difference = function(iset){
  var items = iset.get()
    , i = 0
    , l = items.length
    , oset = this.union(iset)
    , prop

  for(; i < l; i++){
    prop = items[i]
    if(this.contains(prop)){
      oset.remove(prop)
    }
  }

  return oset
}

Set.prototype.subset = function(iset){
  var items = iset.get()
    , subset = false
    , i = 0
    , l = items.length

  for(; i < l; i++){
    prop = items[i]
    if(this.contains(prop)){
      subset = true
    }
    else{
      subset = false
      break
    }
  }

  return subset
}

Set.prototype.find = function(pred){
  return this.get().filter(pred)
}

Set.prototype.clear = function(){
  this._set = Object.create(null)
}

Set.unique = function(iset){
  return Object.keys(unique(iset))
}

return Set

}()

if(typeof module === 'object' && module.hasOwnProperty('exports')){
  module.exports = Set;
}

// See http://en.wikipedia.org/wiki/Kruskal's_algorithm
// and http://programmingpraxis.com/2010/04/06/minimum-spanning-tree-kruskals-algorithm/

var nodes = ["A", "B", "C", "D", "E", "F", "G"];
var edges = [
    ["A", "B", 7], ["A", "D", 5],
    ["B", "C", 8], ["B", "D", 9], ["B", "E", 7],
    ["C", "E", 5],
    ["D", "E", 15], ["D", "F", 6],
    ["E", "F", 8], ["E", "G", 9],
    ["F", "G", 11]
];

function kruskal (nodes, edges) {
    // forest (F) on Wikipedia
    var forest = nodes.map(function(node) { 
        return new Tree({
            vertex: node,
        }); 
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
            return -1;
        }
        
        return 1;
    });

    // If the graph is disconnected this while loop will never exit
    // I'll work on it next week... (11.10.15)
    while (forest.length > 1) {  
        var edge = edges.pop();
        var n1 = edge[0],
            n2 = edge[1];

        var t1 = find_tree_in_forest(forest, n1);
        var t2 = find_tree_in_forest(forest, n2);

        if (!treeEqual(t1, t2)) {
            // Update forest array
            step(n1, n2);
        }
    }

    return console.log(forest.get());
}

// Tree Class
function Tree (args) {
    args = args || {};

    this.V = new Set(args.vertex);
    this.E = new Set();

} 

function find_tree_in_forest (forest, n) {
    var t1 = forest.filter(function(tree) {
        return tree.V.contains(n);
    });

    return t1[0];
}

// Merge T1 + T2 into a new Tree Object
function merge(T1, T2) {
    TN = new Tree();

    // Make union of vertices between T1 + T2
    TN.V = T1.V.union(T2.V);

    // Make union of edges between T1 + T2
    TN.E = T1.U.union(T2.E);

    return TN;
}

// Step through forest array, replace T1 + T2 with a new union Tree TN
function step(T1, T2) {
    // Create a new Tree Object that merges T1 + T2
    var TN = TN.merge(T1, T2);

    // Remove T1 + T2 from forest array
    forest.remove(T1, T2);

    // Add TN to forest array
    forest.add(TN);
}

// Check set difference
function treeEqual (T1, T2) {
    return (
        ! // Are these similar?
        T1.V.difference(T2.V).size() +
        T2.V.difference(T1.V).size()
    );
}

console.log(kruskal(nodes, edges));


