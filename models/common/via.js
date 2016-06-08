system.register("sip/models/common/via", ["../model", "./uri", "./utils"], function(system,module) {
    var model_1, uri_1, utils_1;
    var Via = (function (__super) {
        Via.prototype.toString = function (options) {
            return this.protocol + "/" + this.version + "/" + this.transport + " " + this.host + (this.port ? ":" + this.port : '') + utils_1.Util.toParamString(this.params);
        };
        Via.__initializer = function(__parent){
            __super=__parent;
        };
        return Via;
        function Via() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Via);
    module.export("Via", Via);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            Via = module.init(Via,model_1.Model);
        }
    }
});
//# sourceMappingURL=via.js.map