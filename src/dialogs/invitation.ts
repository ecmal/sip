import {Request} from "../models/message/request";
import {Contact} from "../models/common/contact";
import {Util} from "../models/common/utils";
import {Sequence} from "../models/common/sequence";
import {Response} from "../models/message/response";
import {Station} from "../station";
import {Emitter} from "../events";
import {Uri} from "../models/common/uri";
import {Mime} from "../models/common/mime";

export interface RtpPacket {
    version         :number,
    padding         :number,
    extension       :number,
    marker          :number,
    type            :number,
    sequence        :number,
    timestamp       :number,
    ssrc            :number,
    csrc            :number[],
    payload         :Buffer
}
export class InviteMedia {
    static RTP_PORT = 18089;
    static RTCP_PORT = 18090;
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
    private get debug(){
        return false;
    }
    send(message?:Buffer){
        this.server.send(message,0,message.length,this.remotePort,this.remoteAddress);
    }
    constructor(){
        this.server = Util.udp.createSocket("udp4");
        this.rtcp = Util.udp.createSocket("udp4");
        var chunkCount = 0;
        var chunkTotal = 0;
        var chunkMax = 0;
        var chunkMin = Number.MAX_SAFE_INTEGER;
        var pack:RtpPacket,last:RtpPacket;
        this.rtcp.on("message", (msg, rinfo)=>{
            if(this.debug) {
                console.info('');
                console.info(msg.toString('hex'));
            }
        });
        this.server.on("message", (msg, rinfo)=>{
            chunkCount ++;
            chunkTotal += msg.length;
            chunkMin = Math.min(chunkMin,msg.length);
            chunkMax = Math.max(chunkMax,msg.length);
            pack = InviteMedia.parsePacket(msg);
            if(last && (pack.ssrc!=last.ssrc||pack.extension!=last.extension||pack.marker!=last.marker||pack.csrc.length!=pack.csrc.length||pack.padding!=pack.padding)){
                if(this.debug){
                    console.info('');
                }
                last = pack;
            }else{
                last = pack;
            }
            if(this.debug) {
                process.stdout.write(`\rMedia Received : v:${pack.version} t:${pack.type} e:${pack.extension} m:${pack.marker} p:${pack.padding} s:${pack.ssrc} t:${pack.timestamp} i:${pack.sequence} c:${pack.csrc.length} d:${pack.payload.length}`);
            }
            if(this.enabled){
                this.send(msg);
            }
        });
        this.server.on("listening", ()=>{
            var address = this.server.address();
            console.log("server listening " + address.address + ":" + address.port);
        });
        this.server.bind(InviteMedia.RTP_PORT);
        this.rtcp.bind(InviteMedia.RTCP_PORT);
    }
}
export enum CallState {
    INITIAL,
    TRYING,
    TALKING,
    RINGING,
    ENDED
}
export enum CallDirection {
    INCOMING,
    OUTGOING
}

export class Call extends Emitter {

    public id:string;
    public direction:CallDirection;
    public state:CallState;
    public from:Contact;
    public to:Contact;

    public localMedia:Uri;
    public remoteMedia:Uri;

    public get localUsername(){
        switch(this.direction){
            case CallDirection.OUTGOING:return this.from.uri.username;
            case CallDirection.INCOMING:return this.to.uri.username;
        }
    }
    public get remoteUsername(){
        switch(this.direction){
            case CallDirection.OUTGOING:return this.to.uri.username;
            case CallDirection.INCOMING:return this.from.uri.username;
        }
    }

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


export class InviteDialog{
    static getSdp(username:string,host:string,port:number=18089){
        return new Buffer(InviteManager.encodeSdp(InviteManager.decodeSdp(`
            v=0
            o=${username} ${Util.random()} ${Util.random()} IN IP4 ${host}
            s=Talk
            c=IN IP4 ${host}
            t=0 0
            m=audio ${port} RTP/AVP 0 101
            a=rtpmap:0 PCMU/8000
            a=rtpmap:101 telephone-event/8000
            a=fmtp:101 0-15
        `)))
    }

    public call:Call;
    public station:Station;

