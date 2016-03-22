import {Call, CallState, CallDirection} from "./call";
import {Station} from "../../station/station";
import {Request} from "../../models/message/request";
import {Response} from "../../models/message/response";
import {MediaServer} from "../../media/server";
import {InviteDialog} from "./dialog";
import {Sequence} from "../../models/common/sequence";
import {Mime} from "../../models/common/mime";

export class OutgoingInviteDialog extends InviteDialog {

    constructor(station:Station,request:Request){
        super(station, new Call({
            id          : request.callId,
            direction   : CallDirection.OUTGOING,
            from        : request.from,
            to          : request.to
        }));
        this.onResponse = this.onResponse.bind(this);
        this.onRequest = this.onRequest.bind(this);
        this.init(request)
    }

    protected onResponse(message:Response){
        if(message.status == 100){
            this.call.emit('trying');
        } else
        if(message.status == 180){
            this.call.emit('ringing');
        } else
        if(message.status == 200){
            if(message.sequence.method=="INVITE"){
                this.call.emit('accept');
                var sdp = message.content.toString();
                //this.media.remotePort = parseInt(sdp.match(/m=audio\s+(\d+)/)[1]);
                //this.media.remoteAddress = sdp.match(/c=IN\s+IP4\s+(\d+\.\d+.\d+\.\d+)/)[1];
                //this.media.enabled = true;
                //console.info(`Send Media To ${this.media.remoteAddress}:${this.media.remotePort}`);
                this.sendAck(message);
            }
        } else {
            this.call.emit('reject');
            message.print()
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
    protected onAck(request:Request){
        //console.info("GOT ACK");
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
        this.call.emit("bye")
        this.done();
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
    protected sendBye(){
        this.call.state=CallState.ENDED;
        var from,to;
        if(this.call.from.uri.username==this.station.contact.uri.username){
            from = this.call.from;
            to = this.call.to;
        }else{
            from = this.call.to;
            to = this.call.from;
        }
        var request = new Request({
            method          : "BYE",
            uri             : to.uri,
            from            : from,
            to              : to,
            callId          : this.call.id,
            sequence        : new Sequence({
                method      : "BYE",
                value       : 1
            })
        });
        request.setHeader("Max-Forwards",70);
        request.contentLength = 0;
        this.call.emit('bye');
        this.done();
        this.station.transport.send(request);
    }
    protected sendInvite(){
        this.station.transport.send(new Request({
            method          : "INVITE",
            sequence        : new Sequence({
                method      : "INVITE",
                value       : 1
            }),
            uri             : this.call.to.uri,
            callId          : this.call.id,
            from            : this.call.from,
            to              : this.call.to,
            supported       : ['outbound', 'replaces', 'join'],
            maxForwards     : 70,
            contentType     : Mime.SDP,
            content         : InviteDialog.getSdp(
                this.station.contact.uri.username,
                this.station.transport.localAddress,
                MediaServer.RTP_PORT
            )
        }))
    }
    protected sendInviteAccept(message:Request){
        this.call.emit("update");
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
                MediaServer.RTP_PORT
            )
        });
        this.station.transport.send(response);
    }
    protected init(request:Request){
        this.station.transport.on(`response:${this.call.id}`,this.onResponse);
        this.station.transport.on(`request:${this.call.id}`,this.onRequest);
        this.station.emit('call',this.call);
        this.call.once('drop',()=>{
            this.sendBye()
        });
        this.emit('init');
        this.sendInvite();
    }
    protected done(){
        this.station.transport.off(`response:${this.call.id}`,this.onResponse);
        this.station.transport.off(`request:${this.call.id}`,this.onRequest);
        this.call.emit('done');
        this.emit('done');
    }
}




