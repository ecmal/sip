system.register("sip/models/common/uri", ["../model"], function(system,module) {
    var model_1;
    var Uri = (function (__super) {
        Uri.prototype.setParam = function (name, value) {
            if (!this.params) {
                this.params = Object.create(null);
            }
            this.params[name] = value;
        };
        Uri.prototype.getParam = function (name) {
            if (this.params) {
                return this.params[name];
            }
        };
        Object.defineProperty(Uri.prototype, "server", {
            get: function () {
                return this.clone('scheme,host,port,params');
            },
            enumerable: true,
            configurable: true
        });
        Uri.prototype.toString = function (options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var authority = (this.username ? this.username + ((options.inspect && this.password) ? ':' + this.password : '') + '@' : '');
            var server = "" + this.host + (this.port ? ':' + this.port : '');
            var params = this.params ? Object.keys(this.params).map(function (k) { return (";" + k + (_this.params[k] ? '=' + _this.params[k] : '')); }).join('') : '';
            var headers = this.headers ? '?' + Object.keys(this.headers).map(function (k) { return (k + "=" + _this.params[k]); }).join('&') : '';
            return this.scheme + ":" + authority + server + params + headers;
        };
        Uri.__initializer = function(__parent){
            __super=__parent;
        };
        return Uri;
        function Uri(data) {
            __super.call(this, data);
            if (typeof data == 'string') {
                return Uri.new(data);
            }
            else {
                __super.call(this, data);
            }
            if (!this.scheme) {
                this.scheme = 'sip';
            }
        }
    })();
    module.define('class', Uri);
    module.export("Uri", Uri);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            }],
        execute: function() {
            Uri = module.init(Uri,model_1.Model);
        }
    }
});
//# sourceMappingURL=uri.js.map