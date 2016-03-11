import {Transport} from "sip/transport";
import {Station} from "sip/station";
import {Parser} from "sip/parser";
import {Message} from "sip/models";

console.info(Parser.parse(`REGISTER sip:win.freedomdebtrelief.com SIP/2.0
Via: SIP/2.0/TCP 192.168.10.105:50405;alias;branch=z9hG4bK.~3I3SLROQ;rport
From: <sip:101@win.freedomdebtrelief.com>;tag=7Lq7OgaDW
To: sip:101@win.freedomdebtrelief.com
CSeq: 20 REGISTER
Call-ID: eRebdDPcxy
Max-Forwards: 70
Supported: outbound
Accept: application/sdp
Accept: text/plain
Accept: application/vnd.gsma.rcs-ft-http+xml
Contact: <sip:101@192.168.10.105:50405;transport=tcp>;+sip.instance="<urn:uuid:9548ce0d-4303-475b-bbd4-ca6559d3f960>"
Expires: 3600
User-Agent: Linphone/3.9.0 (belle-sip/1.4.2)
Content-Length: 0
`,Message).toString());
/*
Promise.all([
    Transport.get('"Clients" <sip:192.168.10.200;transport=tcp>').connect().then(win=>{
        return Promise.all([
            Station.get('"Sergey Mamyan" <sip:101:101@win.freedomdebtrelief.com>').register(win),
            Station.get('"Vahram Bleyan" <sip:102:102@win.freedomdebtrelief.com>').register(win),
            Station.get('"Grish Grigoryan" <sip:103:103@win.freedomdebtrelief.com>').register(win)
        ])
    }),
    Transport.get('"Agents" <sip:192.168.10.200;transport=tcp>').connect().then(win=>{
        return Promise.all([
            Station.get('"Sergey Mamyan" <sip:101:101@dev.freedomdebtrelief.com>').register(win),
            Station.get('"Vahram Bleyan" <sip:102:102@dev.freedomdebtrelief.com>').register(win),
            Station.get('"Grish Grigoryan" <sip:103:103@dev.freedomdebtrelief.com>').register(win)
        ])
    })
]).then(r=>console.info(r),e=>console.info(e))
*/
