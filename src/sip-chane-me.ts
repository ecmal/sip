import {Emitter} from "common/events";

export interface ISipUri {
    name?:string;
    domain?:string;
    port?:number;
    user?:string;
    pass?:string;
    params?:string;
}
export interface ISipMessage {
    from?:ISipUri;
    to?:ISipUri;
}
export class SipValue {
    set string(text:string){
        this[Symbol.for('value')]=text;
    }
    get string():string{
        return this[Symbol.for('value')];
    }
}
export class SipUri extends SipValue implements ISipUri {
    constructor(options:string|ISipUri){
        super();
    }
}
export class SipMessage extends SipValue implements ISipMessage {
    public from:ISipUri;
    public to:ISipUri;
    constructor(options:string|ISipMessage){
        super();
        var text,data:ISipMessage;
        if(typeof options =='string'){
            text = options;
        }else{
            data = options;
        }
    }

}
export class SipEndpoint extends Emitter {
    send(message:SipMessage){

    }
}
export class SipServer extends Emitter {
    listen(host:string,port:number){

    }
}
export class SipClient extends Emitter {
    connect(host:string,port:number){

    }
}