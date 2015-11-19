var pt = {
    resourceType: "Patient",
    name:[{
	given:["eve", "anne"]
    }, {
	given:["jenny", "eve"]
    }]
}

var fp = require("./index")
ex = "Patient.name.where(given='eve')";
results = fp(pt, ex);
console.log("results")
console.log(JSON.stringify(results[0]))
console.log(JSON.stringify(results[1]))
