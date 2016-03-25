import {Util} from "../models/common/utils";
import {Call} from "../dialogs/invitation/call";
import {Sdp} from "../models/common/sdp";



/**
 *  0               1               2               3
 *  0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |V=2|P|X|  CC   |M|     PT      |       sequence number         |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                           timestamp                           |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |           synchronization source (SSRC) identifier            |
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 * |            contributing source (CSRC) identifiers             |
 * |                             ....                              |
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |      defined by profile       |           length              |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                        header extension                       |
 * |                             ....                              |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *                              payload
 *                               ....
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * @author <a href="http://bruno.biasedbit.com/">Bruno de Carvalho</a>
 */
export class RtpPacket {
    private static getPayloadType(buffer:Buffer):number{
        return buffer[1] & 0x7F;
    }
    private static hasExtension(buffer:Buffer):boolean{
        return !!(buffer[0] >>> 4 & 1);
    }
    private static getExtensionType(buffer:Buffer){
        var count = RtpPacket.getExtensionCount(buffer);
        if(count>0){
            return (count+1)*4;
        }else{
            return 0;
        }
    }
    private static getExtensionCount(buffer:Buffer){
        if(RtpPacket.hasExtension(buffer)){
            return buffer[14] << 8 & buffer[15];
        }else{
            return 0;
        }
    }
    private static getExtensionLength(buffer:Buffer){
        var count = RtpPacket.getExtensionCount(buffer);
        if(count>0){
            return (count+1)*4;
        }else{
            return 0;
        }
    }
    private static getSourcesCount(buffer:Buffer){
        return buffer[0] & 0x0F;
    }
    private static getSourcesLength(buffer:Buffer){
        return RtpPacket.getSourcesCount(buffer)*4;
    }
    private static getHeaderLength(buffer:Buffer){
        //fixed length
        var len = 12;
        //csrc length
        len += RtpPacket.getSourcesLength(buffer);
        //extensional length
        len += RtpPacket.getExtensionLength(buffer);
        return len;
    }

    constructor (options) {
        this.buffer = null;
        if(options instanceof Buffer){
            this.buffer = options;
            return;
        }else
        if(typeof options=='object'){
            var sCount     = options.sources?options.sources.length:0;
            var eCount     = options.extension?Math.ceil(options.extension.data.length/4):0;
            var pLen       = options.data?options.data.length:0;
            this.buffer    = new Buffer(12-sCount*4+(eCount>0?(eCount*4+4):0)+pLen);
            this.buffer.fill(0);
            this.version   = options.version||2;
            this.padding   = options.padding||false;
            this.marker    = options.marker||false;
            this.type      = options.type||0;
            this.sequence  = options.sequence||0;
            this.timestamp = options.timestamp||0;
            this.source    = options.source||Math.round(Math.random()*0xFFFFFFFF);
            this.sources   = options.sources||[];
            this.extension = options.extension||null;
            this.data      = options.data||new Buffer(0);
        }
    }
    public buffer:Buffer;
    public get version():number{
        return this.buffer[0] >> 6;
    }
    public set version(val:number){
        this.buffer[0] &= 0x3f;
        this.buffer[0] |= (val << 6);
    }
    public get padding():boolean{
        return (this.buffer[0] & 0x20)==0x20;
    }
    public set padding(val:boolean){
        if(val){
            this.buffer[0] |= 0x20;
        }else{
            this.buffer[0] &= 0xdf;
        }
    }
    public get marker():boolean{
        return (this.buffer[1] & 0x80)==0x80;
    }
    public set marker(val:boolean){
        if(val){
            this.buffer[1] |= 0x80;
        }else{
            this.buffer[1] &= 0x7F;
        }
    }

    public get sequence():number{
        return this.buffer.readUInt16BE(2);
    }
    public set sequence(val:number){
        this.buffer.writeInt16BE(val,2);
    }
    public get timestamp():number{
        return (this.buffer.readUInt32BE(4));
    }
    public set timestamp(val:number){
        this.buffer.writeUInt32BE(val,4);
    }

    //contributing sources
    public get sources():number[]{
        var csrcCount = RtpPacket.getSourcesCount(this.buffer);
        var csrcList = [];
        for (var i = 0; i < csrcCount; i++) {
            csrcList.push(this.buffer.readUInt32BE(12 + 4 * i));
        }
        return csrcList;
    }
    public set sources(val:number[]){
        var count = val.length;
        this.buffer[0] &= (count | 0xF0);
        if(count>0){
            throw new Error('todo sources')
        }
    }

    //synchronization source
    public get source():number{
        return this.buffer.readUInt32BE(8);
    }
    public set source(val:number){
        this.buffer.writeInt32BE(val,8);
    }

    public get type():number{
        return RtpPacket.getPayloadType(this.buffer);
    }
    public set type(val:number){
        if (val <= 127) {
            this.buffer[1] &= 0x80;
            this.buffer[1] |= val;
        }
    }

    public get data():Buffer{
        return this.buffer.slice(RtpPacket.getHeaderLength(this.buffer), this.buffer.length);
    }
    public set data(val:Buffer){
        var hLen = RtpPacket.getHeaderLength(this.buffer);
        var oLen = this.buffer.length-hLen;
        var nLen = val.length;
        if(oLen==nLen){
            val.copy(this.buffer,hLen,0,nLen);
        }else {
            this.buffer = Buffer.concat([this.buffer.slice(0,hLen),val],nLen+oLen);
        }
    }

    public get extension():any{
        var eCount = RtpPacket.getExtensionCount(this.buffer);
        if(eCount>0){
            var sCount  = RtpPacket.getSourcesCount(this.buffer);
            var eOffset = 12+sCount*4;
            var eType   = this.buffer.readInt16BE(eOffset);
            var eData   = this.buffer.slice(eOffset+4,eOffset+4+eCount*4);
            return {
                count : eCount,
                type  : eType,
                data  : eData
            }
        }else{
            return null;
        }
    }
    public set extension(val:any){
        if(!val){
            this.buffer[0] &= 0xef;
        }else{
            throw new Error('todo sources')
        }
    }


    public toJSON(){
        return {
            version     : this.version,
            padding     : this.padding,
            marker      : this.marker,
            type        : this.type,
            sequence    : this.sequence,
            timestamp   : this.timestamp,
            source      : this.source,
            sources     : this.sources,
            extension   : this.extension,
            data        : this.data
        }
    }
    public copy(){
        var newBuffer = new Buffer(this.buffer.length);
        this.buffer.copy(newBuffer);
        return new RtpPacket(newBuffer);
    }
}