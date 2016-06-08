system.register("sip/dialogs/invitation/outgoing", ["./call", "../../station", "../../models/message/request", "../../models/message/response", "../../media/server", "./dialog", "../../models/common/sequence", "../../models/common/mime", "../../models/common/sdp"], function(system,module) {
    var call_1, station_1, request_1, response_1, server_1, dialog_1, sequence_1, mime_1, sdp_1;
    var OutgoingInviteDialog = (function (__super) {
        OutgoingInviteDialog.prototype.onResponse = function (message) {
            if (message.status == 100) {
                this.call.emit('trying');
            }
            else if (message.status == 180) {
                this.call.emit('ringing');
            }
            else if (message.status == 200) {
                if (message.sequence.method == "INVITE") {
                    server_1.MediaServer.talkTo(this.call, new sdp_1.Sdp(message.content));
                    this.call.emit('accept');
                    this.sendAck(message);
                }
            }
            else {
                this.call.emit('reject');
                this.done();
                message.print();
            }
        };
        OutgoingInviteDialog.prototype.onRequest = function (message) {
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
        OutgoingInviteDialog.prototype.onAck = function (request) {
            if (request.contentLength > 0) {
                server_1.MediaServer.talkTo(this.call, new sdp_1.Sdp(request.content));
            }
            //console.info("GOT ACK");
        };
        OutgoingInviteDialog.prototype.onBye = function (request) {
            this.sendByeAccept(request);
        };
        OutgoingInviteDialog.prototype.onInvite = function (request) {
            if (request.contentLength > 0) {
                server_1.MediaServer.talkTo(this.call, new sdp_1.Sdp(request.content));
            }
            this.sendInviteAccept(request);
        };
        OutgoingInviteDialog.prototype.onCancel = function (request) {
            this.sendCancelAccept(request);
        };
        OutgoingInviteDialog.prototype.sendByeAccept = function (message) {
            this.station.transport.send(new response_1.Response({
                status: 200,
                message: 'OK',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId,
            }));
            this.call.emit("bye");
            this.done();
        };
        OutgoingInviteDialog.prototype.sendCancelAccept = function (message) {
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
        };
        OutgoingInviteDialog.prototype.sendAck = function (response) {
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
                }),
                route: response.recordRoute ? response.recordRoute : undefined
            }));
        };
        OutgoingInviteDialog.prototype.sendBye = function () {
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
                uri: to.uri,
                from: from,
                to: to,
                callId: this.call.id,
                sequence: new sequence_1.Sequence({
                    method: "BYE",
                    value: 1
                })
            });
            request.setHeader("Max-Forwards", 70);
            request.contentLength = 0;
            this.call.emit('bye');
            this.done();
            this.station.transport.send(request);
        };
        OutgoingInviteDialog.prototype.sendInvite = function () {
            this.station.transport.send(new request_1.Request({
                method: "INVITE",
                sequence: new sequence_1.Sequence({
                    method: "INVITE",
                    value: 1
                }),
                uri: this.call.to.uri,
                callId: this.call.id,
                from: this.call.from,
                to: this.call.to,
                supported: ['outbound', 'replaces', 'join'],
                maxForwards: 70,
                contentType: mime_1.Mime.SDP,
                content: new Buffer(server_1.MediaServer.listenTo(this.call).toString())
            }));
        };
        OutgoingInviteDialog.prototype.sendInviteAccept = function (message) {
            this.call.emit("update");
            var response = new response_1.Response({
                status: 200,
                message: 'OK',
                via: message.vias,
                from: message.from,
                to: message.to,
                sequence: message.sequence,
                callId: message.callId,
                contentType: new mime_1.Mime({
                    type: 'application',
                    subtype: 'sdp'
                }),
                content: new Buffer(this.call.localSdp.toString())
            });
            this.station.transport.send(response);
        };
        OutgoingInviteDialog.prototype.init = function (request) {
            var _this = this;
            this.station.transport.on("response:" + this.call.id, this.onResponse);
            this.station.transport.on("request:" + this.call.id, this.onRequest);
            this.station.emit('call', this.call);
            this.call.once('drop', function () {
                _this.sendBye();
            });
            this.emit('init');
            this.sendInvite();
        };
        OutgoingInviteDialog.prototype.done = function () {
            if (this.call.remoteSdp) {
                var sdp = this.call.remoteSdp;
                delete this.call.remoteSdp;
                delete this.call.localSdp;
                this.call.emit(call_1.Call.EVENTS.AUDIO.STOP, sdp.audio.port, sdp.connection.connectionAddress, 0, '0.0.0.0');
            }
            this.station.transport.off("response:" + this.call.id, this.onResponse);
            this.station.transport.off("request:" + this.call.id, this.onRequest);
            this.call.emit('done');
            this.emit('done');
        };
        OutgoingInviteDialog.__initializer = function(__parent){
            __super=__parent;
        };
        return OutgoingInviteDialog;
        function OutgoingInviteDialog(station, request) {
            __super.call(this, station, new call_1.Call({
                id: request.callId,
                direction: call_1.CallDirection.OUTGOING,
                from: request.from,
                to: request.to
            }));
            this.onResponse = this.onResponse.bind(this);
            this.onRequest = this.onRequest.bind(this);
            this.init(request);
        }
    })();
    module.define('class', OutgoingInviteDialog);
    module.export("OutgoingInviteDialog", OutgoingInviteDialog);
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
            OutgoingInviteDialog = module.init(OutgoingInviteDialog,dialog_1.InviteDialog);
        }
    }
});
//# sourceMappingURL=outgoing.js.map