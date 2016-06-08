system.register("sip/station", ["./events", "./transport", "./models", "./dialogs/registration", "./models/message/request", "./models/common/utils", "./dialogs/invitation"], function(system,module) {
    var events_1, transport_1, models_1, registration_1, request_1, utils_1, invitation_1;
    var State = new (function State(){
        this[this.REGISTERING = 0] = "REGISTERING";
        this[this.UNREGISTERING = 1] = "UNREGISTERING";
        this[this.OFFLINE = 2] = "OFFLINE";
        this[this.ONLINE = 3] = "ONLINE";
        this[this.DIALING = 4] = "DIALING";
        this[this.TALKING = 5] = "TALKING";
        this[this.RINGING = 6] = "RINGING";
    })();
    module.define("enum", State)
    module.export("State", State);
    var Station = (function (__super) {
        Station.prototype.connected = function () {
            return this.transport.connected;
        };
        Object.defineProperty(Station.prototype, "isOffline", {
            get: function () {
                return this.state == State.OFFLINE;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Station.prototype, "isRegistered", {
            get: function () {
                return !(this.state == State.OFFLINE || this.state == State.REGISTERING);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Station.prototype, "name", {
            get: function () {
                return this.contact.displayName;
            },
            enumerable: true,
            configurable: true
        });
        Station.prototype.setContact = function (contact) {
            if (contact instanceof models_1.Contact) {
                this.contact = contact;
            }
            else {
                this.contact = new models_1.Contact(contact);
            }
            this.contact.tag = utils_1.Util.hash(8);
            return this;
        };
        Station.prototype.setTransport = function (transport) {
            if (!this.transport) {
                this.transport = transport;
                this.registration = new registration_1.RegisterDialog(this);
                this.calls = new invitation_1.InviteManager(this);
                this.transport.on(transport_1.Transport.CONNECT, this.onConnect);
                this.transport.on('request', this.onRequest);
                this.transport.on('response', this.onResponse);
            }
            return this;
        };
        Station.prototype.register = function (expires) {
            var _this = this;
            if (expires === void 0) { expires = 0; }
            if (expires > 0) {
                this.state = State.REGISTERING;
                return this.registration.register(expires).then(function (r) {
                    _this.state = _this.state = State.ONLINE;
                    _this.emit('register');
                });
            }
            else {
                this.state = State.UNREGISTERING;
                return this.registration.register(expires).then(function (r) {
                    _this.state = _this.state = State.OFFLINE;
                    _this.emit('unregister');
                });
            }
        };
        Station.prototype.toString = function (options) {
            return "Station(" + this.contact.toString(options) + ")";
        };
        Station.prototype.inspect = function () {
            return this.toString({ inspect: true });
        };
        Station.prototype.onConnect = function () {
            this.address = new models_1.Contact(this.contact.toString());
            this.address.uri.host = this.transport.localAddress;
            this.address.uri.port = this.transport.localPort;
            this.emit('connect');
        };
        Station.prototype.onRequest = function (request) {
            if (request.uri.username == this.contact.uri.username) {
                this.emit('request', request);
            }
        };
        Station.prototype.onResponse = function (response) {
            this.emit('response', response);
        };
        Station.__initializer = function(__parent){
            __super=__parent;
        };
        return Station;
        function Station(contact, transport) {
            __super.call(this);
            this.state = State.OFFLINE;
            this.onConnect = this.onConnect.bind(this);
            this.onRequest = this.onRequest.bind(this);
            this.onResponse = this.onResponse.bind(this);
            this.setContact(contact);
            this.setTransport(transport);
        }
    })();
    module.define('class', Station);
    module.export("Station", Station);
    return {
        setters:[
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (transport_1_1) {
                transport_1 = transport_1_1;
            },
            function (models_1_1) {
                models_1 = models_1_1;
            },
            function (registration_1_1) {
                registration_1 = registration_1_1;
            },
            function (request_1_1) {
                request_1 = request_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (invitation_1_1) {
                invitation_1 = invitation_1_1;
            }],
        execute: function() {
            Station = module.init(Station,events_1.Emitter);
        }
    }
});
//# sourceMappingURL=station.js.map