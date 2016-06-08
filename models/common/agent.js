system.register("sip/models/common/agent", ["../model", "./uri"], function(system,module) {
    var model_1, uri_1;
    var Agent = (function (__super) {
        Agent.prototype.toString = function (options) {
            return this.name + "/" + this.version + (this.comment ? " (" + this.comment + ")" : '');
        };
        Agent.__initializer = function(__parent){
            __super=__parent;
        };
        return Agent;
        function Agent() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Agent);
    module.export("Agent", Agent);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            }],
        execute: function() {
            Agent = module.init(Agent,model_1.Model);
        }
    }
});
//# sourceMappingURL=agent.js.map