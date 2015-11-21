var antlr4 = require('antlr4');
var fhirpath = require('./fhirpath');
var util = require('util');

var coerce = {
    integer: function(v){
        if (!util.isArray(v)) {
            throw new Error("can't boolean coerce nonarray"  + v)
        }
        if (v.length !== 1){
            return NaN
        }
        return parseInt(v[0])
    },
    boolean: function(v){
        if (!util.isArray(v)) {
            throw new Error("can't boolean coerce nonarray"  + v)
        }
        if (v.length === 1 && (v[0] === true || v[0] === false)){
            return v[0]
        }

        if (v.length === 0) {
            return false;
        }

        return true
    }
}

Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
}

var applyToEach = (fn) => (coll, context, ...rest) => {
    return coll.flatMap(item =>fn.apply(null, [item, context].concat(rest)))
}

var resolveArguments = (fn) => (coll, context, ...rest) =>
    fn.apply(null, [coll, context]
                    .concat(rest.map(i =>
                                     run(coll, withTree(context,i)))))

var uniqueValueMap = (rows) => 
    rows.reduce((all, val)=>{
        all[JSON.stringify(val)]=true
        return all
    }, {})

var countUniqueValues = (rows)=> Object.keys(uniqueValueMap(rows)).length

var allPaths = (item)=>[item]
.concat(util.isArray(item) ? item.flatMap(allPaths) : [])
.concat( typeof item === 'object' && !util.isArray(item)?
        Object
        .keys(item)
        .reduce((coll, k)=> coll.concat(allPaths(item[k])) , []) : [])

var functionBank = {
    "$path": applyToEach((item, context, segment, recurse)=>{
        if (item.resourceType && item.resourceType === segment){
            return item
        }
        var segments = [segment]
        var choice = segment.match(/\[x\]$/)
        if (choice){
            segments = Object.keys(item).filter(k=>k.match(RegExp("^"+choice[1])))
        }
        return segments.flatMap(s=>item[s]).filter(x=> !!x)
    }),
    "$axis": applyToEach((item, context, axis)=>{
        if (axis === "*")
            return (typeof item === "object") ? 
                Object.keys(item).flatMap(s=>item[s]).filter(x=> !!x) : item
        if (axis === "**")
            return allPaths(item).slice(1)
        if (axis === "$context")
            return context.root
        throw new Error("Unsupported asis: " + axis)
    }),
    "$where": applyToEach((item, context, conditions) =>
        coerce.boolean(run([item], withTree(context,conditions))) ? [item] : []
    ),
    "$constant": (_, context, val)=>{
        return [val]
    },
    "$first": (coll)=> coll.slice(0,1),
    "$last": (coll)=> coll.slice(-1),
    "$tail": (coll)=> coll.slice(1),
    "$item": resolveArguments((coll, context, i) => coll.slice(i,i+1)),
    "$skip": resolveArguments((coll, context, i) => coll.slice(i)),
    "$take": resolveArguments((coll, context, i) => coll.slice(0,i)),
    // TODO: Clarify what collections are accepted by substring
    "$substring": resolveArguments((coll, context, start, count) => {
        if (coll.length !== 1) return []
        if (typeof coll[0] !== "string") return []
        var input = coll[0]
        var end = count !== undefined ? start + count : input.length
        return [input.slice(start, end)]
    }),
    "$empty": (coll)=>[coll.length === 0],
    "$not": (coll) => [!coerce.boolean(coll)],
    "$all": (coll, context, conditions) =>
        [functionBank.$where(coll, conditions).length === coll.length],
    "$any": (coll, context, conditions) =>
        [functionBank.$where(coll, context, conditions).length > 0],
    "$count": (coll) => [coll.length],
    "$lookup": (coll, context, tag) => [lookup(tag, context)],

    // TODO how does asInteger convert "5.6", or *numbers* e.g. from count()?
    "$asInteger": resolveArguments((coll, context)=> {
        let val = coerce.integer(coll)
        return isNaN(val) ? [] : [val]
    }),
    "$distinct":(coll, context, ...rest)=>
        [coll.length ===
            countUniqueValues(coll
                              .map((item) =>
                                   rest.map((path) =>
                                            run([item], withTree(context, path)))))],
   // TODO startsWith probably needs an argument
   // and why does .startsWith act as a filter, while .matches returns a boolean?
}

