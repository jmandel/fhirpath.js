var antlr4 = require('antlr4');

var fhirpath = module.exports = {
  lexer: require('./generated/fhirpathLexer').fhirpathLexer,
  parser: require('./generated/fhirpathParser').fhirpathParser,
  listener: require('./generated/fhirpathListener').fhirpathListener
};


var errors;
ErrorListener.prototype = Object.create(antlr4.error.ErrorListener.prototype);
ErrorListener.prototype.constructor = ErrorListener;
ErrorListener.prototype.syntaxError = function(rec, sym, line, col, msg, e) {
  this.errors.push(msg);
};

fhirpath.parse = function(input){
  errors = []
  var chars = new antlr4.InputStream(input);
  var lexer = new fhirpath.lexer(chars)
  var tokens  = new antlr4.CommonTokenStream(lexer);
  var parser = new fhirpath.parser(tokens);
  parser.buildParseTrees = true;

  var listener = new ErrorListener(errors);
  parser.removeErrorListeners();
  parser.addErrorListener(listener);

  var tree = parser.expr();
  if (errors.lenght > 0) {
    var e = new Error();
    e.parseErrors = errors;
    throw e;
  }
  return tree.ret;
}