    constructor(station:Station,call:Call){
        this.station = station;
        this.call = call;
    }
}
export class IncomingInviteDialog extends InviteDialog {

    constructor(station:Station,request:Request){
        super(station,new Call({
            id          : request.callId,
            direction   : CallDirection.INCOMING,
            from        : request.from,
            to          : request.to
        }));
        this.onResponse = this.onResponse.bind(this);
        this.onRequest = this.onRequest.bind(this);
        this.station.transport.on(`response:${this.call.id}`,this.onResponse);
        this.station.transport.on(`request:${this.call.id}`,this.onRequest);
        this.sendInviteAccept(request);
    }
    protected onResponse(message:Response){
        if(message.status == 100){
            this.call.state = CallState.TRYING;
            this.station.emit('invite',this.call);
        } else
        if(message.status == 180){
            this.call.state = CallState.RINGING;
            this.station.emit('dialing',this.call);
        } else
        if(message.status == 200){
            if(message.sequence.method=="INVITE"){
                this.call.state = CallState.TALKING;
                this.station.emit('call',this.call);
                var sdp = message.content.toString();
                //this.media.remotePort = parseInt(sdp.match(/m=audio\s+(\d+)/)[1]);
                //this.media.remoteAddress = sdp.match(/c=IN\s+IP4\s+(\d+\.\d+.\d+\.\d+)/)[1];
                //this.media.enabled = true;
                //console.info(`Send Media To ${this.media.remoteAddress}:${this.media.remotePort}`);
                this.sendAck(message);
            }
        } else {
            //this.station.emit('bye',this.call);
        }
    }
    protected onRequest(message:Request){
        if(message.method=="ACK"){
            this.onAck(message)
        }else
        if(message.method=="BYE"){
            this.onBye(message)
        } else
        if(message.method=="INVITE"){
            this.onInvite(message);
        } else
        if(message.method=="CANCEL"){
            this.onCancel(message)
        }
    }
    protected sendAck(response:Response){
        this.station.transport.send(new Request({
            method          : "ACK",
            uri             : response.contact.uri,
            from            : response.from,
            to              : response.to,
            callId          : response.callId,
            maxForwards     : 70,
            sequence        : new Sequence({
                method      : "ACK",
                value       : 1
            })
        }))
    }
    protected onAck(request:Request){
        console.info("GOT ACK");
    }
    protected onBye(request:Request){
        this.sendByeAccept(request)
    }
    protected onInvite(request:Request){
        this.sendInviteAccept(request);
    }
    protected onCancel(request:Request){
        this.sendCancelAccept(request)
    }
    protected sendByeAccept(message:Request){
        this.station.transport.send(new Response({
            status      :200,
            message     :'OK',
            via         :message.via,
            from        :message.from,
            to          :message.to,
            sequence    :message.sequence,
            callId      :message.callId,
        }));
    }
    protected sendCancelAccept(message:Request){
        var response = new Response({
            status          : '200',
            message         : 'Ok',
            via             : message.via,
            from            : message.from,
            to              : message.to,
            sequence        : message.sequence,
            callId          : message.callId,
            contentLength   : 0
        });
        this.station.transport.send(response);
    }
    protected sendInviteAccept(message:Request){
        var response = new Response({
            status      : 200,
            message     : 'OK',
            via         : message.via,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId,
            contentType : new Mime({
                type        : 'application',
                subtype     : 'sdp'
            }),
            content     : InviteDialog.getSdp(
                this.station.contact.uri.username,
                this.station.transport.localAddress,
                InviteMedia.RTP_PORT
            )
        });
        this.station.transport.send(response);
    }

}
export class OutgoingInviteDialog extends InviteDialog {

    constructor(station:Station,request:Request){
        super(station, new Call({
            id          : request.callId,
            direction   : CallDirection.OUTGOING,
            from        : request.from,
            to          : request.to
        }));
        this.onResponse = this.onResponse.bind(this);
        this.onRequest = this.onRequest.bind(this);
        this.station.transport.on(`response:${this.call.id}`,this.onResponse);
        this.station.transport.on(`request:${this.call.id}`,this.onRequest);
        this.sendInvite();
    }

