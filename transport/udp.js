system.register("sip/transport/udp", ["../models/message", "../models/common/utils", "./transport", "../node"], function(system,module) {
    var message_1, utils_1, transport_1, node_1;
    var UdpTransport = (function (__super) {
        Object.defineProperty(UdpTransport.prototype, "debug", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UdpTransport.prototype, "connected", {
            get: function () {
                return !!this.socket;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UdpTransport.prototype, "protocol", {
            get: function () {
                return 'UDP';
            },
            enumerable: true,
            configurable: true
        });
        UdpTransport.prototype.send = function (message) {
            if (this.connected) {
                __super.prototype.send.call(this, message);
            }
            else {
                this.queue.push(message);
            }
        };
        UdpTransport.prototype.doInit = function () {
            this.queue = [];
            this.doConnect(); //6028928700
        };
        UdpTransport.prototype.doConnect = function () {
            var _this = this;
            utils_1.Util.getLocalIpAddress().then(function (local) {
                _this.uri.host = local;
                _this.socket = node_1.default.Udp.createSocket("udp4");
                _this.socket.on('error', _this.onError.bind(_this));
                _this.socket.on('listening', _this.onConnect.bind(_this));
                _this.socket.bind(_this.localPort || 5060, local);
            }).catch(function (e) { return console.info(e); });
        };
        UdpTransport.prototype.onConnect = function () {
            this.socket.once('close', this.onClose.bind(this));
            this.socket.on('message', this.processor);
            this.via.host = this.localAddress;
            this.via.port = this.localPort;
            this.socket['connected'] = true;
            this.emit('connect', this);
            while (this.queue.length) {
                this.send(this.queue.shift());
            }
        };
        UdpTransport.prototype.onError = function (error) {
            this.emit('error', error, this);
            this.onClose();
        };
        UdpTransport.prototype.onClose = function () {
            this.doDestroy();
            this.emit('disconnect', this);
        };
        UdpTransport.prototype.doDestroy = function () {
            if (this.socket) {
                this.socket = null;
            }
        };
        UdpTransport.prototype.doSend = function (buffer) {
            this.socket.send(buffer, 0, buffer.length, this.remotePort, this.remoteAddress);
        };
        UdpTransport.__initializer = function(__parent){
            __super=__parent;
        };
        return UdpTransport;
        function UdpTransport() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', UdpTransport);
    module.export("UdpTransport", UdpTransport);
    return {
        setters:[
            function (message_1_1) {
                message_1 = message_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (transport_1_1) {
                transport_1 = transport_1_1;
            },
            function (node_1_1) {
                node_1 = node_1_1;
            }],
        execute: function() {
            UdpTransport = module.init(UdpTransport,transport_1.Transport);
        }
    }
});
//# sourceMappingURL=udp.js.map