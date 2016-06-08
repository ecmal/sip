system.register("sip/models/common/challenge", ["../model", "./utils", "./uri", "../message/request"], function(system,module) {
    var model_1, utils_1, uri_1, request_1;
    var Challenge = (function (__super) {
        Challenge.prototype.authorize = function (request, username, password) {
            var cnonce = this.cn;
            var nc = (100000000 + (this.nc++)).toString().substring(1);
            var HA1 = utils_1.Util.md5(username + ':' + this.params.realm + ':' + password);
            var HA2 = utils_1.Util.md5(request.method + ':' + request.uri.toString());
            var response = utils_1.Util.md5(HA1 + ':' + this.params.nonce + ':' + nc + ':' + cnonce + ':' + this.params.qop + ':' + HA2);
            var challenge = new Challenge({
                type: this.type,
                params: {
                    realm: this.params.realm,
                    nonce: this.params.nonce,
                    qop: this.params.qop,
                    algorithm: this.params.algorithm,
                    uri: request.uri.toString(),
                    username: username,
                    cnonce: cnonce,
                    nc: nc,
                    response: response
                }
            });
            if (this.params.opaque) {
                challenge.params.opaque = this.params.opaque;
            }
            return challenge;
        };
        Challenge.prototype.toString = function (options) {
            var _this = this;
            return this.type + " " + Object.keys(this.params).map(function (k) {
                if (['algorithm', 'stale', 'nc', 'qop'].indexOf(k) >= 0) {
                    return k + "=" + _this.params[k];
                }
                else {
                    return k + "=\"" + _this.params[k] + "\"";
                }
            }).join(',');
        };
        Challenge.__initializer = function(__parent){
            __super=__parent;
        };
        return Challenge;
        function Challenge(data) {
            __super.call(this, data);
            this.nc = 1;
            this.cn = utils_1.Util.guid();
        }
    })();
    module.define('class', Challenge);
    module.export("Challenge", Challenge);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            },
            function (request_1_1) {
                request_1 = request_1_1;
            }],
        execute: function() {
            Challenge = module.init(Challenge,model_1.Model);
        }
    }
});
//# sourceMappingURL=challenge.js.map