var antlr4 = require('antlr4');
var fhirpath = require('./fhirpath');
var util = require('util');
var ex = "Patient.name.where($resource.a.b='v', c | e | f, a + bc.d.not())";

ex = "Patient.name.where(given='eve')";
    
var start = [{
    resourceType: "Patient",
    name:[{
	given:["eve", "anne"]
    }, {
	given:["jenny", "eve"]
    }]
}]

var coerce = {
    boolean: function(v){
	return v === true || (util.isArray(v) && v[0] === true)
    }
}

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
	return coerce.boolean(keep) ? item : [];
    },
    "$constant": (_, val)=>{
	return val
    }
}

var operatorBank = {
    "=": (lhs, rhs) => {
	return lhs.filter(item=>{return item === rhs[0];})
    }
}

Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

//ex = process.argv[2];

console.log("parsing", ex, ":")
var tree = fhirpath.parse(ex);
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
	if (fn)
	return coll.flatMap(item =>fn.apply(null, [item].concat(cur.slice(1))))

	var op = operatorBank[fnName];
	if (op){
	    lhs = execute(coll, cur[1]);
	    rhs = execute(coll, cur[2]);
	    var ret = op(lhs, rhs);
	    console.log("op returnied", ret);
	    return ret;
	}
    }, coll);

}


module.exports = (resource, path) => {
    var tree = fhirpath.parse(path);
    var result = execute([resource], tree);
    return [tree, result];
    gg;
}
