import {Contact} from "../../models/common/contact";
import {Emitter} from "../../events";
import {Uri} from "../../models/common/uri";

export enum CallState {
    INITIAL,
    TRYING,
    TALKING,
    RINGING,
    ENDED
}
export enum CallDirection {
    INCOMING,
    OUTGOING
}
export class Call extends Emitter {

    public id:string;
    public direction:CallDirection;
    public state:CallState;
    public from:Contact;
    public to:Contact;

    public localMedia:Uri;
    public remoteMedia:Uri;
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
    }

    take(){
        this.emit('take');
    }
    drop(){
        this.emit('drop');
    }

}


