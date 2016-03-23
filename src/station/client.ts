import {TcpTransport, UdpTransport} from "sip/transport";
import {Station} from "./station";
import {Contact} from "../models/common/contact";
import {Call} from "../dialogs/invitation/call";

//reverted
type ClientMap = {[k:string]:Client}
type ClientList = Client[];

export class Client extends Station {
    static get server(){
        return '10.35.35.48:5060'
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
    public currentCall:Call;
    constructor(username,password,...options){
        super(`sip:${username}:${password}@${Client.server}`,Client.transport);
        this.onCall = this.onCall.bind(this);
        this.on('call',this.onCall);
    }
    onCall(call:Call){
        this.currentCall = call;
        call.on('init',()=>{
            console.info(`DIALOG ${call.id} INIT`);
        });
        call.on('trying',()=>{
            console.info(`DIALOG ${call.id} TRYING`);
        });
        call.on('ringing',()=>{
            console.info(`DIALOG ${call.id} RINGING`);
        });
        call.on('update',()=>{
            console.info(`DIALOG ${call.id} UPDATE`);
        });
        call.on('cancel',()=>{
            console.info(`DIALOG ${call.id} CANCEL`);
        });
        call.on('bye',()=>{
            console.info(`DIALOG ${call.id} BYE`);
        });
        call.on('accept',()=>{
            console.info(`DIALOG ${call.id} ACCEPT`);
        });
        call.on('reject',()=>{
            console.info(`DIALOG ${call.id} REJECT`);
        });
        call.on('done',()=>{
            console.info(`DIALOG ${call.id} DONE`);
            this.currentCall = null;
        });
    }
    call(extension){
        this.calls.sendInvite(new Contact(`sip:${extension}@${Client.server}`));
    }
    drop(){
        if(this.currentCall){
            this.currentCall.drop();
        }else{
            console.error("No Call Session Available")
        }
    }
    take(){
        if(this.currentCall){
            this.currentCall.take();
        }else{
            console.error("No Call Session Available")
        }
    }
}

