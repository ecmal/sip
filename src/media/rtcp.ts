import {Util} from "../models/common/utils";
import {Call} from "../dialogs/invitation/call";
import {Sdp} from "../models/common/sdp";

export class RtcpPacket {
    static parse(buffer:Buffer){
        switch(RtcpPacket.getType(buffer)){
            case 200 : return new RtcpSRPacket(buffer);
            case 201 : return new RtcpRRPacket(buffer);
            case 202 : return new RtcpSDPacket(buffer);
            case 203 : return new RtcpGBPacket(buffer);
            case 204 : return new RtcpAPPacket(buffer);
        }
    }
    static getType(buffer:Buffer){
        return buffer[1];
    }
    static getLength(buffer:Buffer){
        return (buffer.readUInt16BE(2)+1)*4;
    }
    constructor (options) {
        if(options instanceof Buffer){
            if(this.constructor==RtcpPacket){
                return RtcpPacket.parse(options)
            }else{
                this.buffer = options;
            }
        }
    }

    public buffer:Buffer;

    public get version():number{
        return this.buffer[0] >> 6;
    }
    public set version(val:number){
        this.buffer[0] |= (val << 6);
    }
    public get padding():number{
        return (this.buffer[0] >> 5) & 1
    }
    public set padding(val:number){
        this.buffer[0] |= ((val&1) << 5);
    }
    public get type():number{
        return this.buffer[1];
    }
    public set type(val:number){
        val = Util.toUnsigned(val);
        if (val <= 127) {
            this.buffer[1] &= 0x80;
            this.buffer[1] |= val;
        }
    }
    public get length():number{
        return RtcpPacket.getLength(this.buffer);
    }
    public set length(val:number){

    }

    public toJSON(){
        return {
            version             : this.version,
            type                : this.type,
            length              : this.length
        }
    }

    public copy(){
        var newBuffer = new Buffer(this.buffer.length);
        this.buffer.copy(newBuffer);
        return new RtcpPacket(newBuffer);
    }
}
export class RtcpSRPacket extends RtcpPacket {
    constructor(options){
        super(options)
    }
    public get reportCount():number{
        return (this.buffer[0] & 0x7F);
    }
    public set reportCount(val:number){
        val = Util.toUnsigned(val);
        if (val <= 15) {
            this.buffer[0] &= 0xF0;
            this.buffer[0] |= val;
        }
    }
    public get source():number{
        return this.buffer.readUInt32BE(4);
    }
    public set source(val:number){
        this.buffer.writeInt32BE(val,4);
    }
    public get startTime():number{
        return this.buffer.readUInt32BE(8);
    }
    public set startTime(val:number){
        this.buffer.writeInt32BE(val,8);
    }
    public get endTime():number{
        return this.buffer.readUInt32BE(16);
    }
    public set endTime(val:number){
        this.buffer.writeInt32BE(val,16);
    }
    public get timestamp():number{
        return this.buffer.readUInt32BE(16);
    }
    public set timestamp(val:number){
        this.buffer.writeInt32BE(val,16);
    }
    public get senderPacketCount():number{
        return this.buffer.readUInt32BE(20);
    }
    public set senderPacketCount(val:number){
        this.buffer.writeInt32BE(val,20);
    }
    public get senderOctetCount():number{
        return this.buffer.readUInt32BE(24);
    }
    public set senderOctetCount(val:number){
        this.buffer.writeInt32BE(val,24);
    }
    public toJSON(){
        return {
            version             : this.version,
            type                : this.type,
            length              : this.length,
            source              : this.source,
            startTime           : this.startTime,
            endTime             : this.endTime,
            timestamp           : this.timestamp,
            senderPacketCount   : this.senderPacketCount,
            senderOctetCount    : this.senderOctetCount
        }
    }

}
export class RtcpRRPacket extends RtcpPacket {
    constructor(options){
        super(options)
    }
}
export class RtcpSDPacket extends RtcpPacket {
    private static getSourcesCount(buffer:Buffer){
        return buffer[0] & 0x3f;
    }
    constructor(options){
        super(options);
    }
    get sources(){
        var cnt =  RtcpSDPacket.getSourcesCount(this.buffer);
        var list = [],ofs=4,type,len,val,source:any;
        for(var s=0;s<cnt;s++){
            list.push(source = {
                id       : this.buffer.readUInt32BE(ofs)
            });
            ofs+=4;
            while(type=this.buffer[ofs]){
                len = this.buffer[ofs+1];
                val = this.buffer.toString('utf8',ofs+2,ofs+2+len);
                ofs = ofs+2+len;
                switch(type){
                    case 1 : source.uri         = val; break;
                    case 2 : source.name        = val; break;
                    case 3 : source.email       = val; break;
                    case 4 : source.phone       = val; break;
                    case 5 : source.location    = val; break;
                    case 6 : source.tool        = val; break;
                    case 7 : source.note        = val; break;
                }
            }
            ofs++;
        }
        return list;
    }
    public toJSON(){
        return {
            version             : this.version,
            type                : this.type,
            length              : this.length,
            sources             : this.sources

        }
    }
}

export class RtcpAPPacket extends RtcpPacket {
    constructor(options){
        super(options)
    }
}
export class RtcpGBPacket extends RtcpPacket {
    constructor(options){
        super(options)
    }
}