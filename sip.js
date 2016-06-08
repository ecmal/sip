system.register("sip/sip", ["./events", "./parser", "node/net", "sip/models/message", "sip/models/message/response"], function(system,module) {
    var events_1, parser_1, NET, net_1, message_1, response_1;
    var SipClient = (function (__super) {
        SipClient.getMessage = function (text) {
            return text.trim().split('\n').map(function (l) { return l.trim(); }).join('\r\n') + '\r\n\r\n';
        };
        SipClient.indexOf = function (buffer) {
            var sep = SipClient.separator;
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
        SipClient.prototype.connect = function (host, port) {
            var _this = this;
            console.info(host, port);
            this.socket = NET.connect(port, host);
            this.socket.on('connect', function (data) {
                _this.emit('connect');
            });
            var temp = new Buffer(0);
            this.socket.on('data', function (chunk) {
                var sep, message, data = Buffer.concat([temp, chunk], temp.length + chunk.length);
                while ((sep = SipClient.indexOf(data)) > 0) {
                    message = data.toString('utf8', 0, sep + 2);
                    data = data.slice(sep + 2);
                }
                console.log(message);
                console.log(parser_1.Parser.parse(message, message_1.Message) instanceof response_1.Response);
                _this.emit('SIPresponse', message);
            });
        };
        SipClient.prototype.register = function () {
            this.send(SipClient.getMessage("\n            REGISTER sip:win.freedomdebtrelief.com SIP/2.0\n            Via: SIP/2.0/TCP 192.168.10.105:50405;alias;branch=z9hG4bK.~3I3SLROQ;rport\n            From: <sip:101@win.freedomdebtrelief.com>;tag=7Lq7OgaDW\n            To: sip:101@win.freedomdebtrelief.com\n            CSeq: 20 REGISTER\n            Call-ID: eRebdDPcxy\n            Max-Forwards: 70\n            Supported: outbound\n            Accept: application/sdp\n            Accept: text/plain\n            Accept: application/vnd.gsma.rcs-ft-http+xml\n            Contact: <sip:101@192.168.10.105:50405;transport=tcp>;+sip.instance=\"<urn:uuid:9548ce0d-4303-475b-bbd4-ca6559d3f960>\"\n            Expires: 3600\n            User-Agent: Linphone/3.9.0 (belle-sip/1.4.2)\n            Content-Length: 0\n        "));
        };
        SipClient.prototype.send = function (text) {
            this.socket.write(text);
        };
        SipClient.__initializer = function(__parent){
            __super=__parent;
            SipClient.separator = new Buffer('\r\n\r\n');
        };
        return SipClient;
        function SipClient() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', SipClient);
    module.export("SipClient", SipClient);
    return {
        setters:[
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (parser_1_1) {
                parser_1 = parser_1_1;
            },
            function (NET_1) {
                NET = NET_1;
                net_1 = NET_1;
            },
            function (message_1_1) {
                message_1 = message_1_1;
            },
            function (response_1_1) {
                response_1 = response_1_1;
            }],
        execute: function() {
            SipClient = module.init(SipClient,events_1.Emitter);
        }
    }
});
//# sourceMappingURL=sip.js.map