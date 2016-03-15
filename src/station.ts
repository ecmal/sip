import {Emitter} from "./events";
import {Transport} from "./transport";
import {Contact} from "./models";
import {RegisterDialog} from "./station/registration";
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
    public address:Contact;

    public registration:RegisterDialog;
    public invitation:InviteFlow;

    private get isOffline():boolean{
        return this.state == State.OFFLINE;
    }
    private get isRegistered():boolean{
        return !(this.state==State.OFFLINE || this.state == State.REGISTERING);
    }
    public get name(){
        return this.contact.name||this.contact.uri.username;
    }

    constructor(contact:Contact|string, transport?:Transport) {
        super();
        this.state = State.OFFLINE;
        this.onConnect = this.onConnect.bind(this);
        this.onRequest = this.onRequest.bind(this);
        this.onResponse = this.onResponse.bind(this);
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
        this.contact.tag = Util.hash(8,this.contact);
        return this;
    }
    public setTransport(transport:Transport):Station {
        if(!this.transport){
            this.transport = <Transport>transport;
            this.registration   = new RegisterDialog(this);
            this.invitation     = new InviteFlow(this);
            this.transport.on('connect',this.onConnect);
            this.transport.on('request',this.onRequest);
            this.transport.on('response',this.onResponse);
            if(this.transport.isConnected){
                this.emit('connect');
            }
        }
        return this;
    }
    public toString(options?:any) {
        return `Station(${this.contact.toString(options)})`;
    }

    private inspect(){
        return this.toString({inspect: true})
    }
    private onConnect(){
        this.address = new Contact(this.contact.toString());
        this.address.uri.host = this.transport.socket.localAddress;
        this.address.uri.port = this.transport.socket.localPort;
        this.emit('connect');
    }

    private onRequest(request:Request){
        if(request.uri.username == this.contact.uri.username){
            this.emit('request',request);
        }
    }

    private onResponse(response:Request){
        this.emit('response',response);
    }
}