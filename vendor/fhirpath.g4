grammar fhirpath;

// Grammar rules

//version without precedence and left-recursion
//expression: term (righthand)*;
//righthand: op term | '.' function;
//term: '(' expression ')' | const | predicate;
//op: LOGIC | COMP | '*' | '/' | '+' | '-' | '|' | '&';

prog: line (line)*;

line: ID ( '(' predicate ')') ':' expr '\r'? '\n';

//prog: expression (';' expression)* ';'?;

expr returns [ret]:
        a=expr op=('*' | '/') b=expr  {$ret= [$op.text, $a.ret, $b.ret]} |
        a=expr op=('+' | '-') b=expr {$ret= [$op.text, $a.ret, $b.ret]}|
        a=expr op=('|' | '&') b=expr {$ret= [$op.text, $a.ret, $b.ret]}|
        a=expr op=COMP b=expr {$ret= [$op.text, $a.ret, $b.ret]}|
        a=expr op=LOGIC b=expr {$ret= [$op.text, $a.ret, $b.ret]}|
        '(' expr ')' {$ret = [$expr.ret]}|
        predicate {$ret = $predicate.ret}|
        fp_const {$ret=["$"+"constant", JSON.parse($fp_const.text)]};

predicate returns [ret]: {var ret = [];} item {ret.push($item.ret)} ('.' item {ret.push($item.ret)})*  {$ret = (ret.length === 1) ? ret[0] : ret};
item returns [ret]: element recurse? {$ret = ["\$path",  $element.text, !!($recurse.text)]}|
                    fp_function {$ret = $fp_function.ret;} |
                    axis_spec {$ret = ["$"+"axis", $axis_spec.text]}|
                    '(' expr ')' {$ret = $expr.ret};
element: ID CHOICE?;
recurse: '*';
axis_spec: '*' | '**' | '$context' | '$resource' | '$parent' ;

fp_function returns [ret]: {var params = []} ID '(' param_list? {if ($param_list.text) params = $param_list.ret} ')' {$ret = ["$"+$ID.text].concat(params)};
param_list returns [ret]: {var ret = [];} expr {ret.push($expr.ret)} (',' expr {ret.push($expr.ret)})*
                          {console.log("param list", JSON.stringify(ret)); $ret = ret.map(function(v){return v.length == 1 ? v[0] : v})};

//array_expr:
//    expr |
//    expr '..' expr;

fp_const: STRING |
       '-'? NUMBER |
       BOOL |
       CONST;


// Lexical rules

LOGIC: 'and' | 'or' | 'xor';
COMP: '=' | '~' | '!=' | '!~' | '>' | '<' | '<=' | '>=' | 'in';
BOOL: 'true' | 'false';

CONST: '%' ALPHANUM (ALPHANUM | [\-.])*;

STRING: '"' (ESC | ~["\\])* '"' |           // " delineated string
        '\'' (ESC | ~[\'\\])* '\'';         // ' delineated string

fragment ESC: '\\' (["'\\/bfnrt] | UNICODE);    // allow \", \', \\, \/, \b, etc. and \uXXX
fragment UNICODE: 'u' HEX HEX HEX HEX;
fragment HEX: [0-9a-fA-F];

NUMBER: INT '.' [0-9]+ EXP? |
        INT EXP |
        INT;

fragment INT: '0' | [1-9][0-9]*;
fragment EXP: [Ee] [+\-]? INT;


CHOICE: '[x]';
ID: ALPHA ALPHANUM* ;

fragment ALPHA: [a-zA-Z];
fragment ALPHANUM: ALPHA | [0-9];

WS: [ \r\n\t]+ -> skip;