    protected onResponse(message:Response){
        if(message.status == 100){
            this.call.state = CallState.TRYING;
            this.station.emit('invite',this.call);
        } else
        if(message.status == 180){
            this.call.state = CallState.RINGING;
            this.station.emit('dialing',this.call);
        } else
        if(message.status == 200){
            if(message.sequence.method=="INVITE"){
                this.call.state = CallState.TALKING;
                this.station.emit('call',this.call);
                var sdp = message.content.toString();
                //this.media.remotePort = parseInt(sdp.match(/m=audio\s+(\d+)/)[1]);
                //this.media.remoteAddress = sdp.match(/c=IN\s+IP4\s+(\d+\.\d+.\d+\.\d+)/)[1];
                //this.media.enabled = true;
                //console.info(`Send Media To ${this.media.remoteAddress}:${this.media.remotePort}`);
                this.sendAck(message);
            }
        } else {
            //this.station.emit('bye',this.call);
        }
    }
    protected onRequest(message:Request){
        if(message.method=="ACK"){
            this.onAck(message)
        }else
        if(message.method=="BYE"){
            this.onBye(message)
        } else
        if(message.method=="INVITE"){
            this.onInvite(message);
        } else
        if(message.method=="CANCEL"){
            this.onCancel(message)
        }
    }
    protected onAck(request:Request){
        console.info("GOT ACK");
    }
    protected onBye(request:Request){
        this.sendByeAccept(request)
    }
    protected onInvite(request:Request){
        this.sendInviteAccept(request);
    }
    protected onCancel(request:Request){
        this.sendCancelAccept(request)
    }

    protected sendByeAccept(message:Request){
        this.station.transport.send(new Response({
            status      :200,
            message     :'OK',
            via         :message.via,
            from        :message.from,
            to          :message.to,
            sequence    :message.sequence,
            callId      :message.callId,
        }));
    }
    protected sendCancelAccept(message:Request){
        var response = new Response({
            status          : '200',
            message         : 'Ok',
            via             : message.via,
            from            : message.from,
            to              : message.to,
            sequence        : message.sequence,
            callId          : message.callId,
            contentLength   : 0
        });
        this.station.transport.send(response);
    }
    protected sendAck(response:Response){
        this.station.transport.send(new Request({
            method          : "ACK",
            uri             : response.contact.uri,
            from            : response.from,
            to              : response.to,
            callId          : response.callId,
            maxForwards     : 70,
            sequence        : new Sequence({
                method      : "ACK",
                value       : 1
            })
        }))
    }
    protected sendInvite(){
        this.station.transport.send(new Request({
            method          : "INVITE",
            sequence        : new Sequence({
                method      : "INVITE",
                value       : 1
            }),
            uri             : this.call.to.uri,
            callId          : this.call.id,
            from            : this.call.from,
            to              : this.call.to,
            supported       : ['outbound', 'replaces', 'join'],
            maxForwards     : 70,
            contentType     : Mime.SDP,
            content         : InviteDialog.getSdp(
                this.station.contact.uri.username,
                this.station.transport.localAddress,
                InviteMedia.RTP_PORT
            )
        }))
    }
    protected sendInviteAccept(message:Request){
        var response = new Response({
            status      : 200,
            message     : 'OK',
            via         : message.via,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId,
            contentType : new Mime({
                type        : 'application',
                subtype     : 'sdp'
            }),
            content     : InviteDialog.getSdp(
                this.station.contact.uri.username,
                this.station.transport.localAddress,
                InviteMedia.RTP_PORT
            )
        });
        this.station.transport.send(response);
    }
}

export class InviteManager {

    public call:Call;
    public dialog:InviteDialog;
    private media:InviteMedia;
    private station:Station;

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
        this.station.on('request',this.onRequest);
    }
    onRequest(message:Request){
        if(!this.dialog){
            this.dialog = new IncomingInviteDialog(this.station,message)
        }
    }
    sendInvite(to:Contact){
        this.dialog = new OutgoingInviteDialog(this.station,new Request({
            callId:Util.guid(),
            from:this.station.contact,
            to:to
        }));
    }
}


