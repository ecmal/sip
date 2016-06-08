system.register("sip/transport", ["./transport/transport", "./transport/tcp", "./transport/udp"], function(system,module) {
    var transport_1, tcp_1, udp_1;
    return {
        setters:[
            function (transport_1_1) {
                transport_1 = transport_1_1;
            },
            function (tcp_1_1) {
                tcp_1 = tcp_1_1;
            },
            function (udp_1_1) {
                udp_1 = udp_1_1;
            }],
        execute: function() {
            module.export("Transport", transport_1.Transport);
            module.export("TcpTransport", tcp_1.TcpTransport);
            module.export("UdpTransport", udp_1.UdpTransport);
        }
    }
});
//# sourceMappingURL=transport.js.map