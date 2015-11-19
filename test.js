var pt = {
    resourceType: "Patient",
    birthDate: "2005",
    name:[{ given:["eve", "aar"]}]
}

var fp = require("./index")

var ex = "Patient.name.given.first() | 14";

var results = fp(pt, ex);
console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1]))

