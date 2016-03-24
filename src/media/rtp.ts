import {Util} from "../models/common/utils";
import {Call} from "../dialogs/invitation/call";
import {Sdp} from "../models/common/sdp";

export class RtpPacket {
    constructor (options) {
        this.buffer = null;
        if(options instanceof Buffer){
            this.buffer=options;
            return;
        }

        var opts = options ? options : {};

        var V = opts.V ? opts.V : 2, // version. always 2 for this RFC (2 bits)
            P = opts.P ? opts.P : 0, // padding. not supported yet, so always 0 (1 bit)
            X = opts.X ? opts.X : 0, // header extension (1 bit)
            CC = opts.CC ? opts.CC : 0, // CSRC count (4 bits)
            M = opts.M ? opts.M : 0, // marker (1 bit)
            PT = opts.PT ? opts.PT : 0, // payload type. see section 6 in RFC3551 for valid types: http://www.ietf.org/rfc/rfc3551.txt (7 bits)
            sequenceNumber = opts.sequenceNumber ? opts.sequenceNumber : Math.floor(Math.random() * 1000), // sequence number. SHOULD be random (16 bits)
            timestamp = opts.timestamp ? opts.timestamp : Math.floor(Math.random() * 1000), // timestamp in the format of NTP (# sec. since 0h UTC 1 January 1900)? (32 bits)
            SSRC = opts.SSRC ? opts.SSRC : Math.floor(Math.random()*4294967296), // synchronization source (32 bits)
            CSRC = opts.CSRC ? opts.CSRC : [], // contributing sources list. not supported yet (32 bits)
            defByProfile = opts.defByProfile ? opts.defByProfile : 0, // header extension, 'Defined By Profile'. not supported yet (16 bits)
            extensionLength = opts.extensionLength ? opts.extensionLength : -1, // header extension length. default -1 make (extension+1)*4 equal 0 (16 bits)
            payload=opts.payload?opts.payload:null;

        var lengthOfHeader =
                12 +
                (extensionLength + 1) * 4 +
                (CC) * 4, //totalLength of header
            lengthOfPayload=0,
            buffersList = [];

        //fixed header
        var header = new Buffer(12);
        header[0] = (V << 6 | P << 5 | X << 4 | CC);
        header[1] = (M << 7 | PT);
        header[2] = (sequenceNumber >>> 8);
        header[3] = (sequenceNumber & 0xFF);
        header[4] = (timestamp >>> 24);
        header[5] = (timestamp >>> 16 & 0xFF);
        header[6] = (timestamp >>> 8 & 0xFF);
        header[7] = (timestamp & 0xFF);
        header[8] = (SSRC >>> 24);
        header[9] = (SSRC >>> 16 & 0xFF);
        header[10] = (SSRC >>> 8 & 0xFF);
        header[11] = (SSRC & 0xFF);

        buffersList.push(header);

        //extensional header
        if (X === 1) {
            var extension = new Buffer((extensionLength + 1) * 4);
            extension[0] = (defByProfile >>> 8 & 0xFF);
            extension[1] = (defByProfile & 0xFF);
            extension[2] = (extensionLength >>> 8 & 0xFF);
            extension[3] = (extensionLength & 0xFF);

            for (var i = 0; i < extensionLength; i++) {
                //do something
            }

            buffersList.push(extension);
        }

        //CSRC
        if (CC > 0) {
            var CSRClength = CC * 4;
            var CSRClist = new Buffer(CSRClength);

            for (var i = 0; i < CC; i++) {
                //do something
                var CSRCitem = CSRC[i] ? CSRC[i] : 0;
                CSRClist[i] = (CSRCitem >>> 24);
                CSRClist[i + 1] = (CSRCitem >>> 16 & 0xFF);
                CSRClist[i + 2] = (CSRCitem >>> 8 & 0xFF);
                CSRClist[i + 3] = (CSRCitem & 0xFF);
            }

            buffersList.push(CSRClist);
        }

        if(payload){

            lengthOfPayload=payload.length;

            buffersList.push(payload);
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
    public get extension():number{
        return (this.buffer[0] >>> 4 & 1);
    }
    public set extension(val:number){
        this.buffer[0] |= ((val<<4)|0xEF);
    }
    public get marker():number{
        return (this.buffer[1] >>> 7);
    }
    public set marker(val:number){
        this.buffer[1] |= ((val<<7)|0x7F);
    }

    public get extensionLength():number{
        if (this.extension) {
            return (this.buffer[14] << 8 & this.buffer[15]);
        } else {
            return 0;
        }
    }
    public get headerLength():number{
        //fixed length
        var len = 12;

        //extensional length
        var extensionLength = this.extensionLength;
        if (extensionLength !== 0) {
            len += (extensionLength + 1);
        }

        //CSRC counts
        len += this.csrcCount;

        //return
        return len;
    }
    public get csrcCount():number{
        return (this.buffer[0] & 0x0F);
    }
    public set csrcCount(val:number){
        val = Util.toUnsigned(val);
        if (val <= 15) {
            this.buffer[0] &= 0xF0;
            this.buffer[0] |= val;
        }
    }



    public get type():number{
        return (this.buffer[1] & 0x7F);
    }
    public set type(val:number){
        val = Util.toUnsigned(val);
        if (val <= 127) {
            this.buffer[1] &= 0x80;
            this.buffer[1] |= val;
        }
    }
    public get sequence():number{
        return this.buffer.readUInt16BE(2);
    }
    public set sequence(val:number){
        val = Util.toUnsigned(val);
        if (val <= 65535) {
            this.buffer[2] = (val >>> 8);
            this.buffer[3] = (val & 0xFF);
        }
    }
    public get timestamp():number{
        return this.buffer.readUInt32BE(4);
    }
    public set timestamp(val:number){
        val = Util.toUnsigned(val);
        if (val <= 4294967295) {
            this.buffer[4] = (val >>> 24);
            this.buffer[5] = (val >>> 16 & 0xFF);
            this.buffer[6] = (val >>> 8 & 0xFF);
            this.buffer[7] = (val & 0xFF);
        }
    }
    public get csrc():number[]{
        var csrcCount = this.buffer[0] & 0x0f;
        var csrcList = [];
        for (var i = 0; i < csrcCount; i++) {
            csrcList.push(this.buffer.readUInt32BE(9 + 4 * i));
        }
        return csrcList;
    }
    public get ssrc():number{
        return this.buffer.readUInt32BE(8);
    }
    public set ssrc(val:number){
        this.buffer.writeInt32BE(val,8);
    }
    public get payload():Buffer{
        return (this.buffer.slice(this.headerLength, this.buffer.length));
    }
    public set payload(val:Buffer){
        if (Buffer.isBuffer(val) && val.length <= 512) {
            var lengthOfHeader = this.headerLength;
            var newLength = this.headerLength + val.length;
            if (this.buffer.length == newLength) {
                val.copy(this.buffer, lengthOfHeader, 0);
            } else {
                var newbuf = new Buffer(newLength);
                this.buffer.copy(newbuf, 0, 0, lengthOfHeader);
                val.copy(newbuf, lengthOfHeader, 0);
                this.buffer = newbuf;
            }
        }
    }

    public copy(){
        var newBuffer = new Buffer(this.buffer.length);
        this.buffer.copy(newBuffer);
        return new RtpPacket(newBuffer);
    }
}