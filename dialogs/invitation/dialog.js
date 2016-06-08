system.register("sip/dialogs/invitation/dialog", ["../../models/common/utils", "../../station", "./call", "../../events"], function(system,module) {
    var utils_1, station_1, call_1, events_1;
    var InviteDialog = (function (__super) {
        InviteDialog.encodeSdp = function (sdp) {
            return sdp.join('\r\n') + '\r\n';
        };
        InviteDialog.decodeSdp = function (sdp) {
            return sdp.trim().split(/\r?\n/).map(function (p) { return p.trim(); });
        };
        InviteDialog.getSdp = function (username, host, port) {
            if (port === void 0) { port = 18089; }
            return new Buffer(InviteDialog.encodeSdp(InviteDialog.decodeSdp("\n            v=0\n            o=" + username + " " + utils_1.Util.random() + " " + utils_1.Util.random() + " IN IP4 " + host + "\n            s=Talk\n            c=IN IP4 " + host + "\n            t=0 0\n            m=audio " + port + " RTP/AVP 0 101\n            a=rtpmap:0 PCMU/8000\n            a=rtpmap:101 telephone-event/8000\n            a=fmtp:101 0-15\n        ")));
        };
        InviteDialog.__initializer = function(__parent){
            __super=__parent;
        };
        return InviteDialog;
        function InviteDialog(station, call) {
            __super.call(this);
            this.station = station;
            this.call = call;
        }
    })();
    module.define('class', InviteDialog);
    module.export("InviteDialog", InviteDialog);
    return {
        setters:[
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (station_1_1) {
                station_1 = station_1_1;
            },
            function (call_1_1) {
                call_1 = call_1_1;
            },
            function (events_1_1) {
                events_1 = events_1_1;
            }],
        execute: function() {
            InviteDialog = module.init(InviteDialog,events_1.Emitter);
        }
    }
});
//# sourceMappingURL=dialog.js.map