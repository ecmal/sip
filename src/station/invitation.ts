import {Request} from "../models/message/request";
import {Contact} from "../models/common/contact";
import {Transport} from "../transport";
import {Uri} from "../models/common/uri";
import {Util} from "../models/common/utils";
import {Sequence} from "../models/common/sequence";
import {Message} from "../models/message";
import {Response} from "../models/message/response";
import {Station} from "../station";
import {Emitter} from "../events";


export class InviteMedia {
    static get instance(){
        return Object.defineProperty(this,'instance',<any>{
            value:new InviteMedia()
        }).instance
    }
    private server:any;
    private client:any;
    send(message:Buffer){
        this.client.send(message,0,message.length, 7078, "192.168.10.105");
    }
    constructor(){
        this.client = Util.dgram.createSocket("udp4");
        this.server = Util.dgram.createSocket("udp4");
        this.server.on("message", (msg, rinfo)=>{
            console.log("server got: " + msg.length + " from " + rinfo.address + ":" + rinfo.port);
            //this.send(msg);
        });
        this.server.on("listening", ()=>{
            var address = this.server.address();
            console.log("server listening " + address.address + ":" + address.port);
        });
        this.server.bind(32155);
    }
}

export enum CallState {
    INITIAL,
    RINGING,
    TALKING,
    DIALING
}

export class Call extends Emitter {

    public id:string;
    public state:CallState;
    public from:Contact;
    public to:Contact;

    constructor(options){
        super();
        this.state = CallState.INITIAL;
        for(var key in options){
            this[key] = options[key];
        }
    }

    take(){
        this.emit('take');
    }
    drop(){
        this.emit('drop');
    }

}

export class InviteFlow {

    private call:Call;
    private media:InviteMedia;
    private station:Station;
    private request:Request;
    private static encodeSdp(sdp:any):string{
        var arr = [];
        for(var k in sdp){
            var v = sdp[k];
            if(Array.isArray(v)){
                arr = arr.concat(v.map(i=>`${k}=${i}`));
            }else{
                arr.push(`${k}=${v}`)
            }
        }
        arr.push('');
        return arr.join('\r\n');
    }
    private static decodeSdp(sdp:string):any{
        var obj = {};
        sdp.trim().split(/\r?\n/).forEach(p=>{
            p = p.trim();
            var ind = p.indexOf('=');
            var key = p.substring(0,ind);
            var val = p.substring(ind+1);
            if(typeof obj[key]!="undefined"){
                if(Array.isArray(obj[key])){
                    obj[key].push(val);
                }else{
                    obj[key] = [obj[key],val]
                }
            }else{
                obj[key]=val;
            }
        });
        return obj;
    }


    constructor(station:Station){
        //this.media = InviteMedia.instance;
        this.station = station;
        this.onRequest = this.onRequest.bind(this);
        this.onResponse = this.onResponse.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.station.on('response',this.onResponse);
        this.station.on('request',this.onRequest);
        this.station.on('connect',this.onConnect);
    }

