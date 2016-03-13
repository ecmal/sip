import {Message} from "../message";
import {Uri} from "../common/uri";
import {Via} from "../common/via";
import {Transport} from "../../transport";
import {Contact} from "../common/contact";
import {Sequence} from "../common/sequence";
import {Agent} from "../common/agent";
import {Util} from "../common/utils";
import {Response} from "./response";
import {Challenge} from "../common/challenge";
export class Request extends Message {

    public method:string;
    public uri:Uri;

    set expires(value:number){
        this.setHeader(Message.HEADERS.EXPIRES,value);
    }
    get expires():number{
        return this.getHeader(Message.HEADERS.EXPIRES)
    }
    
    get authorization():Challenge {
        return this.getHeader(Message.HEADERS.AUTHORIZATION);
    }
    set authorization(value:Challenge) {
        this.setHeader(Message.HEADERS.AUTHORIZATION,value);
    }

    toString(){
        var header = (k,h)=>{
            if(Array.isArray(h)){
                return h.map(i=>header(k,i))
            }else{
                return [`${k}: ${h}`]
            }
        };
        var headers = ()=>{
            return Object.keys(this.headers).map(k=>{
                return header(k,this.headers[k]).join('\r\n')
            })
        };
        return [
            `${this.method} ${this.uri} ${this.version}`,
            ...headers(),
            '',
            ''
        ].join('\r\n');
    }

}
