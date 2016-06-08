system.register("sip/models/common/event", ["../model", "./uri"], function(system,module) {
    var model_1, uri_1;
    var Event = (function (__super) {
        Event.prototype.toString = function (options) {
            var _this = this;
            return this.type + " " + (this.params ? Object.keys(this.params).map(function (k) { return (";" + k + "=" + _this.params[k]); }).join('') : '');
        };
        Event.__initializer = function(__parent){
            __super=__parent;
        };
        return Event;
        function Event() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Event);
    module.export("Event", Event);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            }],
        execute: function() {
            Event = module.init(Event,model_1.Model);
        }
    }
});
//# sourceMappingURL=event.js.map