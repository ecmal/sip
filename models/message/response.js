system.register("sip/models/message/response", ["../message", "../common/challenge", "../common/utils"], function(system,module) {
    var message_1, challenge_1, utils_1;
    var Response = (function (__super) {
        Object.defineProperty(Response.prototype, "headline", {
            get: function () {
                return this.version + " " + this.status + " " + this.message;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Response.prototype, "authenticate", {
            get: function () {
                return this.getHeader(message_1.Message.HEADERS.WWW_AUTHENTICATE);
            },
            set: function (value) {
                this.setHeader(message_1.Message.HEADERS.WWW_AUTHENTICATE, value);
            },
            enumerable: true,
            configurable: true
        });
        Response.prototype.toString = function () {
            return [
                this.headline
            ].concat(message_1.Message.headersToString(this.headers), [
                '',
                ''
            ]).join('\r\n');
        };
        Response.prototype.print = function (s) {
            var status, c = (s ? utils_1.Paint.magenta : utils_1.Paint.cyan).bind(utils_1.Paint);
            var t = new Date().toISOString().substring(11, 23);
            if (this.status >= 400) {
                status = utils_1.Paint.red(this.status + " " + this.message);
            }
            else if (this.status >= 300) {
                status = utils_1.Paint.yellow(this.status + " " + this.message);
            }
            else if (this.status >= 200) {
                status = utils_1.Paint.green(this.status + " " + this.message);
            }
            else if (this.status >= 100) {
                status = utils_1.Paint.cyan(this.status + " " + this.message);
            }
            console.info('');
            console.info("" + c('============================================ ') + utils_1.Paint.gray(t) + c(" RESPONSE -- " + (s ? '>>' : '<<') + " --"));
            console.info(this.version + " " + utils_1.Paint.bold(status) + " ");
            console.info(c("---------------------------------------------------------- HEADERS -- " + (s ? '>>' : '<<') + " --"));
            console.info(message_1.Message.headersToDebugString(this.headers).join('\n'));
            if (this.content && this.content.length) {
                console.info(c("------------------------------------------------------------- BODY -- " + (s ? '>>' : '<<') + " --"));
                console.info(utils_1.Paint.gray(this.content.toString().trim()));
            }
            console.info(c("-------------------------------------------------------------- END -- " + (s ? '>>' : '<<') + " --"));
            return this;
        };
        Response.__initializer = function(__parent){
            __super=__parent;
        };
        return Response;
        function Response() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', Response);
    module.export("Response", Response);
    return {
        setters:[
            function (message_1_1) {
                message_1 = message_1_1;
            },
            function (challenge_1_1) {
                challenge_1 = challenge_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            Response = module.init(Response,message_1.Message);
        }
    }
});
//# sourceMappingURL=response.js.map