import {Contact} from "../../models/common/contact";
import {Call} from "./call";
import {Station} from "../../station";
import {InviteDialog} from "./dialog";
import {Request} from "../../models/message/request";
import {IncomingInviteDialog} from "./incoming";
import {OutgoingInviteDialog} from "./outgoing";
import {Util} from "../../models/common/utils";

export class InviteManager {

    public call:Call;
    public dialog:InviteDialog;
    public station:Station;

   
    constructor(station:Station){
        this.station = station;
        this.onRequest = this.onRequest.bind(this);
        this.station.on('request',this.onRequest);
    }
    onRequest(message:Request){
        if(!this.dialog && message.method=="INVITE"){
            this.createDialog(message,IncomingInviteDialog);
        }
    }
    sendInvite(to:Contact){
        if(!this.dialog){
            this.createDialog(new Request({
                callId  : Util.guid(),
                from    : this.station.contact,
                to      : to
            }),OutgoingInviteDialog)
        }
    }

    protected createDialog(request:Request,type:{
        new(station:Station,request:Request):InviteDialog
    }){
        this.dialog = new type(this.station,request);
        this.dialog.once('done',()=>{
            this.dialog = null
        });
    }
}