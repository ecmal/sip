system.register("sip/grammar",[],function(system,module){

var Grammar = GRAMMAR.PEG.TEMPLATE;

var SyntaxError = Grammar.SyntaxError;

module.export("SyntaxError", SyntaxError);
module.export("Grammar", Grammar);
module.export("default", Grammar);

return { setters:[], execute:function(){}}
});