    onConnect(){}
    onRequest(message:Request){
        //console.info("GOT "+message.method);
        if(message.method=="ACK"){
            this.station.emit('call',this.call);
        }else
        if(message.method=="BYE"){
            this.request = message;
            this.station.emit('bye',this.call);
            this.sendByeReply();
        }else
        if(message.method=="INVITE"){
            this.call = new Call({
                id   : message.callId,
                from : message.from,
                to   : message.to,
            });
            this.call.once('take',()=>{
                this.sendTaken();
            });
            this.call.once('drop',()=>{
                this.sendBye();
            });
            this.station.emit('invite',this.call);
            this.request = message;
            this.request.to.tag = this.station.contact.tag;
            this.sendTrying();
            this.sendRinging();
        }
    }
    onResponse(message:Response){
        if(this.request && message.callId == this.request.callId){
            //console.info(message.toString());
            if(message.status == 100){
                this.call = new Call({
                    id   : message.callId,
                    from : message.from,
                    to   : message.to,
                });
                this.call.once('drop',()=>{
                    this.sendBye();
                });
                this.station.emit('invite',this.call);
            } else
            if(message.status == 180){
                this.station.emit('ringing',this.call);
            } else
            if(message.status == 200){
                this.request.from = message.from;
                this.request.to = message.to;
                this.station.emit('call',this.call);
                this.sendAck();
            } else {
                this.station.emit('bye',this.call);
            }
        }
    }
/*
 ACK sip:201@192.168.10.200:5060;transport=udp SIP/2.0
Via: SIP/2.0/UDP 192.168.10.105:57176;branch=z9hG4bK1286772749
Route: <sip:192.168.10.200:5060;lr>
From: "213" <sip:213@win.freedomdebtrelief.com>;tag=2066254670
To: "201" <sip:201@win.freedomdebtrelief.com>;tag=ff5271d8
Call-ID: 61597530
CSeq: 21 ACK
Contact: <sip:213@192.168.10.105:57176>
Max-Forwards: 70
User-Agent: iSoftPhone Pro 4.0122
Content-Length: 0
 */
    sendAck(){
        var request = new Request({
            method          : "ACK",
            uri             : new Uri({
                scheme      : this.station.contact.uri.scheme,
                host        : this.station.contact.uri.host,
                port        : this.station.contact.uri.port
            }),
            from            : this.request.from,
            to              : this.request.to,
            callId          : this.request.callId,
            contact         : this.station.contact,
            sequence        : new Sequence({
                method      : "ACK",
                value       : 1
            })
        });
        request.setHeader("Max-Forwards",70);
        request.contentLength = 0;
        var rHost = this.station.transport.socket.remoteAddress;
        var rPort = this.station.transport.socket.remotePort;
        request.setHeader("Route",`<sip:${rHost}:${rPort};lr>`);
        //this.station.registration.sign(request);
        //console.info(request.toString());
        this.station.transport.send(request);
    }
    sendBye(){
        var request = new Request({
            method          : "BYE",
            uri             : new Uri({
                scheme      : this.station.contact.uri.scheme,
                host        : this.station.contact.uri.host,
                port        : this.station.contact.uri.port
            }),
            from            : this.request.to,
            to              : this.request.from,
            callId          : this.request.callId,
            contact         : this.station.contact,
            sequence        : new Sequence({
                method      : "BYE",
                value       : 2
            })
        });
        request.setHeader("Max-Forwards",70);
        request.contentLength = 0;
        var rHost = this.station.transport.socket.remoteAddress;
        var rPort = this.station.transport.socket.remotePort;
        request.setHeader("Route",`<sip:${rHost}:${rPort};lr>`);
        console.info(request.toString());
        if(request.from.uri.username==this.station.contact.uri.username){
            this.station.registration.sign(request);
        }
        this.station.transport.send(request);
    }
    sendByeReply(){
        var response = new Response({
            status      :200,
            message     :'OK',
            via         :this.request.via,
            from        :this.request.from,
            to          :this.request.to,
            sequence    :this.request.sequence,
            callId      :this.request.callId,
        });
        response.setHeader("Record-Route",this.request.getHeader('Record-Route'));
        response.contentLength = 0;

        this.station.transport.send(response);
        this.request = null;
    }
    sendTrying(){
        var response = new Response({
            status      :100,
            message     :'Trying',
            via         :this.request.via,
            from        :this.request.from,
            to          :this.request.to,
            sequence    :this.request.sequence,
            callId      :this.request.callId
        });
        response.contentLength = 0;
        this.station.transport.send(response);
    }
    sendRinging(){
        var response = new Response({
            status      :180,
            message     :'Ringing',
            via         :this.request.via,
            from        :this.request.from,
            to          :this.request.to,
            sequence    :this.request.sequence,
            callId      :this.request.callId,
            contact     :this.station.contact
        });
        response.setHeader("Record-Route",this.request.getHeader('Record-Route'));
        response.contentLength = 0;
        this.station.transport.send(response);
    }
    sendTaken(){
        var content = InviteFlow.encodeSdp(InviteFlow.decodeSdp(`
            v=0
            o=Z 0 3 IN IP4 192.168.10.105
            s=Z
            c=IN IP4 192.168.10.105
            t=0 0
            m=audio 32155 RTP/AVP 110 3 8 0 98 101
            a=rtpmap:110 speex/8000
            a=rtpmap:98 iLBC/8000
            a=fmtp:98 mode=20
            a=rtpmap:101 telephone-event/8000
            a=fmtp:101 0-15
            a=sendrecv
        `));
        var response = new Response({
            status      :200,
            message     :'OK',
            via         :this.request.via,
            from        :this.request.from,
            to          :this.request.to,
            sequence    :this.request.sequence,
            callId      :this.request.callId,
            contact     :this.request.to,
            content     :new Buffer(content)
        });
        response.setHeader("Record-Route",this.request.getHeader('Record-Route'));
        response.setHeader("Allow",'INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE');
        response.setHeader("Allow-Events",'presence, kpml');
        response.setHeader("Content-Type",'application/sdp');
        response.setHeader("Supported",'replaces, norefersub, extended-refer');
        response.contentLength = response.content.length;
        this.station.transport.send(response);
    }
    sendInvite(to:Contact){
        var content = InviteFlow.encodeSdp(InviteFlow.decodeSdp(`
            v=0
            o=Z 0 3 IN IP4 192.168.10.105
            s=Z
            c=IN IP4 192.168.10.105
            t=0 0
            m=audio 32155 RTP/AVP 110 3 8 0 98 101
            a=rtpmap:110 speex/8000
            a=rtpmap:98 iLBC/8000
            a=fmtp:98 mode=20
            a=rtpmap:101 telephone-event/8000
            a=fmtp:101 0-15
            a=sendrecv
        `));
        var request = this.request = new Request({
            method          : "INVITE",
            uri             : new Uri({
                scheme      : this.station.contact.uri.scheme,
                host        : this.station.contact.uri.host,
                port        : this.station.contact.uri.port
            }),
            from            : this.station.contact,
            to              : to,
            contact         : this.station.contact,
            callId          : Util.guid(),
            sequence        : new Sequence({
                method      : "INVITE",
                value       : 1
            }),
            content         : new Buffer(content)
        });
        var rHost = this.station.transport.socket.remoteAddress;
        var rPort = this.station.transport.socket.remotePort;
        request.setHeader("Record-Route",`<sip:${rHost}:${rPort};lr>`);
        request.setHeader("Allow",'INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE');
        request.setHeader("Allow-Events",'presence, kpml');
        request.setHeader("Content-Type",'application/sdp');
        request.setHeader("Supported",'replaces, norefersub, extended-refer');
        this.station.registration.sign(request);
        request.contentLength = request.content.length;
        //console.info(request.toString());
        this.station.transport.send(request);
    }
}