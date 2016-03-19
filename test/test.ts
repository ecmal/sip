import {TcpTransport, UdpTransport} from "sip/transport";
import {Station} from "sip/station/station";
import {Contact} from "sip/models/common/contact";
import {Agent} from "sip/station/agent";
import {Client} from "sip/station/client";



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





