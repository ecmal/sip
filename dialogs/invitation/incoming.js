system.register("sip/dialogs/invitation/incoming", ["./call", "../../station", "../../models/message/request", "../../models/message/response", "../../media/server", "./dialog", "../../models/common/sequence", "../../models/common/mime", "../../models/common/sdp"], function(system,module) {
    var call_1, station_1, request_1, response_1, server_1, dialog_1, sequence_1, mime_1, sdp_1;
    var IncomingInviteDialog = (function (__super) {
        IncomingInviteDialog.prototype.onResponse = function (message) {
            if (message.status == 100) {
                this.call.state = call_1.CallState.TRYING;
                this.station.emit('invite', this.call);
            }
            else if (message.status == 180) {
                this.call.state = call_1.CallState.RINGING;
                this.station.emit('dialing', this.call);
            }
            else if (message.status == 200) {
                if (message.sequence.method == "INVITE") {
                    // todo cleanup
                    this.call.state = call_1.CallState.TALKING;
                    this.station.emit('call', this.call);
                    var sdp = message.content.toString();
                    //this.media.remotePort = parseInt(sdp.match(/m=audio\s+(\d+)/)[1]);
                    //this.media.remoteAddress = sdp.match(/c=IN\s+IP4\s+(\d+\.\d+.\d+\.\d+)/)[1];
                    //this.media.enabled = true;
                    //console.info(`Send Media To ${this.media.remoteAddress}:${this.media.remotePort}`);
                    this.sendAck(message);
                }
            }
            else {
            }
        };
        IncomingInviteDialog.prototype.onRequest = function (message) {
            if (message.method == "ACK") {
                this.onAck(message);
            }
            else if (message.method == "BYE") {
                this.onBye(message);
            }
            else if (message.method == "INVITE") {
                this.onInvite(message);
            }
            else if (message.method == "CANCEL") {
                this.onCancel(message);
            }
        };
        IncomingInviteDialog.prototype.sendAck = function (response) {
            this.station.transport.send(new request_1.Request({
                method: "ACK",
                uri: response.contact.uri,
                from: response.from,
                to: response.to,
                callId: response.callId,
                maxForwards: 70,
                sequence: new sequence_1.Sequence({
                    method: "ACK",
                    value: 1
                })
            }));
        };
        IncomingInviteDialog.prototype.onAck = function (request) {
            //request.print();
            if (request.contentLength > 0) {
                server_1.MediaServer.talkTo(this.call, new sdp_1.Sdp(request.content));
            }
        };
        IncomingInviteDialog.prototype.onBye = function (request) {
            this.sendByeAccept(request);
        };
        IncomingInviteDialog.prototype.onInvite = function (request) {
            if (request.contentLength > 0) {
                server_1.MediaServer.talkTo(this.call, new sdp_1.Sdp(request.content));
            }
            this.sendUpdateAccept(request);
        };
        IncomingInviteDialog.prototype.onCancel = function (request) {
            this.sendCancelAccept(request);
        };
        IncomingInviteDialog.prototype.sendBye = function () {
            this.call.state = call_1.CallState.ENDED;
            var from, to;
            if (this.call.from.uri.username == this.station.contact.uri.username) {
                from = this.call.from;
                to = this.call.to;
            }
            else {
                from = this.call.to;
                to = this.call.from;
            }
            var request = new request_1.Request({
                method: "BYE",
                uri: this.request.contact.uri,
                from: from,
                to: to,
                callId: this.call.id,
                sequence: new sequence_1.Sequence({
                    method: "BYE",
                    value: 1
                })
            });
            request.setHeader("Route", this.request.getHeader("Record-Route"));
            request.setHeader("Max-Forwards", 70);
            request.contentLength = 0;
            this.emit("bye");
            this.done();
            this.station.transport.send(request);
        };
        IncomingInviteDialog.prototype.sendByeAccept = function (message) {
            this.station.transport.send(new response_1.Response({
                status: 200,
                message: 'OK',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId,
            }));
            this.emit('bye');
            this.done();
        };
        IncomingInviteDialog.prototype.sendCancelAccept = function (message) {
            var response = new response_1.Response({
                status: '200',
                message: 'Ok',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId,
                contentLength: 0
            });
            this.station.transport.send(response);
            this.emit('cancel');
            this.done();
        };
        IncomingInviteDialog.prototype.sendUpdateAccept = function (message) {
            var response = new response_1.Response({
                status: 200,
                message: 'OK',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId,
                contentType: mime_1.Mime.SDP,
                content: new Buffer(this.call.localSdp.toString())
            });
            this.emit('update');
            this.station.transport.send(response);
        };
        IncomingInviteDialog.prototype.sendInviteAccept = function (message) {
            var response = new response_1.Response({
                status: 200,
                message: 'OK',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId,
                contentType: mime_1.Mime.SDP,
                content: new Buffer(server_1.MediaServer.listenTo(this.call).toString())
            });
            this.emit('accept');
            this.station.transport.send(response);
        };
        IncomingInviteDialog.prototype.sendInviteReject = function (message) {
            var response = new response_1.Response({
                status: 603,
                message: 'Decline',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId
            });
            this.emit('reject');
            this.done();
            this.station.transport.send(response);
        };
        IncomingInviteDialog.prototype.sendInviteTrying = function (message) {
            var response = new response_1.Response({
                status: 100,
                message: 'Trying',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId
            });
            this.emit('trying');
            this.station.transport.send(response);
        };
        IncomingInviteDialog.prototype.sendInviteRinging = function (message) {
            var response = new response_1.Response({
                status: 180,
                message: 'Ringing',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId
            });
            this.emit('ringing');
            this.station.transport.send(response);
        };
        IncomingInviteDialog.prototype.init = function (request) {
            var _this = this;
            this.station.transport.on("response:" + this.call.id, this.onResponse);
            this.station.transport.on("request:" + this.call.id, this.onRequest);
            var onTake = function () {
                _this.call.off('take', onTake);
                _this.call.off('drop', onDrop);
                _this.sendInviteAccept(request);
                _this.call.once('drop', function () {
                    _this.sendBye();
                });
            };
            var onDrop = function () {
                _this.call.off('take', onTake);
                _this.call.off('drop', onDrop);
                _this.sendInviteReject(request);
            };
            this.call.on('take', onTake);
            this.call.on('drop', onDrop);
            this.station.emit('call', this.call);
            this.emit('init');
            this.sendInviteTrying(request);
            this.sendInviteRinging(request);
        };
        IncomingInviteDialog.prototype.done = function () {
            this.call.off('drop');
            if (this.call.remoteSdp) {
                var sdp = this.call.remoteSdp;
                //delete this.call.remoteSdp;
                //delete this.call.localSdp;
                this.call.emit(call_1.Call.EVENTS.AUDIO.STOP, sdp.audio.port, sdp.connection.connectionAddress, 0, '0.0.0.0');
            }
            this.station.transport.off("response:" + this.call.id, this.onResponse);
            this.station.transport.off("request:" + this.call.id, this.onRequest);
            this.emit('done');
        };
        IncomingInviteDialog.prototype.emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            (_a = this.call).emit.apply(_a, [event].concat(args));
            __super.prototype.emit.apply(this, [event].concat(args));
            var _a;
        };
        IncomingInviteDialog.__initializer = function(__parent){
            __super=__parent;
        };
        return IncomingInviteDialog;
        function IncomingInviteDialog(station, request) {
            __super.call(this, station, new call_1.Call({
                id: request.callId,
                direction: call_1.CallDirection.INCOMING,
                from: request.from,
                to: request.to
            }));
            server_1.MediaServer.listenTo(this.call);
            this.onResponse = this.onResponse.bind(this);
            this.onRequest = this.onRequest.bind(this);
            this.init(this.request = request);
        }
    })();
    module.define('class', IncomingInviteDialog);
    module.export("IncomingInviteDialog", IncomingInviteDialog);
    return {
        setters:[
            function (call_1_1) {
                call_1 = call_1_1;
            },
            function (station_1_1) {
                station_1 = station_1_1;
            },
            function (request_1_1) {
                request_1 = request_1_1;
            },
            function (response_1_1) {
                response_1 = response_1_1;
            },
            function (server_1_1) {
                server_1 = server_1_1;
            },
            function (dialog_1_1) {
                dialog_1 = dialog_1_1;
            },
            function (sequence_1_1) {
                sequence_1 = sequence_1_1;
            },
            function (mime_1_1) {
                mime_1 = mime_1_1;
            },
            function (sdp_1_1) {
                sdp_1 = sdp_1_1;
            }],
        execute: function() {
            IncomingInviteDialog = module.init(IncomingInviteDialog,dialog_1.InviteDialog);
        }
    }
});
//# sourceMappingURL=incoming.js.map