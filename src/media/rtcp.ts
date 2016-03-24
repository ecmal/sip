import {Util} from "../models/common/utils";
import {Call} from "../dialogs/invitation/call";
import {Sdp} from "../models/common/sdp";

export class RtcpPacket {
    constructor (options) {
        this.buffer = null;
        if(options instanceof Buffer){
            this.buffer=options;
            return;
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
    public get marker():number{
        return (this.buffer[1] >>> 7);
    }
    public set marker(val:number){
        this.buffer[1] |= ((val<<7)|0x7F);
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
    public get packetLength():number{
        return this.buffer.readUInt16BE(2);
    }
    public set packetLength(val:number){

    }
    public get ssrc():number{
        return this.buffer.readUInt32BE(4);
    }
    public set ssrc(val:number){
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
        return this.buffer.readUInt32BE(24);
    }
    public set timestamp(val:number){
        this.buffer.writeInt32BE(val,24);
    }
    public get senderPacketCount():number{
        return this.buffer.readUInt32BE(32);
    }
    public set senderPacketCount(val:number){
        this.buffer.writeInt32BE(val,32);
    }
    public get senderOctetCount():number{
        return this.buffer.readUInt32BE(40);
    }
    public set senderOctetCount(val:number){
        this.buffer.writeInt32BE(val,40);
    }
    

    public copy(){
        var newBuffer = new Buffer(this.buffer.length);
        this.buffer.copy(newBuffer);
        return new RtcpPacket(newBuffer);
    }
}