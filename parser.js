system.register("sip/parser", ["./grammar", "./models/model", "./models"], function(system,module) {
    var grammar_1, model_1, Models;
    var Parser = (function (__super) {
        Parser.normalize = function (text) {
            if (text.match(/\r?\n/) && text.trim().split(/\r?\n/)[0].match(/SIP\/2\.0/)) {
                return text.replace(/\r?\n/g, '\r\n').trim().split('\r\n').map(function (l) { return l.trim(); }).join('\r\n') + '\r\n';
            }
            else {
                return text;
            }
        };
        Parser.parse = function (content, model) {
            return grammar_1.Grammar.parse(Parser.normalize(content), {
                startRule: model.name || 'Start',
                Models: Models
            });
        };
        return Parser;
        function Parser() {
        }
    })();
    module.define('class', Parser);
    module.export("Parser", Parser);
    return {
        setters:[
            function (grammar_1_1) {
                grammar_1 = grammar_1_1;
            },
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (Models_1) {
                Models = Models_1;
            }],
        execute: function() {
            Parser = module.init(Parser);
        }
    }
});
//# sourceMappingURL=parser.js.map