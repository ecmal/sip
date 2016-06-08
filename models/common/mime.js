system.register("sip/models/common/mime", ["../model", "./uri"], function(system,module) {
    var model_1, uri_1;
    var Mime = (function (__super) {
        Mime.prototype.toString = function (options) {
            var _this = this;
            return this.type + "/" + this.subtype + (this.params ? Object.keys(this.params).map(function (k) { return (";" + k + "=" + _this.params[k]); }).join('') : '');
        };
        Mime.__initializer = function(__parent){
            __super=__parent;
            Mime.SDP = new Mime({
                type: 'application',
                subtype: 'sdp'
            });
        };
        return Mime;
        function Mime() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Mime);
    module.export("Mime", Mime);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            }],
        execute: function() {
            Mime = module.init(Mime,model_1.Model);
        }
    }
});
//# sourceMappingURL=mime.js.map