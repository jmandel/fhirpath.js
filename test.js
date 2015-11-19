var pt = {
    resourceType: "Patient",
    birthDate: "2005",
    name:[{ given:["eve"]}]
}

var fp = require("./index")
ex = "Patient.name.given |  Patient.name.given";

results = fp(pt, ex);
console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1]))

