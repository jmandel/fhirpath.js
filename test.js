var tests = require('./test-case-generator')

var fp = require("./index")

var ex = "Patient.name.where(given=$context.birthDate).given"

var results = fp.evaluate(tests.pt, ex);

console.log("results")
console.log(JSON.stringify(results))

var util = require('util');

