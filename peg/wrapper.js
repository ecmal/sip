System.register([],function(exports){return { setters:[], execute:function(){

var Grammar = GRAMMAR.PEG.TEMPLATE;

var SyntaxError = Grammar.SyntaxError;

exports("SyntaxError", SyntaxError);
exports("Grammar", Grammar);
exports("default", Grammar);

}}});