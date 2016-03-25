import {Util} from "../models/common/utils";
import {Call} from "../dialogs/invitation/call";
import {Sdp} from "../models/common/sdp";
import {RtpPacket} from "./rtp";
import {RtcpPacket} from "./rtcp";

export class MediaServer {
    static calls:{[k:string]:Call} = Object.create(null);
    static RTP_PORT = 18089;
    static RTCP_PORT = 18090;

    static listenTo(call:Call){
        call.on("audio:start",(port,host)=>{
            MediaServer.calls[`${host}:${port}`] = call;
        });
        call.on("audio:stop",(port,host,nPort,nHost)=>{
            delete MediaServer.calls[`${host}:${port}`];
        });
        call.on("audio:update",(port,host,oPort,oHost)=>{
            delete MediaServer.calls[`${oPort}:${oPort}`];
            MediaServer.calls[`${host}:${port}`] = call;
        });
        return call.localSdp = new Sdp({
            version             : 0,
            origin              : {
                username        : call.localUsername,
                sessionId       : Util.random()&0xFFFFFF,
                sessionVersion  : Util.random()&0xFFFFFF,
                networkType     : "IN",
                addressType     : "IP4",
                unicastAddress  : this.instance.host
            },
            sessionName: call.localUsername,
            connection: {
                networkType: "IN",
                addressType: "IP4",
                connectionAddress: this.instance.host
            },
            timing: {
                start: 0,
                stop: 0
            },
            media: [
                {
                    type        : "audio",
                    port        : this.instance.rtpPort,
                    protocol    : "RTP/AVP",
                    payloads    : [
                        {
                            "id": 0,
                            "rtp": {
                                "codec": "PCMU",
                                "rate": 8000
                            }
                        }
                    ]
                }
            ]
        });
    }
    static talkTo(call:Call,sdp:Sdp){
        var newHost = sdp.connection.connectionAddress;
        var newPort = sdp.audio.port;
        var newAddr = `${newHost}:${newPort}`;
        if(!call.remoteSdp){
            call.remoteSdp = sdp;
            call.emit("audio:start",newPort,newHost);

        }else{
            var oldHost = call.remoteSdp.connection.connectionAddress;
            var oldPort = call.remoteSdp.audio.port;
            var oldAddr = `${oldHost}:${oldPort}`;
            call.remoteSdp = sdp;
            if(oldAddr!=newAddr){
                if(newHost=='0.0.0.0'||!newPort){
                    call.emit("audio:stop",oldPort,oldHost,newPort,newHost);
                }else{
                    call.emit("audio:update",newPort,newHost,oldPort,oldHost);
                }
            }
        }
    }

    static get instance():MediaServer{
        return Object.defineProperty(this,'instance',<any>{
            value:new MediaServer()
        }).instance
    }
    private rtp:any;
    private rtcp:any;
    private client:any;


    public packet:RtpPacket;
    public enabled:boolean;
    private get debug(){
        return true;
    }
    send(message:Buffer,port:number,host:string){
        this.rtp.send(message,0,message.length,port,host);
    }
    public host:string;
    public rtpPort:number;
    public rtcpPort:number;
    public file:any;


    constructor(){
        this.enabled = false;
        this.rtp = Util.udp.createSocket("udp4");
        this.rtcp = Util.udp.createSocket("udp4");
        var call:Call,pack:RtpPacket;
        //this.file = require('fs').createWriteStream('media.txt');
        this.rtcp.on("message", (msg:Buffer, rinfo)=>{
            //this.file.write(`RTCP ${rinfo.address} ${rinfo.port} ${msg.toString('hex')}\n`);
            if(this.debug) {
                console.info('');
                var len = RtcpPacket.getLength(msg);
                while(len){
                    var pkt = msg.slice(0,len);
                    try{
                        console.info(`RTCP(${JSON.stringify(new RtcpPacket(pkt),null,2)})`);
                    }catch(ex){
                        console.info(ex.stack);
                        console.info('-- PACKET ------------');
                        console.info(pkt.toString('hex'));
                    }
                    if(len<msg.length){
                        msg = msg.slice(len);
                        len = RtcpPacket.getLength(msg)
                    }else{
                        len = 0;
                    }
                }

            }
        });
        this.rtp.on("message", (msg, rinfo)=>{
            //this.file.write(`RTP  ${rinfo.address} ${rinfo.port} ${msg.toString('hex')}\n`);
            var id = `${rinfo.address}:${rinfo.port}`;
            if(call=MediaServer.calls[id]){
                pack = new RtpPacket(msg);
                call.emit(Call.EVENTS.AUDIO.RECEIVE,pack);
                if(this.debug && false){
                    process.stdout.write(`\rRTP  : c:${call.id} m:${pack.marker} t:${pack.type} s:${pack.source} i:${pack.sequence} t:${pack.timestamp} d:${pack.data.length}`);
                }
            }
        });
    }

    public listen(host?:string,rtpPort?:number,rtcpPort?:number):Promise<any>{
        var detect = host?Promise.resolve(host):Util.getLocalIpAddress();
        return detect.then((host:string)=>{
            this.host = host;
            this.rtpPort = rtpPort  = rtpPort||MediaServer.RTP_PORT;
            this.rtcpPort = rtcpPort = rtcpPort||(rtpPort+1);
            this.rtp.bind(rtpPort,host);
            this.rtcp.bind(rtcpPort,host);
            console.info(`LISTENING RTP:${rtpPort} / RCTP:${rtcpPort}`);
        });
    }
}