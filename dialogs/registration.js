system.register("sip/dialogs/registration", ["../models/message/request", "../models/common/contact", "../transport", "../models/common/uri", "../models/common/utils", "../models/common/sequence", "../models/message", "../models/message/response", "../station", "../models/common/challenge", "../models/common/event"], function(system,module) {
    var request_1, contact_1, transport_1, uri_1, utils_1, sequence_1, message_1, response_1, station_1, challenge_1, event_1;
    var RegisterRequest = (function (__super) {
        RegisterRequest.__initializer = function(__parent){
            __super=__parent;
        };
        return RegisterRequest;
        function RegisterRequest(contact, expires) {
            if (expires === void 0) { expires = 3600; }
            __super.call(this, {
                method: "REGISTER",
                uri: contact.uri.server,
                from: contact,
                to: contact.clone('name,uri'),
                expires: expires,
                callId: utils_1.Util.guid(),
                maxForwards: 70,
                supported: ['outbound', '100rel', 'path'],
                allow: ['INVITE', 'ACK', 'CANCEL', 'BYE', 'REFER', 'NOTIFY', 'MESSAGE', 'SUBSCRIBE', 'INFO'],
                sequence: new sequence_1.Sequence({
                    method: "REGISTER",
                    value: 1
                }),
                contentLength: 0
            });
        }
    })();
    module.define('class', RegisterRequest);
    module.export("RegisterRequest", RegisterRequest);
    var SubscribeRequest = (function (__super) {
        SubscribeRequest.__initializer = function(__parent){
            __super=__parent;
        };
        return SubscribeRequest;
        function SubscribeRequest(contact, address) {
            __super.call(this, {
                method: "SUBSCRIBE",
                uri: contact.uri,
                from: contact,
                to: contact.clone('name,uri'),
                contact: address,
                callId: utils_1.Util.guid(),
                expires: 300,
                event: new event_1.Event({
                    type: 'message-summary'
                }),
                sequence: new sequence_1.Sequence({
                    method: "SUBSCRIBE",
                    value: 1
                }),
                maxForwards: 70,
                contentLength: 0
            });
        }
    })();
    module.define('class', SubscribeRequest);
    module.export("SubscribeRequest", SubscribeRequest);
    var RegisterDialog = (function (__super) {
        Object.defineProperty(RegisterDialog.prototype, "address", {
            get: function () {
                return this.station.address;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RegisterDialog.prototype, "contact", {
            get: function () {
                return this.station.contact;
            },
            enumerable: true,
            configurable: true
        });
        RegisterDialog.prototype.sign = function (request) {
            if (this.challenge) {
                request.authorization = this.challenge.authorize(request, this.station.contact.uri.username, this.station.contact.uri.password);
            }
        };
        RegisterDialog.prototype.register = function (expires) {
            return this.doRegister(expires);
        };
        RegisterDialog.prototype.doRegister = function (expires) {
            return new RegisterRequest(this.contact, expires).send(this.station.transport);
        };
        RegisterDialog.prototype.doSubscribe = function () {
            return Promise.resolve(true);
            //return new SubscribeRequest(this.contact,this.address).send(this.station.transport);
        };
        RegisterDialog.prototype.sendNotifyOk = function (message) {
            var response = new response_1.Response({
                status: 200,
                message: "OK",
                via: message.via,
                from: message.from,
                to: message.to,
                callId: message.callId,
                expires: 3600,
                sequence: message.sequence,
                contentLength: 0
            });
            this.station.transport.send(response);
        };
        RegisterDialog.prototype.onRequest = function (message) {
            if (message.method == "NOTIFY") {
                this.sendNotifyOk(message);
            }
        };
        RegisterDialog.prototype.onResponse = function (message) {
            if (message.callId == this.request.callId) {
                if (message.status == 401) {
                    this.challenge = message.authenticate;
                    if (!this.request.authorization) {
                        this.sign(this.request);
                        this.request.sequence.value++;
                        this.station.transport.send(this.request);
                    }
                    else {
                        console.info("Invalid credentials for " + this.station.contact);
                    }
                }
                else if (message.status == 200) {
                    if (this.request.method == "REGISTER") {
                        this.doSubscribe();
                    }
                    else if (this.request.method == "NOTIFY") {
                        this.station.emit('register');
                    }
                }
            }
        };
        return RegisterDialog;
        function RegisterDialog(station) {
            this.station = station;
            this.onResponse = this.onResponse.bind(this);
            this.onRequest = this.onRequest.bind(this);
            this.station.on('request', this.onRequest);
        }
    })();
    module.define('class', RegisterDialog);
    module.export("RegisterDialog", RegisterDialog);
    return {
        setters:[
            function (request_1_1) {
                request_1 = request_1_1;
            },
            function (contact_1_1) {
                contact_1 = contact_1_1;
            },
            function (transport_1_1) {
                transport_1 = transport_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (sequence_1_1) {
                sequence_1 = sequence_1_1;
            },
            function (message_1_1) {
                message_1 = message_1_1;
            },
            function (response_1_1) {
                response_1 = response_1_1;
            },
            function (station_1_1) {
                station_1 = station_1_1;
            },
            function (challenge_1_1) {
                challenge_1 = challenge_1_1;
            },
            function (event_1_1) {
                event_1 = event_1_1;
            }],
        execute: function() {
            RegisterRequest = module.init(RegisterRequest,request_1.Request);
            SubscribeRequest = module.init(SubscribeRequest,request_1.Request);
            RegisterDialog = module.init(RegisterDialog);
        }
    }
});
//# sourceMappingURL=registration.js.map