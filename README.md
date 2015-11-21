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

## Try it

Live demo at https://niquola.github.io/fhirpath-demo/#/

## Develop it

Generate the lexer and parser from the included Antlr grammer via:

    sh ./setup.sh


Run tests:

    npm  test

Regenerate test case file:

    npm run-script generate-test-cases

