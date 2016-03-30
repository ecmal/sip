import {Transport} from "../transport";
import {Model} from "./model";
import {Version} from "./common/version";
import {Agent} from "./common/agent";
import {Via} from "./common/via";
import {Sequence} from "./common/sequence";
import {Contact} from "./common/contact";
import {Event} from "./common/event";
import {Paint, Color} from "./common/utils";
import {Mime} from "./common/mime";

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
        CONTENT_TYPE        : 'Content-Type',
        CALL_ID             : 'Call-ID',
        CSEQ                : 'CSeq',
        FROM                : 'From',
        TO                  : 'To',
        CONTACT             : 'Contact',
        ROUTE               : 'Route',
        RECORD_ROUTE        : 'Record-Route',
        EXPIRES             : 'Expires',
        WWW_AUTHENTICATE    : 'WWW-Authenticate',
        AUTHORIZATION       : 'Authorization',
        ALLOW               : 'Allow',
        ALLOW_EVENTS        : 'Allow-Events',
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
    get headline():string{
        throw new Error('abstract property "headline')
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
    get route():any{
        return this.getHeader(Message.HEADERS.ROUTE)
    }
    set route(value:any){
        this.setHeader(Message.HEADERS.ROUTE,value);
    }
    get recordRoute():any{
        return this.getHeader(Message.HEADERS.RECORD_ROUTE)
    }
    set recordRoute(value:any){
        this.setHeader(Message.HEADERS.RECORD_ROUTE,value);
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

    public set allow(value:string[]){
        this.setHeader(Message.HEADERS.ALLOW,value);
    }
    public get allow():string[]{
        return this.getHeader(Message.HEADERS.ALLOW);
    }
    public set allowEvents(value:string[]){
        this.setHeader(Message.HEADERS.ALLOW_EVENTS,value);
    }
    public get allowEvents():string[]{
        return this.getHeader(Message.HEADERS.ALLOW_EVENTS);
    }
    public set contentLength(value:number){
        this.setHeader(Message.HEADERS.CONTENT_LENGTH,value);
    }
    public get contentLength():number{
        return <number>this.getHeader(Message.HEADERS.CONTENT_LENGTH);
    }
    public set contentType(value:Mime){
        this.setHeader(Message.HEADERS.CONTENT_TYPE,value);
    }
    public get contentType():Mime{
        return this.getHeader(Message.HEADERS.CONTENT_TYPE)
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
    public get vias():Via[]{
        return this.getHeader(Message.HEADERS.VIA);
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

    print(b?:boolean){}

    public toBuffer(){
        var head = new Buffer(this.toString());
        if(this.content){
            return Buffer.concat(
                [head,this.content],
                head.length+this.content.length
            );
        }else{
            return head;
        }
    }
}
