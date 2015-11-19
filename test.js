var pt = {
  resourceType: "Patient",
  birthDate: "2005",
  name:[
    { given:["beve", "ave", "eve"], "family": ["15.9"]},
    { given: ["ava"]}
  ]
}

var fp = require("./index")

var ex = "Patient.name.*"

var results = fp(pt, ex);
console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1], null, 2))

var util = require('util');

