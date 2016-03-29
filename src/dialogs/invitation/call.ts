import {Contact} from "../../models/common/contact";
import {Emitter} from "../../events";
import {Uri} from "../../models/common/uri";
import {Sdp} from "../../models/common/sdp";

export enum CallState {
    INITIAL,
    TRYING,
    TALKING,
    RINGING,
    DIALING,
    ENDED
}
export enum CallDirection {
    INCOMING,
    OUTGOING
}

export class Call extends Emitter {
    static EVENTS = {
        AUDIO       : {
            SENT    : "audio:send",
            RECEIVE : "audio:receive",
            START   : "audio:start",
            STOP    : "audio:stop",
            UPDATE  : "audio:update"
        }
    };

    public id:string;
    public direction:CallDirection;
    public state:CallState;
    public from:Contact;
    public to:Contact;
    
    public localSdp:Sdp;
    public remoteSdp:Sdp;

    public get localUsername(){
        switch(this.direction){
            case CallDirection.OUTGOING:return this.from.uri.username;
            case CallDirection.INCOMING:return this.to.uri.username;
        }
    }
    public get remoteUsername(){
        switch(this.direction){
            case CallDirection.OUTGOING:return this.to.uri.username;
            case CallDirection.INCOMING:return this.from.uri.username;
        }
    }

    constructor(options){
        super();
        this.state = CallState.INITIAL;
        for(var key in options){
            this[key] = options[key];
        }
        this.on('init',()=>{
            this.state = CallState.INITIAL;
        });
        this.on('trying',()=>{
            this.state = CallState.TRYING;
        });
        this.on('ringing',()=>{
            if(this.direction==CallDirection.OUTGOING){
                this.state = CallState.DIALING;
            }else {
                this.state = CallState.RINGING;
            }
        });
        this.on('accept',()=>{
            this.state = CallState.TALKING;
        });
        this.on('done',()=>{
            this.state = CallState.ENDED;
        });
    }

    take(){
        this.emit('take');
    }
    drop(){
        this.emit('drop');
    }

}


