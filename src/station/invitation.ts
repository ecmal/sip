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

interface RtpPacket {
    version         :number,
    padding         :number,
    extension       :number,
    marker          :number,
    type            :number,
    sequence        :number,
    timestamp       :number,
    ssrc            :number,
    csrc            :number[],
    payload         :Buffer,
}
export class InviteMedia {
    static parsePacket(buf:Buffer):RtpPacket{
        if (!Buffer.isBuffer(buf)) {
            throw new Error('buffer required');
        }
        if (buf.length < 12) {
            throw new Error('can not parse buffer smaller than fixed header');
        }
        var firstByte = buf.readUInt8(0), secondByte = buf.readUInt8(1);
        var csrcCount = firstByte & 0x0f;
        var parsed:RtpPacket = {
            version          : firstByte >> 6,
            padding          : (firstByte >> 5) & 1,
            extension        : (firstByte >> 4) & 1,
            marker           : secondByte >> 7,
            type             : secondByte & 0x7f,
            sequence         : buf.readUInt16BE(2),
            timestamp        : buf.readUInt32BE(4),
            ssrc             : buf.readUInt32BE(8),
            csrc             : [],
            payload          : null
        };
        for (var i = 0; i < csrcCount; i++) {
            parsed.csrc.push(buf.readUInt32BE(9 + 4 * i));
        }
        parsed.payload = buf.slice(12 + 4 * csrcCount);
        return parsed;
    }
    static get instance(){
        return Object.defineProperty(this,'instance',<any>{
            value:new InviteMedia()
        }).instance
    }
    private server:any;
    private rtcp:any;
    private client:any;

    public remotePort:number;
    public remoteAddress:string;
    public packet:RtpPacket;
    public enabled:boolean;

    send(message?:Buffer){
        this.server.send(message,0,message.length,this.remotePort,this.remoteAddress);
    }
    constructor(){
        this.server = Util.dgram.createSocket("udp4");
        this.rtcp = Util.dgram.createSocket("udp4");
        var chunkCount = 0;
        var chunkTotal = 0;
        var chunkMax = 0;
        var chunkMin = Number.MAX_SAFE_INTEGER;
        var pack:RtpPacket,last:RtpPacket;
        this.rtcp.on("message", (msg, rinfo)=>{
            console.info('');
            console.info(msg.toString('hex'));
        });
        this.server.on("message", (msg, rinfo)=>{
            chunkCount ++;
            chunkTotal += msg.length;
            chunkMin = Math.min(chunkMin,msg.length);
            chunkMax = Math.max(chunkMax,msg.length);
            pack = InviteMedia.parsePacket(msg);
            if(last && (pack.ssrc!=last.ssrc||pack.extension!=last.extension||pack.marker!=last.marker||pack.csrc.length!=pack.csrc.length||pack.padding!=pack.padding)){
                console.info('');
                last = pack;
            }else{
                last = pack;
            }
            process.stdout.write(`\rMedia Received : v:${pack.version} t:${pack.type} e:${pack.extension} m:${pack.marker} p:${pack.padding} s:${pack.ssrc} t:${pack.timestamp} i:${pack.sequence} c:${pack.csrc.length} d:${pack.payload.length}`);
            //this.send(msg);
            if(this.enabled){
                this.send(msg);
            }
        });
        this.server.on("listening", ()=>{
            var address = this.server.address();
            console.log("server listening " + address.address + ":" + address.port);
        });
        this.server.bind(18089);
        this.rtcp.bind(18090);
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
    public static encodeSdp(sdp:string[]):string{
        return sdp.join('\r\n')+'\r\n';
    }
    public static decodeSdp(sdp:string):any{
        return sdp.trim().split(/\r?\n/).map(p=>p.trim());
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
                    var sdp = message.content.toString();
                    console.info(sdp);
                    this.media.remotePort = parseInt(sdp.match(/m=audio\s+(\d+)/)[1]);
                    this.media.remoteAddress = sdp.match(/c=IN\s+IP4\s+(\d+\.\d+.\d+\.\d+)/)[1];
                    this.media.enabled = true;
                    console.info(`Send Media To ${this.media.remoteAddress}:${this.media.remotePort}`);
                    this.sendAck(message);
                }
            } else {
                //this.station.emit('bye',this.call);
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
                value       : 1
            })
        });
        //request.content = new Buffer()
        request.setHeader("Max-Forwards",70);
        request.contentLength = 0;
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
            o=${this.station.address.uri.username} ${Util.random()} ${Util.random()} IN IP4 ${this.station.address.uri.host}
            s=Talk
            c=IN IP4 ${this.station.address.uri.host}
            t=0 0
            m=audio 18089 RTP/AVP 0 101 100 102 103 104
            a=rtpmap:101 telephone-event/48000
            a=rtpmap:100 telephone-event/16000
            a=rtpmap:102 telephone-event/8000
            a=rtpmap:103 telephone-event/32000
            a=rtpmap:104 telephone-event/44100
        `));
        var request = this.request = new Request({
            method          : "INVITE",
            uri             : to.uri,
            from            : this.station.contact,
            to              : to,
            contact         : this.station.address,
            callId          : Util.guid(),
            sequence        : new Sequence({
                method      : "INVITE",
                value       : 1
            }),
            maxForwards     : 70,
            allow           : [
                'UPDATE',
                'INVITE',
                'ACK',
                'CANCEL',
                'BYE',
                'NOTIFY',
                'REFER',
                'MESSAGE',
                'OPTIONS',
                'INFO',
                'SUBSCRIBE',
            ],
            content         : new Buffer(content)
        });
        request.setHeader("Allow-Events",'presence, kpml');
        request.setHeader("Content-Type",'application/sdp');
        request.setHeader("Supported",'outbound, replaces, norefersub, extended-refer');
        //this.station.registration.sign(request);
        request.contentLength = request.content.length;
        //console.info(request.toString());
        this.station.transport.send(request);
    }
    onInvite(message:Request){


        // remove me
        this.request = message;
        if(this.call && this.call.id == message.callId){
            this.sendInviteAccept(message)
        }else{
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
            this.sendInviteRinging(message);
        }

        //this.sendInviteTrying();
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
                o=${this.station.address.uri.username} ${Util.random()} ${Util.random()} IN IP4 ${this.station.address.uri.host}
                s=Talk
                c=IN IP4 ${this.station.address.uri.host}
                t=0 0
                a=rtcp-xr:rcvr-rtt=all:10000 stat-summary=loss,dup,jitt,TTL voip-metrics
                m=audio 18089 RTP/AVP 0 101
                a=rtpmap:0 PCMU/8000
                a=rtpmap:101 telephone-event/8000
                a=fmtp:101 0-15
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


//Media Received : v:2 t:0 e:0 m:0 s:1757169252 t:3000854475 i:14383 c:0 d:160
//Media Received : v:2 t:0 e:0 m:0 s:1881769542 t:3109037536 i:19923 c:0 d:160