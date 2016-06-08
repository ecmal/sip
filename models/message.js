system.register("sip/models/message", ["../transport", "./model", "./common/version", "./common/agent", "./common/via", "./common/sequence", "./common/contact", "./common/event", "./common/utils", "./common/mime"], function(system,module) {
    var transport_1, model_1, version_1, agent_1, via_1, sequence_1, contact_1, event_1, utils_1, mime_1;
    var Message = (function (__super) {
        Message.headersToString = function (headers) {
            var header = function (k, h) {
                if (['Allow', 'Supported'].indexOf(k) >= 0) {
                    h = Array.isArray(h) ? h.join(', ') : h;
                }
                if (Array.isArray(h)) {
                    return h.map(function (i) { return header(k, i); });
                }
                else {
                    return [(k + ": " + h)];
                }
            };
            return Object.keys(headers).sort().map(function (k) {
                return header(k, headers[k]).join('\r\n');
            });
        };
        Message.headersToDebugString = function (headers) {
            var header = function (k, h) {
                if (['Allow', 'Supported'].indexOf(k) >= 0) {
                    h = Array.isArray(h) ? h.join(', ') : h;
                }
                if (Array.isArray(h)) {
                    return h.map(function (i) { return header(k, i); });
                }
                else {
                    return [(utils_1.Paint.underline(utils_1.Paint.gray(k)) + ": " + utils_1.Paint.gray(h))];
                }
            };
            return Object.keys(headers).sort().map(function (k) {
                return header(k, headers[k]).join('\r\n');
            });
        };
        Object.defineProperty(Message.prototype, "headers", {
            get: function () {
                return Object.defineProperty(this, 'headers', {
                    value: Object.create(null)
                }).headers;
            },
            set: function (v) {
                for (var k in v) {
                    this.headers[k] = v[k];
                }
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Message.prototype, "headline", {
            get: function () {
                throw new Error('abstract property "headline');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "callId", {
            get: function () {
                return this.getHeader(Message.HEADERS.CALL_ID);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.CALL_ID, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "sequence", {
            get: function () {
                return this.getHeader(Message.HEADERS.CSEQ);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.CSEQ, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "from", {
            get: function () {
                return this.getHeader(Message.HEADERS.FROM);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.FROM, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "to", {
            get: function () {
                return this.getHeader(Message.HEADERS.TO);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.TO, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "contact", {
            get: function () {
                var contacts = this.getHeader(Message.HEADERS.CONTACT);
                if (Array.isArray(contacts)) {
                    return contacts[0];
                }
                else {
                    return contacts;
                }
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.CONTACT, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "route", {
            get: function () {
                return this.getHeader(Message.HEADERS.ROUTE);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.ROUTE, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "recordRoute", {
            get: function () {
                return this.getHeader(Message.HEADERS.RECORD_ROUTE);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.RECORD_ROUTE, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "event", {
            get: function () {
                var events = this.getHeader(Message.HEADERS.EVENT);
                if (Array.isArray(events)) {
                    return events[0];
                }
                else {
                    return events;
                }
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.EVENT, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "supported", {
            get: function () {
                return this.getHeader(Message.HEADERS.SUPPORTED);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.SUPPORTED, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "allow", {
            get: function () {
                return this.getHeader(Message.HEADERS.ALLOW);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.ALLOW, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "allowEvents", {
            get: function () {
                return this.getHeader(Message.HEADERS.ALLOW_EVENTS);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.ALLOW_EVENTS, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "contentLength", {
            get: function () {
                return this.getHeader(Message.HEADERS.CONTENT_LENGTH);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.CONTENT_LENGTH, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "contentType", {
            get: function () {
                return this.getHeader(Message.HEADERS.CONTENT_TYPE);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.CONTENT_TYPE, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "maxForwards", {
            get: function () {
                return this.getHeader(Message.HEADERS.MAX_FORWARDS);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.MAX_FORWARDS, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "agent", {
            get: function () {
                return this.getHeader(Message.HEADERS.USER_AGENT);
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.USER_AGENT, value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "vias", {
            get: function () {
                return this.getHeader(Message.HEADERS.VIA);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Message.prototype, "via", {
            get: function () {
                var vias = this.getHeader(Message.HEADERS.VIA);
                if (Array.isArray(vias)) {
                    return vias[0];
                }
                else {
                    return vias;
                }
            },
            set: function (value) {
                this.setHeader(Message.HEADERS.VIA, value);
            },
            enumerable: true,
            configurable: true
        });
        Message.prototype.getHeader = function (name) {
            return this.headers[name];
        };
        Message.prototype.setHeader = function (name, value) {
            this.headers[name] = value;
        };
        Message.prototype.print = function (b) { };
        Message.prototype.toBuffer = function () {
            var head = new Buffer(this.toString());
            if (this.content) {
                return Buffer.concat([head, this.content], head.length + this.content.length);
            }
            else {
                return head;
            }
        };
        Message.__initializer = function(__parent){
            __super=__parent;
            Message.HEADERS = {
                VIA: 'Via',
                USER_AGENT: 'User-Agent',
                CONTENT_LENGTH: 'Content-Length',
                CONTENT_TYPE: 'Content-Type',
                CALL_ID: 'Call-ID',
                CSEQ: 'CSeq',
                FROM: 'From',
                TO: 'To',
                CONTACT: 'Contact',
                ROUTE: 'Route',
                RECORD_ROUTE: 'Record-Route',
                EXPIRES: 'Expires',
                WWW_AUTHENTICATE: 'WWW-Authenticate',
                AUTHORIZATION: 'Authorization',
                ALLOW: 'Allow',
                ALLOW_EVENTS: 'Allow-Events',
                EVENT: 'Event',
                MAX_FORWARDS: 'Max-Forwards',
                SUPPORTED: 'Supported'
            };
        };
        return Message;
        function Message(data) {
            data.version = data.version || version_1.Version.SIP_2_0;
            __super.call(this, data);
        }
    })();
    module.define('class', Message);
    module.export("Message", Message);
    return {
        setters:[
            function (transport_1_1) {
                transport_1 = transport_1_1;
            },
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (version_1_1) {
                version_1 = version_1_1;
            },
            function (agent_1_1) {
                agent_1 = agent_1_1;
            },
            function (via_1_1) {
                via_1 = via_1_1;
            },
            function (sequence_1_1) {
                sequence_1 = sequence_1_1;
            },
            function (contact_1_1) {
                contact_1 = contact_1_1;
            },
            function (event_1_1) {
                event_1 = event_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (mime_1_1) {
                mime_1 = mime_1_1;
            }],
        execute: function() {
            Message = module.init(Message,model_1.Model);
        }
    }
});
//# sourceMappingURL=message.js.map