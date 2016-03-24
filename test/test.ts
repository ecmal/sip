import {TcpTransport, UdpTransport} from "sip/transport";
import {Station} from "sip/station/station";
import {Contact} from "sip/models/common/contact";
import {Agent} from "sip/station/agent";
import {Client} from "sip/station/client";
import {MediaServer} from "sip/media/server";
import {RtpPacket} from "sip/media/rtp";
import {RtcpPacket} from "sip/media/rtcp";
import {Sdp} from "sip/models/common/sdp";


/*var sdp = new Sdp(`v=0
o=iTunes 3413821438 0 IN IP4 fe80::217:f2ff:fe0f:e0f6
s=iTunes
c=IN IP4 fe80::5a55:caff:fe1a:e187
t=0 0
m=audio 0 RTP/AVP 96
a=rtpmap:96 AppleLossless/456/oo
a=fmtp:96 352 0 16 40 10 14 2 255 0 0 44100
a=fpaeskey:RlBMWQECAQAAAAA8AAAAAPFOnNe+zWb5/n4L5KZkE2AAAAAQlDx69reTdwHF9LaNmhiRURTAbcL4brYAceAkZ49YirXm62N4
a=aesiv:5b+YZi9Ikb845BmNhaVo+Q`)*/
MediaServer.instance.listen();
//console.info(sdp.toString());

var buf:Buffer=new Buffer('80807d5f33bb8d15f058202b3b393b3f4b69d3c2bbb8b8bac0ce744b3e3936373b4256ddc5bbb7b5b7bcc6e15240393535383d4bffcbbdb8b5b5b9c0d261463c3735373b455dd6c2bbb7b6b9becbf44e403a38383b4253e9cbbfbbb9bbbec9de5c493f3c3c3e444f6ed7c8c1bebfc2cad974544a444344495164e9d5ccc9c9cbd0dbf26659524f50555c68fee9dfdddddfe5ecf87c767679fff9f6f6fc786c655f5d5d5f697ee8dcd5d0cfd2',"hex");
var buf2:Buffer=new Buffer('80c80006c5278835da9dbb090a07080053d81a92000001f400014ff081ca000dc5278835012a323039393638333332365f7461705f333730393730363337325f414049332d504d53534950312d50583100000000',"hex");
var pkt = new RtpPacket(buf);
var pkt2 = new RtcpPacket(buf2);

console.info('Parsed',{
    version:pkt2.version,
    padding:pkt2.padding,
    reportCount:pkt2.reportCount,
    type:pkt2.type,
    packetLength:pkt2.packetLength,
    ssrc:pkt2.ssrc,
    startTime:pkt2.startTime,
    endTime:pkt2.endTime,
    timestamp:pkt2.timestamp,
    senderPacketCount:pkt2.senderPacketCount,
    senderOctetCount:pkt2.senderOctetCount
});
/*console.info('Parsed',{
    version:pkt.version,
    padding:pkt.padding,
    extension:pkt.extension,
    marker:pkt.marker,
    csrcCount:pkt.csrcCount,
    timestamp:pkt.timestamp,
    type:pkt.type,
    sequence:pkt.sequence,
    ssrc:pkt.ssrc,
    csrc:pkt.csrc,
    payload:pkt.payload,
});*/
/*console.info('Reversed',MediaServer.parsePacket(MediaServer.toBuffer({
    version:2,
    padding:0,
    extension:0,
    csrcCount:0,
    marker:1,
    type:0,
    sequence:32095,
    timestamp:867929365,
    ssrc: 4032307243,
    payload:'3b393b3f4b69d3c2bbb8b8bac0ce744b3e3936373b4256ddc5bbb7b5b7bcc6e15240393535383d4bffcbbdb8b5b5b9c0d261463c3735373b455dd6c2bbb7b6b9becbf44e403a38383b4253e9cbbfbbb9bbbec9de5c493f3c3c3e444f6ed7c8c1bebfc2cad974544a444344495164e9d5ccc9c9cbd0dbf26659524f50555c68fee9dfdddddfe5ecf87c767679fff9f6f6fc786c655f5d5d5f697ee8dcd5d0cfd2'
})));*/


System['Stations'] = Object.create(null);

Agent.start([
    //["SP0001", "test", "WCB-SP-0001", "19675", "acollins",  "Adam Collins"   ],
    //["SP0002", "test", "WCB-SP-0002", "19697", "bratcliff", "Bruce Ratcliff" ],
    ["SP0003", "test", "WCB-SP-0003", "19449", "mblair",    "Mark Blair"     ],
    ["SP0004", "test", "WCB-SP-0004", "19435", "cfisher",   "Chad Fisher"    ]
]).forEach(a=>{
    a.register(3600);
    System['Stations'][a.contact.uri.username]=a;
});

/*
Client.start([
    ["testuser",""],
    ["6026251610",""],
    ["6026251611",""],
    ["6026251612",""],
    ["6026251613",""],
    ["6026251614",""],
    ["6026251615",""],
    ["6026251616",""],
    ["6026251617",""],
    ["6026251618",""],
    ["6026251619",""]
]).forEach(a=>{
    a.register(3600);
    System['Stations']['C'+a.contact.uri.username]=a;
});
*/