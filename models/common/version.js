system.register("sip/models/common/version", ["../model", "./uri"], function(system,module) {
    var model_1, uri_1;
    var Version = (function (__super) {
        Version.prototype.toString = function () {
            return "SIP/" + this.major + "." + this.minor;
        };
        Version.__initializer = function(__parent){
            __super=__parent;
            Version.SIP_2_0 = new Version({
                major: 2,
                minor: 0
            });
        };
        return Version;
        function Version() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Version);
    module.export("Version", Version);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            }],
        execute: function() {
            Version = module.init(Version,model_1.Model);
        }
    }
});
//# sourceMappingURL=version.js.map