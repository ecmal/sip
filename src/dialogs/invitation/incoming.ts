import {Call, CallState, CallDirection} from "./call";
import {Station} from "../../station";
import {Request} from "../../models/message/request";
import {Response} from "../../models/message/response";
import {MediaServer} from "../../media/server";
import {InviteDialog} from "./dialog";
import {Sequence} from "../../models/common/sequence";
import {Mime} from "../../models/common/mime";
import {Sdp} from "../../models/common/sdp";

export class IncomingInviteDialog extends InviteDialog {
    private request:Request;
    constructor(station:Station,request:Request){
        super(station,new Call({
            id          : request.callId,
            direction   : CallDirection.INCOMING,
            from        : request.from,
            to          : request.to
        }));
        MediaServer.listenTo(this.call);
        this.onResponse = this.onResponse.bind(this);
        this.onRequest = this.onRequest.bind(this);
        this.init(this.request=request)
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
                // todo cleanup
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
        //request.print();
        if(request.contentLength>0) {
            MediaServer.talkTo(this.call,new Sdp(request.content));
        }
    }
    protected onBye(request:Request){
        this.sendByeAccept(request)
    }
    protected onInvite(request:Request){
        if(request.contentLength>0) {
            MediaServer.talkTo(this.call,new Sdp(request.content));
        }
        this.sendUpdateAccept(request);
    }
    protected onCancel(request:Request){
        this.sendCancelAccept(request)
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
            uri             : this.request.contact.uri,
            from            : from,
            to              : to,
            callId          : this.call.id,
            sequence        : new Sequence({
                method      : "BYE",
                value       : 1
            })
        });
        request.setHeader("Route",this.request.getHeader("Record-Route"));
        request.setHeader("Max-Forwards",70);
        request.contentLength = 0;
        this.emit("bye");
        this.done();
        this.station.transport.send(request);
    }
    protected sendByeAccept(message:Request){
        this.station.transport.send(new Response({
            status      :200,
            message     :'OK',
            via         :message.vias,
            from        :message.from,
            to          :message.to,
            sequence    :message.sequence,
            callId      :message.callId,
        }));
        this.emit('bye');
        this.done();
    }
    protected sendCancelAccept(message:Request){
        var response = new Response({
            status          : '200',
            message         : 'Ok',
            via             : message.vias,
            from            : message.from,
            to              : message.to,
            sequence        : message.sequence,
            callId          : message.callId,
            contentLength   : 0
        });
        this.station.transport.send(response);
        this.emit('cancel');
        this.done()
    }
    protected sendUpdateAccept(message:Request){
        var response = new Response({
            status      : 200,
            message     : 'OK',
            via         : message.vias,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId,
            contentType : Mime.SDP,
            content     : new Buffer(this.call.localSdp.toString())
        });
        this.emit('update');
        this.station.transport.send(response);
    }
    protected sendInviteAccept(message:Request){
        var response = new Response({
            status      : 200,
            message     : 'OK',
            via         : message.vias,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId,
            contentType : Mime.SDP,
            content     : new Buffer(MediaServer.listenTo(this.call).toString())
        });
        this.emit('accept');
        this.station.transport.send(response);
    }
    protected sendInviteReject(message:Request){
        var response = new Response({
            status      : 603,
            message     : 'Decline',
            via         : message.vias,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId
        });
        this.emit('reject');
        this.done();
        this.station.transport.send(response);
    }
    protected sendInviteTrying(message:Request){
        var response = new Response({
            status      : 100,
            message     : 'Trying',
            via         : message.vias,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId
        });
        this.emit('trying');
        this.station.transport.send(response);
    }
    protected sendInviteRinging(message:Request){
        var response = new Response({
            status      : 180,
            message     : 'Ringing',
            via         : message.vias,
            from        : message.from,
            to          : message.to,
            sequence    : message.sequence,
            callId      : message.callId
        });
        this.emit('ringing');
        this.station.transport.send(response);
    }

    protected init(request:Request){
        this.station.transport.on(`response:${this.call.id}`,this.onResponse);
        this.station.transport.on(`request:${this.call.id}`,this.onRequest);
        var onTake = ()=>{
            this.call.off('take',onTake);
            this.call.off('drop',onDrop);
            this.sendInviteAccept(request);
            this.call.once('drop',()=>{
                this.sendBye();
            })
        };
        var onDrop = ()=>{
            this.call.off('take',onTake);
            this.call.off('drop',onDrop);
            this.sendInviteReject(request);
        };
        this.call.on('take',onTake);
        this.call.on('drop',onDrop);

        this.station.emit('call',this.call);
        this.emit('init');
        this.sendInviteTrying(request);
        this.sendInviteRinging(request);
    }
    protected done(){
        this.call.off('drop');
        if(this.call.remoteSdp){
            var sdp = this.call.remoteSdp;
            //delete this.call.remoteSdp;
            //delete this.call.localSdp;
            this.call.emit(Call.EVENTS.AUDIO.STOP,
                sdp.audio.port,
                sdp.connection.connectionAddress,
                0,'0.0.0.0'
            );
        }
        this.station.transport.off(`response:${this.call.id}`,this.onResponse);
        this.station.transport.off(`request:${this.call.id}`,this.onRequest);
        this.emit('done');
    }
    public emit(event,...args){
        this.call.emit(event,...args);
        super.emit(event,...args);

    }
}





