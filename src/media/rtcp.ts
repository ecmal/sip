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
const REPORT_LENGTH=24;
const SR_REPORT_START=28;
const RR_REPORT_START=8;

export class RtcpSRPacket extends RtcpPacket {
    constructor(options){
        super(options);
    }
    public reports:RtcpReport[];
    public get reportsCount(){
        return this.buffer[0] & 0x1F;
    }
    public set reportsCount(val:number){
        if (val <= 31) {
            this.buffer[0] &= 0xe0;
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
        return this.buffer.readUInt32BE(12);
    }
    public set endTime(val:number){
        this.buffer.writeInt32BE(val,12);
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
            padding             : this.padding,
            reportsCount        : this.reportsCount,
            type                : this.type,
            length              : this.length,
            source              : this.source,
            startTime           : this.startTime,
            endTime             : this.endTime,
            timestamp           : this.timestamp,
            senderPacketCount   : this.senderPacketCount,
            senderOctetCount    : this.senderOctetCount,
            reports             : (this.reportsCount==0)?null:RtcpReport.getReports(this.buffer,SR_REPORT_START)
        }
    }

}
export class RtcpRRPacket extends RtcpPacket {
    constructor(options){
        super(options)
    }
    public get reportsCount(){
        return this.buffer[0] & 0x1F;
    }
    public set reportsCount(val:number){
        if (val <= 31) {
            this.buffer[0] &= 0xe0;
            this.buffer[0] |= val;
        }
    }
    public get source():number{
        return this.buffer.readUInt32BE(4);
    }
    public set source(val:number){
        this.buffer.writeInt32BE(val,4);
    }

    public toJSON(){
        return {
            version             : this.version,
            padding             : this.padding,
            reportsCount        : this.reportsCount,
            type                : this.type,
            length              : this.length,
            source              : this.source,
            reports             : (this.reportsCount==0)?null:RtcpReport.getReports(this.buffer,RR_REPORT_START)
        }
    }
}
export class RtcpReport {
    private buffer:Buffer;

    constructor(buffer:Buffer) {
        this.buffer=buffer;
    }
    public static getReports(buffer:Buffer,start:number){
        var reports=[];
        var count:number=buffer.slice(start).length/REPORT_LENGTH;
        for(var i=0;i<count;i++){
            var buf;
            buf=buffer.slice(start+i*REPORT_LENGTH,start+i*REPORT_LENGTH+REPORT_LENGTH);
            reports.push(new RtcpReport(buf).toJSON());
        }
        return reports;
    }
    public get source():number {
        return this.buffer.readUInt32BE(0);
    }
    public set source(val:number) {
        this.buffer.writeInt32BE(val, 0);
    }
    public get lostFraction():number {
        return this.buffer.readUInt8(4);
    }
    public set lostFraction(val:number) {
        this.buffer.writeInt8(val, 4);
    }
    public get lostCount():number {
        return this.buffer.readUIntBE(5,3);
    }
    public set lostCount(val:number) {
        this.buffer.writeIntBE(val,5,3);
    }
    public get highestSequence():number {
        return this.buffer.readUInt32BE(8);
    }
    public set highestSequence(val:number) {
        this.buffer.writeInt32BE(val, 8);
    }
    public get jitter():number {
        return this.buffer.readUInt32BE(12);
    }
    public set jitter(val:number) {
        this.buffer.writeInt32BE(val, 12);
    }
    public get LSR():number {
        return this.buffer.readUInt32BE(16);
    }
    public set LSR(val:number) {
        this.buffer.writeInt32BE(val, 16);
    }
    public get DLSR():number {
        return this.buffer.readUInt32BE(20);
    }
    public set DLSR(val:number) {
        this.buffer.writeInt32BE(val, 20);
    }
    public toJSON(){
        return {
            source           : this.source,
            lostFraction     : this.lostFraction,
            lostCount        : this.lostCount,
            highestSequence  : this.highestSequence,
            jitter           : this.jitter,
            LSR              : this.LSR,
            DLSR             : this.DLSR
        }
    }
}
export class RtcpSDPacket extends RtcpPacket {
    private static getSourcesCount(buffer:Buffer){
        return buffer[0] & 0x1f;
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
    private static getSourcesCount(buffer:Buffer){
        return buffer[0] & 0x1f;
    }
    constructor(options){
        super(options);
    }
    get sources(){
        var cnt =  RtcpGBPacket.getSourcesCount(this.buffer);
        var list = [],ofs=4,type,len,val,source:any;
        for(var s=0;s<cnt;s++){
            list.push(source = {
                id       : this.buffer.readUInt32BE(ofs)
            });
            ofs+=4;

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