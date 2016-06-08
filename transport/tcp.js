system.register("sip/transport/tcp", ["../models/message", "../models/common/utils", "./transport", "../node"], function(system,module) {
    var message_1, utils_1, transport_1, node_1;
    var TcpTransport = (function (__super) {
        Object.defineProperty(TcpTransport.prototype, "debug", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TcpTransport.prototype, "protocol", {
            get: function () {
                return 'TCP';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TcpTransport.prototype, "connected", {
            get: function () {
                return this.socket['connected'];
            },
            enumerable: true,
            configurable: true
        });
        TcpTransport.prototype.send = function (message) {
            if (this.connected) {
                __super.prototype.send.call(this, message);
            }
            else {
                this.queue.push(message);
            }
        };
        TcpTransport.prototype.doInit = function () {
            var _this = this;
            this.queue = [];
            Object.defineProperties(this.uri, {
                host: { get: function () { return _this.socket.localAddress || '0.0.0.0'; } },
                port: { get: function () { return _this.socket.localPort || 5060; } }
            });
            this.doConnect();
        };
        TcpTransport.prototype.doConnect = function () {
            this.socket = node_1.default.Net.connect({
                host: this.remoteAddress,
                port: this.remotePort
            });
            this.socket.once('connect', this.onConnect.bind(this));
            this.socket.on('error', this.onError.bind(this));
        };
        TcpTransport.prototype.onConnect = function () {
            this.socket.once('close', this.onClose.bind(this));
            this.socket.on('data', this.processor);
            this.via.host = this.socket.localAddress;
            this.via.port = this.socket.localPort;
            this.socket['connected'] = true;
            this.emit('connect', this);
            while (this.queue.length) {
                this.send(this.queue.shift());
            }
        };
        TcpTransport.prototype.onError = function (error) {
            this.emit('error', error, this);
            this.onClose();
        };
        TcpTransport.prototype.onClose = function () {
            this.doDestroy();
            this.emit('disconnect', this);
        };
        TcpTransport.prototype.doDestroy = function () {
            if (this.socket) {
                this.socket.destroy();
                this.socket = null;
            }
        };
        TcpTransport.prototype.doSend = function (buffer) {
            this.socket.write(buffer);
        };
        TcpTransport.__initializer = function(__parent){
            __super=__parent;
        };
        return TcpTransport;
        function TcpTransport() {
            __super.apply(this, arguments);
        }
    })();
    module.define('class', TcpTransport);
    module.export("TcpTransport", TcpTransport);
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
            TcpTransport = module.init(TcpTransport,transport_1.Transport);
        }
    }
});
//# sourceMappingURL=tcp.js.map