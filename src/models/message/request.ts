import {Message} from "../message";
import {Uri} from "../common/uri";
import {Transport} from "../../transport";
import {Paint} from "../common/utils";
import {Response} from "./response";
import {Challenge} from "../common/challenge";

export class Request extends Message {

    public method:string;
    public uri:Uri;
    get headline():string{
        return `${this.method} ${this.uri} ${this.version}`;
    }
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
            this.headline,
            ... Message.headersToString(this.headers),
            '',
            ''
        ].join('\r\n');
    }

    print(s?):Request{
        var c = (s?Paint.magenta:Paint.cyan).bind(Paint);
        var t = new Date().toISOString().substring(11,23);
        console.info('');
        console.info(`${c('============================================= ')}${Paint.gray(t)}${c(` REQUEST -- ${s?'>>':'<<'} --`)}`);
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

    reply(status,message,fields:string){
        var data = {status,message};
        fields.trim().split(',').map(l=>l.trim()).forEach(k=>{
            data[k] = this[k];
        });
        return new Response(data);
    }
}
