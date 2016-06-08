system.register("sip/media/server", ["../models/common/utils", "../dialogs/invitation/call", "../models/common/sdp", "./rtp", "./rtcp", "../node"], function(system,module) {
    var utils_1, call_1, sdp_1, rtp_1, rtcp_1, node_1;
    var process;
    var MediaServer = (function (__super) {
        MediaServer.listenTo = function (call) {
            call.on("audio:start", function (port, host) {
                MediaServer.calls[(host + ":" + port)] = call;
            });
            call.on("audio:stop", function (port, host, nPort, nHost) {
                delete MediaServer.calls[(host + ":" + port)];
            });
            call.on("audio:update", function (port, host, oPort, oHost) {
                delete MediaServer.calls[(oPort + ":" + oPort)];
                MediaServer.calls[(host + ":" + port)] = call;
            });
            return call.localSdp = new sdp_1.Sdp({
                version: 0,
                origin: {
                    username: call.localUsername,
                    sessionId: utils_1.Util.random() & 0xFFFFFF,
                    sessionVersion: utils_1.Util.random() & 0xFFFFFF,
                    networkType: "IN",
                    addressType: "IP4",
                    unicastAddress: this.instance.host
                },
                sessionName: call.localUsername,
                connection: {
                    networkType: "IN",
                    addressType: "IP4",
                    connectionAddress: this.instance.host
                },
                timing: {
                    start: 0,
                    stop: 0
                },
                media: [
                    {
                        type: "audio",
                        port: this.instance.rtpPort,
                        protocol: "RTP/AVP",
                        payloads: [
                            {
                                "id": 0,
                                "rtp": {
                                    "codec": "PCMU",
                                    "rate": 8000
                                }
                            }
                        ]
                    }
                ]
            });
        };
        MediaServer.talkTo = function (call, sdp) {
            var newHost = sdp.connection.connectionAddress;
            var newPort = sdp.audio.port;
            var newAddr = newHost + ":" + newPort;
            if (!call.remoteSdp) {
                call.remoteSdp = sdp;
                call.emit("audio:start", newPort, newHost);
            }
            else {
                var oldHost = call.remoteSdp.connection.connectionAddress;
                var oldPort = call.remoteSdp.audio.port;
                var oldAddr = oldHost + ":" + oldPort;
                call.remoteSdp = sdp;
                if (oldAddr != newAddr) {
                    if (newHost == '0.0.0.0' || !newPort) {
                        call.emit("audio:stop", oldPort, oldHost, newPort, newHost);
                    }
                    else {
                        call.emit("audio:update", newPort, newHost, oldPort, oldHost);
                    }
                }
            }
        };
        Object.defineProperty(MediaServer, "instance", {
            get: function () {
                return Object.defineProperty(this, 'instance', {
                    value: new MediaServer()
                }).instance;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MediaServer.prototype, "debug", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        MediaServer.prototype.send = function (message, port, host) {
            this.rtp.send(message, 0, message.length, port, host);
        };
        MediaServer.prototype.listen = function (host, rtpPort, rtcpPort) {
            var _this = this;
            var detect = host ? Promise.resolve(host) : utils_1.Util.getLocalIpAddress();
            return detect.then(function (host) {
                _this.host = host;
                _this.rtpPort = rtpPort = rtpPort || MediaServer.RTP_PORT;
                _this.rtcpPort = rtcpPort = rtcpPort || (rtpPort + 1);
                _this.rtp.bind(rtpPort, host);
                _this.rtcp.bind(rtcpPort, host);
                console.info("LISTENING RTP:" + rtpPort + " / RCTP:" + rtcpPort);
            });
        };
        MediaServer.__initializer = function(__parent){
            __super=__parent;
            MediaServer.calls = Object.create(null);
            MediaServer.RTP_PORT = 18089;
            MediaServer.RTCP_PORT = 18090;
        };
        return MediaServer;
        function MediaServer() {
            var _this = this;
            this.enabled = false;
            this.rtp = node_1.default.Udp.createSocket("udp4");
            this.rtcp = node_1.default.Udp.createSocket("udp4");
            var call, pack;
            //this.file = require('fs').createWriteStream('media.txt');
            this.rtcp.on("message", function (msg, rinfo) {
                //this.file.write(`RTCP ${rinfo.address} ${rinfo.port} ${msg.toString('hex')}\n`);
                if (_this.debug) {
                    console.info('');
                    var len = rtcp_1.RtcpPacket.getLength(msg);
                    while (len) {
                        var pkt = msg.slice(0, len);
                        try {
                            console.info("RTCP(" + JSON.stringify(new rtcp_1.RtcpPacket(pkt), null, 2) + ")");
                        }
                        catch (ex) {
                            console.info(ex.stack);
                            console.info('-- PACKET ------------');
                            console.info(pkt.toString('hex'));
                        }
                        if (len < msg.length) {
                            msg = msg.slice(len);
                            len = rtcp_1.RtcpPacket.getLength(msg);
                        }
                        else {
                            len = 0;
                        }
                    }
                }
            });
            this.rtp.on("message", function (msg, rinfo) {
                //this.file.write(`RTP  ${rinfo.address} ${rinfo.port} ${msg.toString('hex')}\n`);
                var id = rinfo.address + ":" + rinfo.port;
                if (call = MediaServer.calls[id]) {
                    pack = new rtp_1.RtpPacket(msg);
                    call.emit(call_1.Call.EVENTS.AUDIO.RECEIVE, pack);
                    if (_this.debug && false) {
                        process.stdout.write("\rRTP  : c:" + call.id + " m:" + pack.marker + " t:" + pack.type + " s:" + pack.source + " i:" + pack.sequence + " t:" + pack.timestamp + " d:" + pack.data.length);
                    }
                }
            });
        }
    })();
    module.define('class', MediaServer);
    module.export("MediaServer", MediaServer);
    return {
        setters:[
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (call_1_1) {
                call_1 = call_1_1;
            },
            function (sdp_1_1) {
                sdp_1 = sdp_1_1;
            },
            function (rtp_1_1) {
                rtp_1 = rtp_1_1;
            },
            function (rtcp_1_1) {
                rtcp_1 = rtcp_1_1;
            },
            function (node_1_1) {
                node_1 = node_1_1;
            }],
        execute: function() {
            process = system.node.process;
            MediaServer = module.init(MediaServer);
        }
    }
});
//# sourceMappingURL=server.js.map