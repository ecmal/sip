import {Request} from "../../models/message/request";
import {Contact} from "../../models/common/contact";
import {Util} from "../../models/common/utils";
import {Station} from "../../station";
import {Call} from "./call";
import {InviteDialog} from "./dialog/dialog";
import {InviteMedia} from "./media";
import {IncomingInviteDialog} from "./dialog/incoming";
import {OutgoingInviteDialog} from "./dialog/outgoing";

export class InviteManager {

    public call:Call;
    public dialog:InviteDialog;
    private media:InviteMedia;
    private station:Station;

    public static encodeSdp(sdp:string[]):string{
        return sdp.join('\r\n')+'\r\n';
    }
    public static decodeSdp(sdp:string):any{
        return sdp.trim().split(/\r?\n/).map(p=>p.trim());
    }
    constructor(station:Station){
        this.media = InviteMedia.instance;
        this.station = station;
        this.onRequest = this.onRequest.bind(this);
        this.station.on('request',this.onRequest);
    }
    onRequest(message:Request){
        if(!this.dialog){
            this.dialog = new IncomingInviteDialog(this.station,message)
        }
    }
    sendInvite(to:Contact){
        this.dialog = new OutgoingInviteDialog(this.station,new Request({
            callId:Util.guid(),
            from:this.station.contact,
            to:to
        }));
    }
}