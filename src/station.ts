import {Emitter} from "./events";
import {Transport} from "./transport";
import {Contact} from "./models";
import {RegisterFlow} from "./station/registration";
import {Message} from "./models/message";
import {Response} from "./models/message/response";
import {Request} from "./models/message/request";
import {InviteFlow} from "./station/invitation";
import {Util} from "./models/common/utils";

export enum State {
    OFFLINE,
    REGISTERING,
    ONLINE,
    CALLING,
    TALKING,
    RINGING
}

export class Station extends Emitter {
    public state:State;
    public transport:Transport;
    public contact:Contact;

    private registration:RegisterFlow;
    private invitation:InviteFlow;

    private get isOffline():boolean{
        return this.state == State.OFFLINE;
    }
    private get isRegistered():boolean{
        return !(this.state==State.OFFLINE || this.state == State.REGISTERING);
    }
    private get id() {
        return this.contact.uri.user;
    }
    constructor(contact:Contact|string, transport?:Transport) {
        super();
        this.state = State.OFFLINE;
        this.onConnect = this.onConnect.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.setContact(contact);
        this.setTransport(transport);
        this.on('registering',r=>this.state = State.REGISTERING);
        this.on('register',r=>this.state = State.ONLINE);
    }
    public setContact(contact:Contact|string):Station{
        if(contact instanceof Contact){
            this.contact = contact;
        }else{
            this.contact = new Contact(contact);
        }
        this.contact.uri.tag = Util.md5(contact.toString()).substring(0,8);
        return this;
    }
    public setTransport(transport:Transport):Station {
        if(!this.transport){
            this.transport = <Transport>transport;
            this.registration = new RegisterFlow(this);
            this.invitation = new InviteFlow(this);
            this.transport.on('connect',this.onConnect);
            this.transport.on('message',this.onMessage);
            if(this.transport.isConnected){
                this.emit('connect');
            }
        }
        return this;
    }
    public toString(options?:any) {
        return `Station(${this.contact.toString(options)})`;
    }

    private inspect() {
        return this.toString({inspect: true})
    }
    private onConnect(){
        this.emit('connect');
    }
    private onMessage(message:Message){
        if(message.to.uri.host==this.contact.uri.host && message.to.uri.username==this.contact.uri.username){
            if(message instanceof Response){
                this.emit('response',message);
            }else
            if(message instanceof Request){
                this.emit('request',message);
            }
        }
    }
}