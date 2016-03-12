import {Transport} from "sip/transport";
import {Station} from "sip/station";

Transport.get('"Clients" <sip:192.168.10.200;transport=tcp>').connect().then(t=>{
    Station.get('"Sergey Mamyan" <sip:103:103@win.freedomdebtrelief.com>').register(t).then(s=>{
        console.info(s)
    })
});
