system.register("sip/dialogs/invitation/manager", ["../../models/common/contact", "./call", "../../station", "./dialog", "../../models/message/request", "./incoming", "./outgoing", "../../models/common/utils"], function(system,module) {
    var contact_1, call_1, station_1, dialog_1, request_1, incoming_1, outgoing_1, utils_1;
    var InviteManager = (function (__super) {
        InviteManager.prototype.onRequest = function (message) {
            if (!this.dialog && message.method == "INVITE") {
                this.createDialog(message, incoming_1.IncomingInviteDialog);
            }
        };
        InviteManager.prototype.sendInvite = function (to) {
            if (!this.dialog) {
                this.createDialog(new request_1.Request({
                    callId: utils_1.Util.guid(),
                    from: this.station.contact,
                    to: to
                }), outgoing_1.OutgoingInviteDialog);
            }
        };
        InviteManager.prototype.createDialog = function (request, type) {
            var _this = this;
            this.dialog = new type(this.station, request);
            this.dialog.once('done', function () {
                _this.dialog = null;
            });
        };
        return InviteManager;
        function InviteManager(station) {
            this.station = station;
            this.onRequest = this.onRequest.bind(this);
            this.station.on('request', this.onRequest);
        }
    })();
    module.define('class', InviteManager);
    module.export("InviteManager", InviteManager);
    return {
        setters:[
            function (contact_1_1) {
                contact_1 = contact_1_1;
            },
            function (call_1_1) {
                call_1 = call_1_1;
            },
            function (station_1_1) {
                station_1 = station_1_1;
            },
            function (dialog_1_1) {
                dialog_1 = dialog_1_1;
            },
            function (request_1_1) {
                request_1 = request_1_1;
            },
            function (incoming_1_1) {
                incoming_1 = incoming_1_1;
            },
            function (outgoing_1_1) {
                outgoing_1 = outgoing_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            InviteManager = module.init(InviteManager);
        }
    }
});
//# sourceMappingURL=manager.js.map