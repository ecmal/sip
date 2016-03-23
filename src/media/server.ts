import {Util} from "../models/common/utils";
import {Call} from "../dialogs/invitation/call";
import {Sdp} from "../models/common/sdp";

export interface RtpPacket {
    version         :number,//2bit
    padding         :number,//1bit
    extension       :number,//1bit
    csrcCount       :number,//4bit
    marker          :number,//1bit
    type            :number,//7bit
    sequence        :number,//16bit
    timestamp       :number,//32bit
    ssrc            :number,//32bit
    csrc            :number[],//0-15, each 32bit
    payload         :Buffer
}
export class MediaServer {

    static RTP_PORT = 18089;
    static RTCP_PORT = 18090;

    static listenTo(call:Call){
        return call.localSdp = new Sdp({
            version             : 0,
            origin              : {
                username        : call.localUsername,
                sessionId       : Util.random(),
                sessionVersion  : Util.random(),
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
                        },
                        {
                            "id": 101,
                            "rtp": {
                                "codec": "telephone-event",
                                "rate": 8000
                            },
                            "fmtp": {
                                "params": "0-15"
                            }
                        }
                    ]
                }
            ]
        });
    }
    static talkTo(call:Call,sdp:Sdp){
        call.remoteSdp = sdp;
        console.info(sdp.connection.connectionAddress,sdp.audio.port);
    }
    static toBuffer(buf):Buffer{
        var packet='';
        var firstByte=(buf.version<<6 | buf.padding<<5 | buf.extension<<4 | buf.csrcCount<<3).toString(16);
        var secondByte=(buf.marker<<7 | buf.type<<6).toString(16);
        var sequence=Util.addZeros(buf.sequence,4);
        var timestamp=Util.addZeros(parseInt(new Date().getTime().toString().substr(-9)),8);
        //var timestamp=Util.addZeros(buf.timestamp,8);
        var ssrc=Util.addZeros(Util.random(),8);
        //var ssrc=Util.addZeros(buf.ssrc,8);
        packet=packet.concat(firstByte,secondByte,sequence,timestamp,ssrc)
        if(buf.csrc){
            //TODO add csrc
        }
        packet+=buf.payload;
        return new Buffer(packet,"hex");
    }
    static parsePacket(buf:Buffer):RtpPacket{
        if (!Buffer.isBuffer(buf)) {
            throw new Error('buffer required');
        }
        if (buf.length < 12) {
            throw new Error('can not parse buffer smaller than fixed header');
        }
        var firstByte = buf.readUInt8(0);
        var secondByte = buf.readUInt8(1);
        var csrcCount = firstByte & 0x0f;
        var parsed:RtpPacket = {
            version          : firstByte >> 6,
            padding          : (firstByte >> 5) & 1,
            extension        : (firstByte >> 4) & 1,
            csrcCount        : csrcCount,
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
            value:new MediaServer()
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
        return true;
    }
    send(message?:Buffer){
        this.server.send(message,0,message.length,this.remotePort,this.remoteAddress);
    }
    public host:string;
    public rtpPort:number;
    public rtcpPort:number;
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
            pack = MediaServer.parsePacket(msg);
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

    }

    public listen(host?:string,rtpPort?:number,rtcpPort?:number):Promise<any>{
        var detect = host?Promise.resolve(host):Util.getLocalIpAddress();
        return detect.then((host:string)=>{
            this.host = host;
            this.rtpPort = rtpPort  = rtpPort||MediaServer.RTP_PORT;
            this.rtcpPort = rtcpPort = rtcpPort||(rtpPort+1);
            this.server.bind(rtpPort,host);
            this.rtcp.bind(rtcpPort,host);
            console.info(`LISTENING RTP:${rtpPort} / RCTP:${rtcpPort}`);
        });
    }
}