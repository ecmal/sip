system.register("sip/dialogs/invitation/call", ["../../models/common/contact", "../../events", "../../models/common/uri", "../../models/common/sdp"], function(system,module) {
    var contact_1, events_1, uri_1, sdp_1;
    var CallState = new (function CallState(){
        this[this.INITIAL = 0] = "INITIAL";
        this[this.TRYING = 1] = "TRYING";
        this[this.TALKING = 2] = "TALKING";
        this[this.RINGING = 3] = "RINGING";
        this[this.DIALING = 4] = "DIALING";
        this[this.ENDED = 5] = "ENDED";
    })();
    module.define("enum", CallState)
    module.export("CallState", CallState);
    var CallDirection = new (function CallDirection(){
        this[this.INCOMING = 0] = "INCOMING";
        this[this.OUTGOING = 1] = "OUTGOING";
    })();
    module.define("enum", CallDirection)
    module.export("CallDirection", CallDirection);
    var Call = (function (__super) {
        Object.defineProperty(Call.prototype, "localUsername", {
            get: function () {
                switch (this.direction) {
                    case CallDirection.OUTGOING: return this.from.uri.username;
                    case CallDirection.INCOMING: return this.to.uri.username;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Call.prototype, "remoteUsername", {
            get: function () {
                switch (this.direction) {
                    case CallDirection.OUTGOING: return this.to.uri.username;
                    case CallDirection.INCOMING: return this.from.uri.username;
                }
            },
            enumerable: true,
            configurable: true
        });
        Call.prototype.take = function () {
            this.emit('take');
        };
        Call.prototype.drop = function () {
            this.emit('drop');
        };
        Call.__initializer = function(__parent){
            __super=__parent;
            Call.EVENTS = {
                AUDIO: {
                    SENT: "audio:send",
                    RECEIVE: "audio:receive",
                    START: "audio:start",
                    STOP: "audio:stop",
                    UPDATE: "audio:update"
                }
            };
        };
        return Call;
        function Call(options) {
            var _this = this;
            __super.call(this);
            this.state = CallState.INITIAL;
            for (var key in options) {
                this[key] = options[key];
            }
            this.on('init', function () {
                _this.state = CallState.INITIAL;
            });
            this.on('trying', function () {
                _this.state = CallState.TRYING;
            });
            this.on('ringing', function () {
                if (_this.direction == CallDirection.OUTGOING) {
                    _this.state = CallState.DIALING;
                }
                else {
                    _this.state = CallState.RINGING;
                }
            });
            this.on('accept', function () {
                _this.state = CallState.TALKING;
            });
            this.on('done', function () {
                _this.state = CallState.ENDED;
            });
        }
    })();
    module.define('class', Call);
    module.export("Call", Call);
    return {
        setters:[
            function (contact_1_1) {
                contact_1 = contact_1_1;
            },
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            },
            function (sdp_1_1) {
                sdp_1 = sdp_1_1;
            }],
        execute: function() {
            Call = module.init(Call,events_1.Emitter);
        }
    }
});
//# sourceMappingURL=call.js.map