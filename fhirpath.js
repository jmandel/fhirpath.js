var antlr4 = require('antlr4');

var fhirpath = module.exports = {
  lexer: require('./generated/fhirpathLexer').fhirpathLexer,
  parser: require('./generated/fhirpathParser').fhirpathParser,
  listener: require('./generated/fhirpathListener').fhirpathListener
};


var ErrorListener = function(errors) {
  antlr4.error.ErrorListener.call(this);
  this.errors = errors;
  return this;
};

ErrorListener.prototype = Object.create(antlr4.error.ErrorListener.prototype);
ErrorListener.prototype.constructor = ErrorListener;
ErrorListener.prototype.syntaxError = function(rec, sym, line, col, msg, e) {
  this.errors.push([rec, sym, line, col, msg, e]);
};

fhirpath.parse = function(input){
  var chars = new antlr4.InputStream(input);
  var lexer = new fhirpath.lexer(chars)

  var tokens  = new antlr4.CommonTokenStream(lexer);


  var parser = new fhirpath.parser(tokens);
  parser.buildParseTrees = true;
  var errors = []
  var listener = new ErrorListener(errors);

  lexer.removeErrorListeners();
  lexer.addErrorListener(listener);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);



  var tree = parser.expr();
  console.log("Tree done wiht", errors)
  if (errors.length > 0) {
    var e = new Error();
    e.errors = errors;
    throw e;
  }
  return tree.ret;
}
