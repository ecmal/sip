import {Message} from "../message";
import {Uri} from "../common/uri";
import {Via} from "../common/via";
import {Transport} from "../../transport";
import {Contact} from "../common/contact";
import {Sequence} from "../common/sequence";
import {Agent} from "../common/agent";
import {Util, Paint} from "../common/utils";
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
        return [
            `${this.method} ${this.uri} ${this.version}`,
            ... Message.headersToString(this.headers),
            '',
            ''
        ].join('\r\n');
    }

    print(s?):Request{
        var c = (s?Paint.magenta:Paint.cyan).bind(Paint);
        console.info('');
        console.info(c(`========================================================== REQUEST -- ${s?'>>':'<<'} --`));
        console.info(`${Paint.blue(Paint.bold(this.method))} ${Paint.blue(this.uri.toString())} ${this.version}`);
        console.info(c(`---------------------------------------------------------- HEADERS -- ${s?'>>':'<<'} --`));
        console.info(Message.headersToDebugString(this.headers).join('\n'));
        if(this.content && this.content.length){
            console.info(c(`------------------------------------------------------------- BODY -- ${s?'>>':'<<'} --`));
            console.info(Paint.gray(this.content.toString().trim()));
        }
        console.info(c(`-------------------------------------------------------------- END -- ${s?'>>':'<<'} --`));
        return this;
    }

    send(transport:Transport):Promise<Response>{
        return transport.request(this);
    }
}
