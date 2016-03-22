import {Util} from "../../../models/common/utils";
import {Station} from "../../station";
import {Call} from "../call";
import {InviteManager} from "../manager";


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