import {Emitter} from "./events";
import {Parser} from "./parser";
import * as NET from "node/net";
import {Socket} from "node/net";
import {Message} from "sip/models/message";
import {Response} from "sip/models/message/response";


export class SipClient extends Emitter {
    private static getMessage(text:string):string{
        return text.trim().split('\n').map(l=>l.trim()).join('\r\n')+'\r\n\r\n';
    }
    private static separator = new Buffer('\r\n\r\n');
    private static indexOf(buffer:Buffer):number{
        var sep =SipClient.separator;
        for(var i=0;i<buffer.length-sep.length+1;i++){
            var found = true;
            for(var m=0;m<sep.length;m++){
                if(buffer[i+m]!=sep[m]){
                    found = false;
                    break;
                }
            }
            if(found) {
                return i;
            }
        }
        return -1;
    }
    private socket:Socket;

    connect(host:string,port:number){
        console.info(host,port);
        this.socket = NET.connect(port,host);
        this.socket.on('connect',(data)=>{
            this.emit('connect');
        });
        var temp = new Buffer(0);
        this.socket.on('data',(chunk)=>{
            var sep,message,data:Buffer = Buffer.concat([temp,chunk],temp.length+chunk.length);
            while((sep=SipClient.indexOf(data))>0){
                message = data.toString('utf8',0,sep+2);
                data = data.slice(sep+2);
            }
            console.log(message);
            console.log( Parser.parse(message,Message) instanceof Response);
            this.emit('SIPresponse',message);
        })


    }
    register(){
        this.send(SipClient.getMessage(`
            REGISTER sip:win.freedomdebtrelief.com SIP/2.0
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
        `));
    }
    send(text:string){
        this.socket.write(text);
    }
}