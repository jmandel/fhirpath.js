let fp = require("./index")
let cases = require("./test-case-dump")

console.log(`Running ${cases.length} tests:`)
var failures = []

let results = cases.map((c, i)=>{
  var result = {
    "parse": fp.parse(c.path),
    "evaluate": fp.evaluate(c.start, c.path)
  }
  if (JSON.stringify(result) !== JSON.stringify(c.result)) {
    console.log("Failure on ", i, c.path)
    console.log("Expected", JSON.stringify(c.result, null, 2))
    console.log("Got", JSON.stringify(result, null, 2))
    return  {fail: i}
  }
  return {success: i}
})

console.log("Done", results.length, "tests, with",
            results.filter(x=>x.fail !== undefined).length, "failures.")
