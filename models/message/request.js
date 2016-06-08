system.register("sip/models/message/request", ["../message", "../common/uri", "../../transport", "../common/utils", "./response", "../common/challenge"], function(system,module) {
    var message_1, uri_1, transport_1, utils_1, response_1, challenge_1;
    var Request = (function (__super) {
        Object.defineProperty(Request.prototype, "headline", {
            get: function () {
                return this.method + " " + this.uri + " " + this.version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "expires", {
            get: function () {
                return this.getHeader(message_1.Message.HEADERS.EXPIRES);
            },
            set: function (value) {
                this.setHeader(message_1.Message.HEADERS.EXPIRES, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Request.prototype, "authorization", {
            get: function () {
                return this.getHeader(message_1.Message.HEADERS.AUTHORIZATION);
            },
            set: function (value) {
                this.setHeader(message_1.Message.HEADERS.AUTHORIZATION, value);
            },
            enumerable: true,
            configurable: true
        });
        Request.prototype.toString = function () {
            return [
                this.headline
            ].concat(message_1.Message.headersToString(this.headers), [
                '',
                ''
            ]).join('\r\n');
        };
        Request.prototype.print = function (s) {
            var c = (s ? utils_1.Paint.magenta : utils_1.Paint.cyan).bind(utils_1.Paint);
            var t = new Date().toISOString().substring(11, 23);
            console.info('');
            console.info("" + c('============================================= ') + utils_1.Paint.gray(t) + c(" REQUEST -- " + (s ? '>>' : '<<') + " --"));
            console.info(utils_1.Paint.blue(utils_1.Paint.bold(this.method)) + " " + utils_1.Paint.blue(this.uri.toString()) + " " + this.version);
            console.info(c("---------------------------------------------------------- HEADERS -- " + (s ? '>>' : '<<') + " --"));
            console.info(message_1.Message.headersToDebugString(this.headers).join('\n'));
            if (this.content && this.content.length) {
                console.info(c("------------------------------------------------------------- BODY -- " + (s ? '>>' : '<<') + " --"));
                console.info(utils_1.Paint.gray(this.content.toString().trim()));
            }
            console.info(c("-------------------------------------------------------------- END -- " + (s ? '>>' : '<<') + " --"));
            return this;
        };
        Request.prototype.send = function (transport) {
            return transport.request(this);
        };
        Request.prototype.reply = function (status, message, fields) {
            var _this = this;
            var data = { status: status, message: message };
            fields.trim().split(',').map(function (l) { return l.trim(); }).forEach(function (k) {
                data[k] = _this[k];
            });
            return new response_1.Response(data);
        };
        Request.__initializer = function(__parent){
            __super=__parent;
        };
        return Request;
        function Request() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Request);
    module.export("Request", Request);
    return {
        setters:[
            function (message_1_1) {
                message_1 = message_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            },
            function (transport_1_1) {
                transport_1 = transport_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (response_1_1) {
                response_1 = response_1_1;
            },
            function (challenge_1_1) {
                challenge_1 = challenge_1_1;
            }],
        execute: function() {
            Request = module.init(Request,message_1.Message);
        }
    }
});
//# sourceMappingURL=request.js.map