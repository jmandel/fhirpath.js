var pt = {
    resourceType: "Patient",
    birthDate: "2005",
    name:[{
	given:["eve", "anne"]
    }, {
	given:["jenny", "eve"]
    }]
}

var fp = require("./index")
//ex = "Patient.name.where(given='eve') | Patient.birthDate";
ex = "Patient.name["
results = fp(pt, ex);
console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1]))

