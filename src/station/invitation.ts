import {Request} from "../models/message/request";
import {Contact} from "../models/common/contact";
import {Transport} from "../transport";
import {Uri} from "../models/common/uri";
import {Util} from "../models/common/utils";
import {Sequence} from "../models/common/sequence";
import {Message} from "../models/message";
import {Response} from "../models/message/response";
import {Station} from "../station";


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

export class InviteFlow {
    
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
        if(message.method=="INVITE"){
            this.request = message;
            console.info(message.content.toString());
            this.sendRinging();
            setTimeout(s=>this.sendTaken(),5000);
            //console.info(message.toString());
        }
    }
    onResponse(message:Response){
        if(this.request && message.callId == this.request.callId){
            if(message.status == 401){
                if(!this.request.authorization){
                    this.request.authorization = message.authenticate.authorize(this.request.method,this.station.contact.uri);
                    this.request.sequence.value++;
                    this.station.transport.send(this.request);
                }else{
                    console.info(`Invalid credentials for ${this.station.contact}`);
                }
            }else
            if(message.status == 200){
                this.station.emit('register')
            }
        }
    }

    sendRinging(){
        var response = new Response({
            status      :180,
            message     :'Ringing',
            via         :this.request.via,
            from        :this.request.from,
            to          :this.request.to,
            sequence    :this.request.sequence,
            callId      :this.request.callId
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
        console.info(response.toString());
        console.info(content.toString());
        this.station.transport.send(response);
    }
}