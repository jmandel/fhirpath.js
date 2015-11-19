var antlr4 = require('antlr4');
var fhirpath = require('./fhirpath');
var util = require('util');
var ex = "Patient.name.where($resource.a.b='v', c | e | f, a + bc.d.not())";
ex = "Patient.name.given.where(false)";

var start = [{
    resourceType: "Patient",
    name:[{
	given:["eve", "anne"]
    }, {
	given:["jenny", "eve"]
    }]
}]

var functionBank = {
    "$path": (item, segment, recurse)=>{
	if (item.resourceType && item.resourceType === segment){
	    return item
	}
	var segments = [segment]
	var choice = segment.match(/\[x\]$/)
	if (choice){
	    segments = Object.keys(item).filter(k=>k.match(RegExp("^"+choice[1])))
	}
	return segments.flatMap(s=>item[s])
    },
    "$where": (item, conditions) => {
	var keep = execute([item], conditions)
	console.log("keep?", item, conditions, keep)
	return keep ? item : [];
    },
    "$constant": (_, val)=>{
	return val
    }
}

Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}


//ex = process.argv[2];

console.log("parsing", ex, ":")
var tree = module.exports = fhirpath.parse(ex);
console.log("Done tree", JSON.stringify(tree, null, 2))

var result = execute(start, tree);
console.log("Result", result);

function execute(coll, tree){

    if (!util.isArray(tree[0])){
	console.log("No array, recurse", coll, tree)
	return execute(coll, [tree]);
    }

    return tree.reduce((coll, cur)=>{
	var fnName = cur[0];
	var fn = functionBank[fnName];
	console.log("fn", fnName, !!fn, coll, cur);
	return coll.flatMap(item => fn.apply(null, [item].concat(cur.slice(1))))
    }, coll);

}


/*
name: {given: ["eve", "other]}

"Patient.name.where(given='eve')";

{
  name: "Patient",
  inner: {
    name: "name",
    inner: {
      name: "where",
      params: [{
        name: "equals",
        op: "=",
        next: {
          constant: {valueString: "Eve"}
        }
      }]
    }
  }
}

[
  "Patient",
  "name",
  { $where: [
    { $eq: [
        ["given"],
        "eve"]}]}]



console.log(JSON.stringify(postwalk(parsed, function(tree){
  if (tree.context === "Expr"){
    return tree.children;
  }
  if (tree.context === "Fp_function"){
    var ret = {};
    var args = []
    ret["$" + tree.children[0]] = args;
    tree.children.slice(2, -1).forEach(function(c){
      args.push(c);
    })
    return ret;
  }
  if (tree.context === "Predicate"){
    var ret = [];
    tree.children.forEach(function(c){
      console.log("concat in a ", c);
      if (typeof c !== "string")
      ret.push(c)});
    return ret;
  }
  if (tree.context === "Item"){
    return tree.children[0];
  }
  if (tree.context === "Element"){
    return ["$path", tree.children[0]];
  }
  return tree;
}), null, 2));

function postwalk(tree, fn){
  var ret = JSON.parse(JSON.stringify(tree));
  if (typeof ret === "object"){
    Object.keys(ret).forEach(function(k){
      ret[k] = postwalk(ret[k], fn);
    })
  }
  return fn(ret);
}

function indent(depth){
  var ret = "";
  for (var i=0;i<depth;i++) ret += " ";
  return ret;
}

function walk(tree, depth){
  var reto = {
    context: tree.constructor.name.slice(0, -7)
  };

  var ret = indent(depth) + tree.constructor.name;
  if (tree.symbol){
    var tokenIndex = tree.symbol.tokenIndex;
    var token = tree.symbol.source[1].strdata.substr(tree.symbol.start, (tree.symbol.stop - tree.symbol.start + 1))
    ret = ret + ", symbol: " + tree.symbol.tokenIndex + " = " + token;
    reto.symbol = token;
  }
  console.log(ret);
  if (tree.children){ 
    reto.children = [];
    for (var i=0;i<tree.children.length;i++) {
      reto.children.push(walk(tree.children[i], depth+1));
    }
  }
  if (reto.context === "TerminalN")
    reto = reto.symbol;
  return reto;
}


console.log("Output")
console.log(JSON.stringify(tree.ret, null, 2))
*/
