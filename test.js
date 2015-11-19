var pt = {
    resourceType: "Patient",
    birthDate: "2005",
    name:[
      { given:["eve", "aar"]},
      { given: ["eve"]}
    ]
}

var fp = require("./index")

var ex = "Patient.name.all(given='eve')";

var results = fp(pt, ex);
console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1]))

