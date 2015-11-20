var fp = require("./index")

var pt = module.exports.pt = {
  resourceType: "Patient",
  birthDate: "2005",
  name:[
    { given:["beve", "ave", "eve"], "family": ["15.9"]},
    { given: ["eve","other"], family: ["other","eve"]},
    { given: ["ever","other"], family: ["aeve","other"]},
    { given: ["a"], family: ["bk"]},
    { given: ["c"], family: ["bk"]},
    { given: ["a"], family: ["c"]},
    { given: ["http://loinc.org"]}
  ]
}

var examples = module.exports.examples = [
  "Patient.name.distinct(given)",
  "Patient.name.distinct(family)",
  "Patient.name.distinct(given, family)",
  "Patient.given",
  "Patient.name.where('eve' in given)",
  "Patient.name.where(given ~ family)",
  "Patient.name.where(given !~ family)",
  "Patient.name.where(given = %loinc)"
]
console.log("fp", Object.keys(fp), typeof fp.evaluate)

if (process.argv.indexOf("--write-all") !== -1) {
  let output = examples.map((e)=>({
      "start": pt,
      "path": e,
      "result":{
        "parse": fp.parse(e),
        "evaluate": fp.evaluate(pt, e)
      }
  }))

  let outfile = "test-case-dump.json"
  require('fs').writeFileSync(outfile, JSON.stringify(output, null, 2))
  console.log("Wrote tests to file: ", outfile)
}
