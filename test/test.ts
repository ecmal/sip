import {Agent} from "./wcb/agent";
import {Client} from "./wcb/client";
import {MediaServer} from "sip/media/server";

MediaServer.instance.listen();

Agent.start([
    ["SP0001", "test", "WCB-SP-0001", "19675", "acollins",  "Adam Collins"   ],
    ["SP0002", "test", "WCB-SP-0002", "19697", "bratcliff", "Bruce Ratcliff" ],
    ["SP0003", "test", "WCB-SP-0003", "19449", "mblair",    "Mark Blair"     ],
    ["SP0004", "test", "WCB-SP-0004", "19435", "cfisher",   "Chad Fisher"    ]
]).forEach(a=>{
    a.register(3600);
    System[`${a.contact.uri.username}`]=a;
});

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
    System[`PC${a.contact.uri.username}`]=a;
});
