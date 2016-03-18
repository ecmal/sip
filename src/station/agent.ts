import {TcpTransport, UdpTransport} from "sip/transport";
import {Station} from "sip/station";
import {Contact} from "sip/models/common/contact";

//reverted
//type AgentMap = {[k:string]:Agent}
//type AgentList = Agent[];

export class Agent extends Station {
    static get proxy(){
        return 'i3-dcic1-px1.freedomdebtrelief.com:8060'
    }
    static get server(){
        return 'i3-dcic1-px1.freedomdebtrelief.com'
    }
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new UdpTransport(`sip:${Agent.proxy}`)
        }).transport;
    }
    static get directory():{[k:string]:Agent}{
        return Object.defineProperty(this,'directory',<any>{
            value : Object.create(null)
        }).directory;
    }

    static start(list:any[]):Agent[]{
        return list.map((o:any[])=>{
            return Agent.directory[o[0]]=new Agent(o[0],o[1],...o.slice(2));
        })
    }
    public options;
    constructor(username,password,...options){
        this.options=options;
        //console.info(options);
        super(`sip:${username}:${password}@${Agent.server}`,Agent.transport);
        this.onRegister = this.onRegister.bind(this);
        this.onInvite = this.onInvite.bind(this);
        this.onCall = this.onCall.bind(this);
        this.onBye = this.onBye.bind(this);
        this.on('register',this.onRegister);
        this.on('invite',this.onInvite);

    }
    private static count:number=0;
    onRegister(){
        Agent.count++;
        console.info(`${Agent.count}Agent ${this.name} Registered`);
    }
    onInvite(call){
        console.info(`Agent ${this.name} Invited by ${call.from.displayName} to call ${call.id}`);
        this.once('call',this.onCall);
        this.once('bye',this.onBye);
        /*setTimeout(()=>{
            call.take();
        },5000)*/
    }
    onCall(call){
        console.info(`Agent ${this.name} start talking to ${call.from.displayName} on call ${call.id}`);
        /*setTimeout(()=>{
            call.drop();
        },5000)*/
    }
    onBye(call){
        console.info(`Agent ${this.name} end talking to ${call.from.displayName} on call ${call.id}`);
    }
    call(extension){
        this.invitation.sendInvite(new Contact(`sip:${extension}@${Agent.server}`));
    }
    drop(){
        this.invitation.call.drop();
    }
    take(){
        this.invitation.call.take();
    }
}

type ClientMap = {[k:string]:Client}
type ClientList = Client[];

class Client extends Station {
    static get server(){
        return '10.35.35.48'
    }
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new UdpTransport(`sip:${Client.server}`)
        }).transport;
    }
    static get directory():ClientMap{
        return Object.defineProperty(this,'directory',<any>{
            value : Object.create(null)
        }).directory;
    }
    static start(list:any[]):ClientList{
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



