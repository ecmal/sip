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
        this.client.send(message,0,message.length,7078,"192.168.10.105");
    }
    constructor(){
        this.client = Util.dgram.createSocket("udp4");
        this.server = Util.dgram.createSocket("udp4");
        var chunkCount = 0;
        var chunkTotal = 0;
        var chunkMax = 0;
        var chunkMin = Number.MAX_SAFE_INTEGER;
        this.server.on("message", (msg, rinfo)=>{
            chunkCount ++;
            chunkTotal += msg.length;
            chunkMin = Math.min(chunkMin,msg.length);
            chunkMax = Math.max(chunkMax,msg.length);
            process.stdout.write(`\rMedia Received : count:${chunkCount} total:${chunkTotal} chunk:${msg.length} min:${chunkMin} max:${chunkMin}`);
            //this.send(msg);
        });
        this.server.on("listening", ()=>{
            var address = this.server.address();
            console.log("server listening " + address.address + ":" + address.port);
        });
        this.server.bind(18089);
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

    public call:Call;
    private media:InviteMedia;
    private station:Station;
    private request:Request;
    public static encodeSdp(sdp:any):string{
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
    public static decodeSdp(sdp:string):any{
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
        this.media = InviteMedia.instance;
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
            this.onInvite(message);
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
                    this.sendBye(null);
                });
                this.station.emit('invite',this.call);
            } else
            if(message.status == 180){
                this.station.emit('ringing',this.call);
            } else
            if(message.status == 200){
                if(message.sequence.method=="INVITE"){
                    this.request.from = message.from;
                    this.request.to = message.to;
                    this.station.emit('call',this.call);
                    this.sendAck(message);
                }
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
    sendAck(response:Response){
        var request = new Request({
            method          : "ACK",
            uri             : response.contact.uri,
            from            : response.from,
            to              : response.to,
            callId          : response.callId,
            //contact         : this.station.address,
            sequence        : new Sequence({
                method      : "ACK",
                value       : 10
            })
        });
        //request.setHeader("Content-Type",'application/sdp');
        /*var content = InviteFlow.encodeSdp(InviteFlow.decodeSdp(`
            v=0
            o=WCB 0 1 IN IP4 ${this.station.address.uri.host}
            s=conversation
            c=IN IP4 ${this.station.address.uri.host}
            t=0 0
            m=audio 18089 RTP/AVP 0 8 3 97 98 9 18 101
            a=rtpmap:0 PCMU/8000
            a=rtpmap:8 PCMA/8000
            a=rtpmap:3 GSM/8000
            a=rtpmap:97 G726-32/8000
            a=rtpmap:98 iLBC/8000
            a=rptmap:9 G722/8000
            a=rtpmap:18 G729/8000
            a=fmtp:18 annexb=yes
            a=rtpmap:101 telephone-event/8000
            a=fmtp:101 0-16
            a=sendrecv
        `));
        request.content = new Buffer(content)*/
        request.setHeader("Max-Forwards",70);
        request.contentLength = 0;

        /*
        var rHost = this.station.transport.socket.remoteAddress;
        var rPort = this.station.transport.socket.remotePort;
        request.setHeader("Route",`<sip:${rHost}:${rPort};lr>`);
        */
        //this.station.registration.sign(request);
        //console.info(request.toString());
        this.station.transport.send(request);
    }
    sendBye(message:Request){
        var from,to;
        if(!this.request){return}
        if(this.call.from.uri.username==this.station.contact.uri.username){
            from = this.request.from;
            to = this.request.to;
        }else{
            from = this.request.to;
            to = this.request.from;
        }
        var request = new Request({
            method          : "BYE",
            uri             : to.uri,
            from            : from,
            to              : to,
            callId          : this.request.callId,
            contact         : this.station.address,
            sequence        : new Sequence({
                method      : "BYE",
                value       : 2
            })
        });
        request.setHeader("Max-Forwards",70);
        request.contentLength = 0;
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
        //response.setHeader("Record-Route",this.request.getHeader('Record-Route'));
        response.contentLength = 0;

        this.station.transport.send(response);
        this.request = null;
    }
    sendInvite(to:Contact){
        var content = InviteFlow.encodeSdp(InviteFlow.decodeSdp(`
            v=0
            o=WCB 0 1 IN IP4 ${this.station.address.uri.host}
            s=conversation
            c=IN IP4 ${this.station.address.uri.host}
            t=0 0
            m=audio 18089 RTP/AVP 0 8 3 97 98 9 18 101
            a=rtpmap:0 PCMU/8000
            a=rtpmap:8 PCMA/8000
            a=rtpmap:3 GSM/8000
            a=rtpmap:97 G726-32/8000
            a=rtpmap:98 iLBC/8000
            a=rptmap:9 G722/8000
            a=rtpmap:18 G729/8000
            a=fmtp:18 annexb=yes
            a=rtpmap:101 telephone-event/8000
            a=fmtp:101 0-16
            a=sendrecv
        `));
        var request = this.request = new Request({
            method          : "INVITE",
            uri             : to.uri,
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
        //var rHost = this.station.transport.socket.remoteAddress;
        //var rPort = this.station.transport.socket.remotePort;
        //request.setHeader("Record-Route",`<sip:${rHost}:${rPort};lr>`);
        request.setHeader("Allow",'INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE');
        request.setHeader("Allow-Events",'presence, kpml');
        request.setHeader("Content-Type",'application/sdp');
        request.setHeader("Supported",'replaces, norefersub, extended-refer');
        //this.station.registration.sign(request);
        request.contentLength = request.content.length;
        //console.info(request.toString());
        this.station.transport.send(request);
    }
    onInvite(message:Request){
        this.call = new Call({
            id   : message.callId,
            from : message.from,
            to   : message.to,
        });
        var onCallTake = ()=>{
            this.call.off('take',onCallTake);
            this.call.off('drop',onCallDrop);
            this.sendInviteAccept(message);
        };
        var onCallDrop = ()=>{
            this.call.off('take',onCallTake);
            this.call.off('drop',onCallDrop);
            this.sendInviteReject(message);
        };
        this.call.once('take',onCallTake);
        this.call.once('drop',onCallDrop);

        this.station.emit('invite',this.call);
        // remove me
        this.request = message;
        //this.sendInviteTrying();
        this.sendInviteRinging(message);
    }
    sendInviteTrying(message:Request){
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
    sendInviteRinging(message:Request){
        var response = new Response({
            status      : 180,
            message     : 'Ringing',
            via         : message.via,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId,
            contact     : this.station.address
        });
        response.contentLength = 0;
        this.station.transport.send(response);
    }
    sendInviteAccept(message:Request){

        var response = new Response({
            status      : 200,
            message     : 'OK',
            via         : message.via,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId,
            contact     : this.station.address,
            content     : new Buffer(InviteFlow.encodeSdp(InviteFlow.decodeSdp(`
                v=0
                o=WCB 0 1 IN IP4 ${this.station.address.uri.host}
                s=conversation
                c=IN IP4 ${this.station.address.uri.host}
                t=0 0
                m=audio 18089 RTP/AVP 0 8 3 97 98 9 18 101
                a=rtpmap:0 PCMU/8000
                a=rtpmap:8 PCMA/8000
                a=rtpmap:3 GSM/8000
                a=rtpmap:97 G726-32/8000
                a=rtpmap:98 iLBC/8000
                a=rptmap:9 G722/8000
                a=rtpmap:18 G729/8000
                a=fmtp:18 annexb=yes
                a=rtpmap:101 telephone-event/8000
                a=fmtp:101 0-16
                a=sendrecv
            `)))
        });
        response.setHeader("Allow",'INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE');
        response.setHeader("Allow-Events",'presence, kpml');
        response.setHeader("Content-Type",'application/sdp');
        response.setHeader("Supported",'replaces, norefersub, extended-refer');
        response.contentLength = response.content.length;

        this.call.once('drop',()=>this.sendBye(message));
        this.station.transport.send(response);

    }
    sendInviteReject(message:Request){
        var response = new Response({
            status          : 603,
            message         : 'Declined',
            via             : message.via,
            from            : message.from,
            to              : message.to,
            sequence        : message.sequence,
            callId          : message.callId,
            contact         : this.station.address,
            contentLength   : 0
        });
        this.station.transport.send(response);
    }
}