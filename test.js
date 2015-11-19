var pt = {
    resourceType: "Patient",
    birthDate: "2005",
    name:[
      { given:["beve", "aar", "eve"], "family": ["15.9"]},
      { given: ["steve"]}
    ]
}

var fp = require("./index")

var ex = "(Patient.name | Patient.name.where(given='eve')).family.first().asInteger()";

var results = fp(pt, ex);
console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1]))