var whenSingle = (fn)=> (lhs, rhs) => {
        if (lhs.length !== 1 || rhs.length !== 1) return [];
        return fn(lhs[0], rhs[0]);
    }

var operatorBank = {
    "=": (lhs, rhs) => [JSON.stringify(lhs)===JSON.stringify(rhs)],
    "!=": (lhs, rhs) => operatorBank["="](lhs, rhs).map(x=>!x),
    "|": (lhs, rhs) => lhs.concat(rhs),
    "+": whenSingle((lhs, rhs)=>{
        if (typeof lhs !== typeof rhs) return []
        return [lhs + rhs];
    }),
    "-": whenSingle((lhs, rhs)=>{
        if (typeof lhs !== typeof rhs) return []
        return [lhs - rhs];
    }),
    "&": whenSingle((lhs, rhs)=>{
        if (typeof lhs !== typeof rhs) return []
        return [lhs + rhs];
    }),
    "and": (lhs, rhs) => [coerce.boolean(lhs) && coerce.boolean(rhs)],
    "or": (lhs, rhs) => [coerce.boolean(lhs) || coerce.boolean(rhs)],
    "xor": (lhs, rhs) => [coerce.boolean(lhs) !== coerce.boolean(rhs)],
    "in": (lhs, rhs) => {
        let lhsMap = uniqueValueMap(lhs)
        let rhsMap = uniqueValueMap(rhs)
        return [Object.keys(lhsMap).every((k)=> k in rhsMap)]
    },
    "~": (lhs, rhs)=> [
        JSON.stringify(lhs.map(JSON.stringify).sort()) ===
        JSON.stringify(rhs.map(JSON.stringify).sort())],
    "!~": (lhs, rhs)=> operatorBank["~"](lhs, rhs).map(x=>!x),
    ">": whenSingle((lhs, rhs)=> [lhs[0] > rhs[0]]),
    "<": whenSingle((lhs, rhs)=> [lhs[0] < rhs[0]]),
    ">=": whenSingle((lhs, rhs)=> [lhs[0] >= rhs[0]]),
    "<=": whenSingle((lhs, rhs)=> [lhs[0] <= rhs[0]]),
}

var withTree = (context, tree) => Object.assign({}, context, {tree: tree})

function run(coll, context){

    if (!util.isArray(context.tree[0])){
        return run(coll, withTree(context, [context.tree]));
    }

    return context.tree.reduce((coll, cur)=>{
        if (util.isArray(cur[0])){
            return [coll].concat(run(coll, withTree(context, cur[0])))
        }

        let fnName = cur[0];
        let fn = functionBank[fnName];
        if (fn) {
            return fn.apply(null, [coll, context].concat(cur.slice(1)))
        }

        return operatorBank[fnName](
            run(coll, withTree(context, cur[1])),
            run(coll, withTree(context, cur[2])))
    }, coll);

}

var defaultLookups = {
  "sct": "http://snomed.info/sct",
  "loinc": "http://loinc.org",
  "ucum": "http://unitsofmeasure.org",
  "vs-": "http://hl7.org/fhir/ValueSet/",
  "ext-": "http://hl7.org/fhir/StructureDefinition/"
}

var lookup = (tag, context) => {

    if (context.lookups[tag]){
        return context.lookups[tag]
    }

    let m = tag.match(/(.*?-)(.*)/)
    if (m && context.lookups[m[1]]){
        return context.lookups[m[1]] + m[2]
    }

    throw new Error(`Undefined lookup tag: %${tag}.
                     We know: ${Object.keys(context.lookups)}`)
}

let withConstants = (lookups) =>
({
    parse: (path) => fhirpath.parse(path),
    evaluate: (resource, path, localLookups) =>
    run( [resource], {
        tree: fhirpath.parse(path),
        lookups: Object.assign({}, lookups||{},localLookups||{}, defaultLookups),
        root: resource
    })
})

module.exports = withConstants({})
module.exports.withConstants = withConstants
