system.register("sip/transport/transport", ["../events", "../parser", "../models/message", "../models/common/via", "../models/common/agent", "../models/message/request", "../models/common/uri", "../models/message/response", "../models/common/utils"], function(system,module) {
    var events_1, parser_1, message_1, via_1, agent_1, request_1, uri_1, response_1, utils_1;
    var Transport = (function (__super) {
        Transport.indexOf = function (buffer) {
            var sep = Transport.separator;
            for (var i = 0; i < buffer.length - sep.length + 1; i++) {
                var found = true;
                for (var m = 0; m < sep.length; m++) {
                    if (buffer[i + m] != sep[m]) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    return i;
                }
            }
            return -1;
        };
        Object.defineProperty(Transport.prototype, "uri", {
            get: function () {
                return Object.defineProperty(this, 'uri', {
                    value: new uri_1.Uri({
                        host: '0.0.0.0',
                        port: 5060
                    })
                }).uri;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "proxy", {
            get: function () {
                return Object.defineProperty(this, 'proxy', {
                    value: new uri_1.Uri({
                        host: '0.0.0.0',
                        port: 5060
                    })
                }).proxy;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "protocol", {
            get: function () {
                throw new Error('Abstract property "protocol"');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "connected", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "localAddress", {
            get: function () {
                return this.uri.host;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "localPort", {
            get: function () {
                return this.uri.port;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "remoteAddress", {
            get: function () {
                return this.proxy.host;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "remotePort", {
            get: function () {
                return this.proxy.port;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "debug", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Transport.prototype.request = function (request) {
            var _this = this;
            return new Promise(function (accept, reject) {
                _this.once("response:" + request.callId, function (response) {
                    if (response.status > 400) {
                        reject(response);
                    }
                    else {
                        accept(response);
                    }
                });
                setTimeout(function () {
                    _this.emit("response:" + request.callId, new response_1.Response({
                        status: 408,
                        message: 'Request Timeout',
                        callId: request.callId
                    }));
                }, 60000);
                _this.send(request);
            });
        };
        Transport.prototype.send = function (message) {
            message.agent = this.agent;
            if (message.content) {
                message.contentLength = message.content.length;
            }
            else {
                message.contentLength = 0;
            }
            if (message instanceof request_1.Request) {
                if (!message.contact) {
                    message.contact = message.from.clone();
                    message.contact.uri.host = this.localAddress;
                    message.contact.uri.port = this.localPort;
                }
                if (!message.via) {
                    message.via = this.via;
                }
                else {
                    message.vias.push(this.via);
                }
            }
            if (this.debug) {
                message.print(true);
            }
            this.doSend(message.toBuffer());
        };
        Transport.prototype.toString = function (options) {
            return "Station(" + this.uri.toString(options) + ")";
        };
        Object.defineProperty(Transport.prototype, "via", {
            get: function () {
                return Object.defineProperty(this, 'via', {
                    value: new via_1.Via({
                        protocol: 'SIP',
                        version: '2.0',
                        transport: this.protocol,
                        host: this.remoteAddress,
                        port: this.remotePort,
                        params: {
                            branch: "z9hG4bK." + utils_1.Util.hash(8),
                            alias: undefined,
                            rport: undefined
                        }
                    })
                }).via;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "agent", {
            get: function () {
                return Object.defineProperty(this, 'agent', {
                    value: new agent_1.Agent({
                        name: 'WCB',
                        version: "1.0.0"
                    })
                }).agent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transport.prototype, "processor", {
            get: function () {
                var _this = this;
                var head = new Buffer(0);
                var message = null;
                return Object.defineProperty(this, 'processor', {
                    value: function (chunk) {
                        var sep, data = Buffer.concat([head, chunk], head.length + chunk.length);
                        function messageDone() {
                            return message.contentLength == message.content.length;
                        }
                        function writeHead(header) {
                            try {
                                message = parser_1.Parser.parse(header, message_1.Message);
                            }
                            catch (ex) {
                                console.info(header);
                                console.info(ex.stack);
                            }
                        }
                        function writeBody(chunk) {
                            if (!message.content) {
                                message.content = new Buffer(0);
                            }
                            if (typeof message.contentLength != "number") {
                                console.info(message);
                            }
                            var totalLength = message.contentLength;
                            var bodyLength = message.content.length;
                            var pendingLength = totalLength - bodyLength;
                            var availableLength = Math.min(pendingLength, chunk.length);
                            var newLength = bodyLength + availableLength;
                            message.content = Buffer.concat([message.content, chunk.slice(0, availableLength)], newLength);
                            //console.info("CHUNK",totalLength,bodyLength,pendingLength,availableLength,newLength,message.content.length,chunk.length);
                            return chunk.slice(availableLength);
                        }
                        if (message) {
                            data = writeBody(data);
                        }
                        while ((sep = Transport.indexOf(data)) > 0) {
                            writeHead(data.toString('utf8', 0, sep + 2));
                            data = data.slice(sep + 4);
                            data = writeBody(data);
                            if (messageDone()) {
                                _this.onMessage(message);
                                message = null;
                            }
                        }
                        head = data;
                    }
                }).processor;
            },
            enumerable: true,
            configurable: true
        });
        Transport.prototype.onMessage = function (message) {
            if (this.debug) {
                message.print();
            }
            if (message instanceof request_1.Request) {
                this.onRequest(message);
            }
            else if (message instanceof response_1.Response) {
                this.onResponse(message);
            }
        };
        Transport.prototype.onRequest = function (request) {
            if (!request.uri.username && request.method == "OPTIONS") {
                this.send(request.reply(200, 'OK', 'to,from,callId,sequence,via,maxForwards'));
            }
            if (request.callId) {
                this.emit("request:" + request.callId, request);
            }
            this.emit('request', request);
        };
        Transport.prototype.onResponse = function (response) {
            if (response.callId) {
                this.emit("response:" + response.callId, response);
            }
            this.emit('response', response);
        };
        Transport.prototype.doSend = function (buffer) {
            throw new Error('Abstract method "send"');
        };
        Transport.prototype.doInit = function () {
            throw new Error('Abstract method "send"');
        };
        Transport.prototype.inspect = function () {
            return this.toString({ inspect: true });
        };
        Transport.__initializer = function(__parent){
            __super=__parent;
            Transport.CONNECT = 'connected';
            Transport.DISCONNECT = 'disconnect';
            Transport.separator = new Buffer('\r\n\r\n');
        };
        return Transport;
        function Transport(proxy) {
            __super.call(this);
            if (proxy) {
                if (typeof proxy == 'string') {
                    this.proxy.set(new uri_1.Uri(proxy));
                }
                else {
                    this.proxy.set(proxy);
                }
            }
            this.doInit();
        }
    })();
    module.define('class', Transport);
    module.export("Transport", Transport);
    return {
        setters:[
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (parser_1_1) {
                parser_1 = parser_1_1;
            },
            function (message_1_1) {
                message_1 = message_1_1;
            },
            function (via_1_1) {
                via_1 = via_1_1;
            },
            function (agent_1_1) {
                agent_1 = agent_1_1;
            },
            function (request_1_1) {
                request_1 = request_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            },
            function (response_1_1) {
                response_1 = response_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            Transport = module.init(Transport,events_1.Emitter);
        }
    }
});
//# sourceMappingURL=transport.js.map