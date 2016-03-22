import {Request} from "../../../models/message/request";
import {Sequence} from "../../../models/common/sequence";
import {Response} from "../../../models/message/response";
import {Station} from "../../station";
import {Mime} from "../../../models/common/mime";
import {InviteDialog} from "./dialog";
import {CallDirection,Call,CallState} from "../call";
import {InviteMedia} from "../media";

export class IncomingInviteDialog extends InviteDialog {

    constructor(station:Station,request:Request){
        super(station,new Call({
            id          : request.callId,
            direction   : CallDirection.INCOMING,
            from        : request.from,
            to          : request.to
        }));
        this.onResponse = this.onResponse.bind(this);
        this.onRequest = this.onRequest.bind(this);
        this.station.transport.on(`response:${this.call.id}`,this.onResponse);
        this.station.transport.on(`request:${this.call.id}`,this.onRequest);
        this.sendInviteAccept(request);
    }
    protected onResponse(message:Response){
        if(message.status == 100){
            this.call.state = CallState.TRYING;
            this.station.emit('invite',this.call);
        } else
        if(message.status == 180){
            this.call.state = CallState.RINGING;
            this.station.emit('dialing',this.call);
        } else
        if(message.status == 200){
            if(message.sequence.method=="INVITE"){
                this.call.state = CallState.TALKING;
                this.station.emit('call',this.call);
                var sdp = message.content.toString();
                //this.media.remotePort = parseInt(sdp.match(/m=audio\s+(\d+)/)[1]);
                //this.media.remoteAddress = sdp.match(/c=IN\s+IP4\s+(\d+\.\d+.\d+\.\d+)/)[1];
                //this.media.enabled = true;
                //console.info(`Send Media To ${this.media.remoteAddress}:${this.media.remotePort}`);
                this.sendAck(message);
            }
        } else {
            //this.station.emit('bye',this.call);
        }
    }
    protected onRequest(message:Request){
        if(message.method=="ACK"){
            this.onAck(message)
        }else
        if(message.method=="BYE"){
            this.onBye(message)
        } else
        if(message.method=="INVITE"){
            this.onInvite(message);
        } else
        if(message.method=="CANCEL"){
            this.onCancel(message)
        }
    }
    protected sendAck(response:Response){
        this.station.transport.send(new Request({
            method          : "ACK",
            uri             : response.contact.uri,
            from            : response.from,
            to              : response.to,
            callId          : response.callId,
            maxForwards     : 70,
            sequence        : new Sequence({
                method      : "ACK",
                value       : 1
            })
        }))
    }
    protected onAck(request:Request){
        console.info("GOT ACK");
    }
    protected onBye(request:Request){
        this.sendByeAccept(request)
    }
    protected onInvite(request:Request){
        this.sendInviteAccept(request);
    }
    protected onCancel(request:Request){
        this.sendCancelAccept(request)
    }
    protected sendByeAccept(message:Request){
        this.station.transport.send(new Response({
            status      :200,
            message     :'OK',
            via         :message.via,
            from        :message.from,
            to          :message.to,
            sequence    :message.sequence,
            callId      :message.callId,
        }));
    }
    protected sendCancelAccept(message:Request){
        var response = new Response({
            status          : '200',
            message         : 'Ok',
            via             : message.via,
            from            : message.from,
            to              : message.to,
            sequence        : message.sequence,
            callId          : message.callId,
            contentLength   : 0
        });
        this.station.transport.send(response);
    }
    protected sendInviteAccept(message:Request){
        var response = new Response({
            status      : 200,
            message     : 'OK',
            via         : message.via,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId,
            contentType : new Mime({
                type        : 'application',
                subtype     : 'sdp'
            }),
            content     : InviteDialog.getSdp(
                this.station.contact.uri.username,
                this.station.transport.localAddress,
                InviteMedia.RTP_PORT
            )
        });
        this.station.transport.send(response);
    }

}