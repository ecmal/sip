import {TcpTransport, UdpTransport} from "sip/transport";
import {Station} from "./station";
import {Contact} from "../models/common/contact";

//reverted
type ClientMap = {[k:string]:Client}
type ClientList = Client[];

export class Client extends Station {
    static get server(){
        return '10.35.35.48'
    }
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new UdpTransport(`sip:${Client.server}`)
        }).transport;
    }
    static get directory():{[k:string]:Client}{
        return Object.defineProperty(this,'directory',<any>{
            value : Object.create(null)
        }).directory;
    }
    static start(list:any[]):Client[]{
        return list.map((o:any[])=>{
            return Client.directory[o[0]]=new Client(o[0],o[1],...o.slice(2));
        })
    }
    constructor(username,password,...options){

        super(`sip:${username}:${password}@${Client.server}`,Client.transport);
        this.onRegister = this.onRegister.bind(this);
        this.onInvite = this.onInvite.bind(this);
        this.onCall = this.onCall.bind(this);
        this.onBye = this.onBye.bind(this);
        this.on('register',this.onRegister);
        this.on('invite',this.onInvite);
    }
    onRegister(){
        console.info(`Client ${this.contact.name} Registered`);
        //this.invitation.sendInvite(new Contact("sip:101@win.freedomdebtrelief.com"));
    }
    onInvite(call){
        console.info(`Agent ${this.name} Invited by ${call.from.name} to call ${call.id}`);
        /*setTimeout(()=>{
         call.take();
         this.once('call',this.onCall);
         this.once('bye',this.onBye);
         },10000);*/
    }
    onCall(call){
        console.info(`Agent ${this.name} start talking to ${call.from.name} on call ${call.id}`);
    }
    onBye(call){
        console.info(`Agent ${this.name} end talking to ${call.from.name} on call ${call.id}`);
    }
    call(extension){
        this.invitation.sendInvite(new Contact(`sip:${extension}@${Client.server}`));
    }
    drop(){
        this.invitation.call.drop();
    }
    take(){
        this.invitation.call.take();
    }
}

