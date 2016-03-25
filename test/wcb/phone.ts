import {Transport} from "sip/transport";
import {Station} from "sip/station";
import {Contact} from "sip/models/common/contact";
import {Call} from "sip/dialogs/invitation/call";
import {RtpPacket} from "sip/media/rtp";
import {MediaServer} from "sip/media/server";

export class Phone extends Station {
    public currentCall:Call;
    public oPack:RtpPacket;
    public iPack:RtpPacket;
    public startTime:number;
    public get currentTime():number{
        return (new Date().getTime()-this.startTime)&0xFFFFFFFF;
    }
    constructor(username,server,transport:Transport){
        super(`sip:${username}@${server}`,transport);
        this.onRegister = this.onRegister.bind(this);
        this.onCall = this.onCall.bind(this);
        this.on('register',this.onRegister);
        this.on('call',this.onCall);
        this.startTime = new Date().getTime();
        this.oPack=new RtpPacket(new Buffer(`
            8080121d988c324c791a1973
            517bec6d6a7ae7d6e75a5a6a
            dbc9d1584a505b70ded3ccc7
            d457494fefd0d8f9e76d59fd
            ed616cdf6f4c4c76d6dd6052
            5befd8dbec68797d5e60f5df
            ddd6dadfd3cbce734a434c62
            f9e7f66a736a67e4cdcfe7e3
            675265f96a60e8d8dbf6554d
            4a4b4d5aefd8cf7e4e5ed3cf
            dcd0cde65c67dddaf25c5ddf
            cdcf794d4b5cf4ede4d4cfdc
            dfe35b494a5fe6d6df615861
            7271e8ed7cdfea6d6c5d5a7c
            cdcaef5d517bec6d6a7ae7d6
            e75a5a6adbc9d1584a505b70
            ded3ccc7d457494fefd0d8f9
            e76d59fded616cdf6f4c4c76
            d6dd60525befd8dbec68797d
            5e60f5dfddd6dadfd3cbce73
            4a434c62f9e7f66a736a67e4
        `.replace(/\s+/g,''),'hex'));
    }

    onRegister(){
        console.info(`${this.constructor.name} ${this.name} Registered`);
    }

    sendAudio(){
        if(this.currentCall && this.currentCall.remoteSdp){
            var sdp = this.currentCall.remoteSdp;
            var port = sdp.audio.port;
            var host = sdp.connection.connectionAddress;
            this.oPack.marker = false;
            this.oPack.sequence += 1;
            this.oPack.timestamp = this.currentTime;
            MediaServer.instance.send(this.oPack.buffer,port,host);
        }
    }
    onCall(call:Call){
        this.currentCall = call;
        var packets = 0, valid = 0,cid = call.id.substr(0,8);
        var f = call.from.displayName;
        var t = call.to.displayName;
        var d = call.direction?'O':'I';
        call.on('init',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} INIT`);
        });
        call.on('trying',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} TRYING`);
        });
        call.on('ringing',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} RINGING`);
        });
        call.on('update',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} UPDATE`);
        });
        call.on('cancel',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} CANCEL`);
        });
        call.on('bye',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} BYE`);
        });
        call.on('accept',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} ACCEPT`);
        });
        call.on('reject',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} REJECT`);
        });
        call.on('done',()=>{
            console.info(`CALL ${cid} ${d} ${f} ${t} DONE`);
            this.currentCall = null;
        });
        call.on(Call.EVENTS.AUDIO.START,()=>{
            packets = 0;
            this.oPack.marker = true;
            this.oPack.sequence = 0;
            this.oPack.timestamp = this.currentTime;
            this.oPack.source = this.currentCall.localSdp.origin.sessionVersion;
            console.info(`CALL ${cid} ${d} ${f} ${t} AUDIO:START`);
        });
        call.on(Call.EVENTS.AUDIO.STOP,()=>{
            delete this.currentCall.remoteSdp;
            console.info(`CALL ${cid} ${d} ${f} ${t} AUDIO:STOP received:${packets} sent:${this.oPack.sequence} valid:${valid}`);
        });
        call.on(Call.EVENTS.AUDIO.UPDATE,()=>{
            this.oPack.marker = true;
            console.info(`CALL ${cid} ${d} ${f} ${t} AUDIO:UPDATE`);
        });

        call.on(Call.EVENTS.AUDIO.RECEIVE,(pack:RtpPacket)=>{
            this.iPack = pack;
            if(this.iPack.data.slice(0,16).compare(this.oPack.data.slice(0,16))==0){
                valid++;
            }
            packets++;
        });
    }
    call(extension){
        this.calls.sendInvite(new Contact(`sip:${extension}@${this.constructor['server']}`));
    }
    drop(){
        if(this.currentCall){
            this.currentCall.drop();
        }else{
            console.error("No Call Session Available")
        }
    }
    take(){
        if(this.currentCall){
            this.currentCall.take();
        }else{
            console.error("No Call Session Available")
        }
    }
}

