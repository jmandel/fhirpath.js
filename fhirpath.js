var antlr4 = require('antlr4');

var fhirpath = module.exports = {
  lexer: require('./generated/fhirpathLexer').fhirpathLexer,
  parser: require('./generated/fhirpathParser').fhirpathParser,
  listener: require('./generated/fhirpathListener').fhirpathListener
};

fhirpath.parse = function(input){
  var chars = new antlr4.InputStream(input);
  var lexer = new fhirpath.lexer(chars)
  var tokens  = new antlr4.CommonTokenStream(lexer);
  var parser = new fhirpath.parser(tokens);
  parser.buildParseTrees = true;
  var tree = parser.expr();
  return tree.ret;
}
