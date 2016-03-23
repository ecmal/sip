import {TcpTransport, UdpTransport} from "sip/transport";
import {Station} from "sip/station/station";
import {Contact} from "sip/models/common/contact";
import {Agent} from "sip/station/agent";
import {Client} from "sip/station/client";
import {MediaServer,RtpPacket} from "sip/media/server";

var buf:Buffer=new Buffer('80807d5f33bb8d15f058202b3b393b3f4b69d3c2bbb8b8bac0ce744b3e3936373b4256ddc5bbb7b5b7bcc6e15240393535383d4bffcbbdb8b5b5b9c0d261463c3735373b455dd6c2bbb7b6b9becbf44e403a38383b4253e9cbbfbbb9bbbec9de5c493f3c3c3e444f6ed7c8c1bebfc2cad974544a444344495164e9d5ccc9c9cbd0dbf26659524f50555c68fee9dfdddddfe5ecf87c767679fff9f6f6fc786c655f5d5d5f697ee8dcd5d0cfd2',"hex");

console.info('Parsed',MediaServer.parsePacket(buf));
console.info('Reversed',MediaServer.parsePacket(MediaServer.toBuffer({
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
})));



System['Stations'] = Object.create(null);

Agent.start([
    //["SP0001", "test", "WCB-SP-0001", "19675", "acollins",  "Adam Collins"   ],
    //["SP0002", "test", "WCB-SP-0002", "19697", "bratcliff", "Bruce Ratcliff" ],
    ["SP0003", "test", "WCB-SP-0003", "19449", "mblair",    "Mark Blair"     ],
    ["SP0004", "test", "WCB-SP-0004", "19435", "cfisher",   "Chad Fisher"    ]
]).forEach(a=>{
    System['Stations'][a.contact.uri.username]=a;
});

/*
Client.start([
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
    System['Stations']['C'+a.contact.uri.username]=a;
});*/





