system.register("sip/models/common/sequence", ["../model", "./uri"], function(system,module) {
    var model_1, uri_1;
    var Sequence = (function (__super) {
        Sequence.prototype.toString = function (options) {
            return this.value + " " + this.method;
        };
        Sequence.__initializer = function(__parent){
            __super=__parent;
        };
        return Sequence;
        function Sequence() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Sequence);
    module.export("Sequence", Sequence);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            }],
        execute: function() {
            Sequence = module.init(Sequence,model_1.Model);
        }
    }
});
//# sourceMappingURL=sequence.js.map