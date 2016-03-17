import {Transport} from "../transport";
import {Model} from "./model";
import {Version} from "./common/version";
import {Agent} from "./common/agent";
import {Via} from "./common/via";
import {Sequence} from "./common/sequence";
import {Contact} from "./common/contact";
import {Event} from "./common/event";
import {Paint, Color} from "./common/utils";

export class Message extends Model {

    static headersToString(headers){
        var header = (k,h)=>{
            if(['Allow','Supported'].indexOf(k)>=0){
                h = Array.isArray(h) ? h.join(', '):h
            }
            if(Array.isArray(h)){
                return h.map(i=>header(k,i))
            }else{
                return [`${k}: ${h}`]
            }
        };
        return Object.keys(headers).sort().map(k=>{
            return header(k,headers[k]).join('\r\n')
        });
    }
    static headersToDebugString(headers){
        var header = (k,h)=>{
            if(['Allow','Supported'].indexOf(k)>=0){
                h = Array.isArray(h) ? h.join(', '):h
            }
            if(Array.isArray(h)){
                return h.map(i=>header(k,i))
            }else{
                return [`${Paint.underline(Paint.gray(k))}: ${Paint.gray(h)}`]
            }
        };
        return Object.keys(headers).sort().map(k=>{
            return header(k,headers[k]).join('\r\n')
        });
    }
    static HEADERS  = {
        VIA                 : 'Via',
        USER_AGENT          : 'User-Agent',
        CONTENT_LENGTH      : 'Content-Length',
        CALL_ID             : 'Call-ID',
        CSEQ                : 'CSeq',
        FROM                : 'From',
        TO                  : 'To',
        CONTACT             : 'Contact',
        EXPIRES             : 'Expires',
        WWW_AUTHENTICATE    : 'WWW-Authenticate',
        AUTHORIZATION       : 'Authorization',
        ALLOW               : 'Allow',
        EVENT               : 'Event',
        MAX_FORWARDS        : 'Max-Forwards',
        SUPPORTED           : 'Supported'
    };

    version:Version;
    get headers():any {
        return Object.defineProperty(this,'headers',<any>{
            value:Object.create(null)
        }).headers
    };
    set headers(v){
        for(var k in v){
            this.headers[k] = v[k];
        }
    }
    content:Buffer;

    set callId(value:string){
        this.setHeader(Message.HEADERS.CALL_ID,value);
    }
    get callId():string{
        return this.getHeader(Message.HEADERS.CALL_ID)
    }
    set sequence(value:Sequence){
        this.setHeader(Message.HEADERS.CSEQ,value);
    }
    get sequence():Sequence{
        return this.getHeader(Message.HEADERS.CSEQ)
    }
    set from(value:Contact){
        this.setHeader(Message.HEADERS.FROM,value);
    }
    get from():Contact{
        return this.getHeader(Message.HEADERS.FROM)
    }
    set to(value:Contact){
        this.setHeader(Message.HEADERS.TO,value);
    }
    get to():Contact{
        return this.getHeader(Message.HEADERS.TO)
    }
    set contact(value:Contact){
        this.setHeader(Message.HEADERS.CONTACT,value);
    }
    get contact():Contact{
        var contacts = this.getHeader(Message.HEADERS.CONTACT);
        if(Array.isArray(contacts)){
            return contacts[0];
        }else{
            return <any>contacts;
        }

    }

    set event(value:Event){
        this.setHeader(Message.HEADERS.EVENT,value);
    }
    get event():Event{
        var events = this.getHeader(Message.HEADERS.EVENT);
        if(Array.isArray(events)){
            return events[0];
        }else{
            return <any>events;
        }
    }

    set supported(value:string[]){
        this.setHeader(Message.HEADERS.SUPPORTED,value);
    }
    get supported():string[]{
        return this.getHeader(Message.HEADERS.SUPPORTED);
    }

    set allow(value:string[]){
        this.setHeader(Message.HEADERS.ALLOW,value);
    }
    get allow():string[]{
        return this.getHeader(Message.HEADERS.ALLOW);
    }

    public set contentLength(value:number){
        this.setHeader(Message.HEADERS.CONTENT_LENGTH,value);
    }
    public get contentLength():number{
        return <number>this.getHeader(Message.HEADERS.CONTENT_LENGTH);
    }
    public set maxForwards(value:number){
        this.setHeader(Message.HEADERS.MAX_FORWARDS,value);
    }
    public get maxForwards():number{
        return <number>this.getHeader(Message.HEADERS.MAX_FORWARDS);
    }

    public set agent(value:Agent){
        this.setHeader(Message.HEADERS.USER_AGENT,value);
    }
    public get agent():Agent{
        return this.getHeader(Message.HEADERS.USER_AGENT)
    }
    public set via(value:Via){
        this.setHeader(Message.HEADERS.VIA,value);
    }
    public get via():Via{
        var vias = this.getHeader(Message.HEADERS.VIA);
        if(Array.isArray(vias)){
            return vias[0];
        }else{
            return <any>vias;
        }
    }


    getHeader(name:string){
        return this.headers[name];
    }
    setHeader(name:string,value:any){
        this.headers[name] = value;
    }

    constructor(data?){
        data.version = data.version || Version.SIP_2_0;
        super(data);
    }
    print(){}
}
