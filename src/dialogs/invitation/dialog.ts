import {Util} from "../../models/common/utils";
import {Station} from "../../station";
import {Call} from "./call";
import {Emitter} from "../../events";

export class InviteDialog extends Emitter{
    public static encodeSdp(sdp:string[]):string {
        return sdp.join('\r\n') + '\r\n';
    }
    public static decodeSdp(sdp:string):any {
        return sdp.trim().split(/\r?\n/).map(p=>p.trim());
    }
    static getSdp(username:string, host:string, port:number = 18089) {
        return new Buffer(InviteDialog.encodeSdp(InviteDialog.decodeSdp(`
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

    constructor(station:Station, call:Call) {
        super();
        this.station = station;
        this.call = call;
    }
}





