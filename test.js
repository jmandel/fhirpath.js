var tests = require('./test-case-generator')

var fp = require("./index")

var ex = "Patient.name.where(given = %loinc)"
var results = fp(tests.pt, ex);

console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1], null, 2))

var util = require('util');

