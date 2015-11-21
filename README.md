## FHIR Path

To use it, `npm install fhirpath.js`. Then:

```js
   var fp = require('fhirpath.js')
   var result = fp.evaluate({      // the target to evaluate against
     "a": 1,
     "b": [2, 3]
   },
   "a | b | a")                    // the path expression to evaluate

   assert.deepEqual(result, [1, 2, 3, 1])
```

To add you own custom constants to the lookup table, pass along a third argument like:

```js
   var result = fp.evaluate({      // the target to evaluate against
     "a": "some great value",
     "b": [2, 3]
   },
   "a=%my-constant",
   {"my-constant": "some great value"})
   
   assert.deepEqual(result, [true])
```

If passing a lookup table with every call gets tedious, you can create a new execution context with the table baked in:

```
   var myfp = fp.withConstants({"my-constant": "some great value"})
   
   var result = myfp.evaluate({      // the target to evaluate against
     "a": "some great value",
     "b": [2, 3]
   },
   "a=%my-constant")
   
   assert.deepEqual(result, [true])
```

## Try it

Live demo at https://niquola.github.io/fhirpath-demo/#/

## Develop it

Generate the lexer and parser from the included Antlr grammer via:

    sh ./setup.sh


Run tests:

    npm  test

Regenerate test case file:

    npm run-script generate-test-cases

