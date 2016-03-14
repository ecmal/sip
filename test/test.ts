import {Transport} from "sip/transport";
import {Station} from "sip/station";
import {Contact} from "sip/models/common/contact";

class Agent extends Station {
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new Transport('sip:win.freedomdebtrelief.com')
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
    constructor(username,password,...options){
        super(`sip:${username}:${password}@win.freedomdebtrelief.com`,Agent.transport);
        this.onRegister = this.onRegister.bind(this);
        this.onInvite = this.onInvite.bind(this);
        this.onCall = this.onCall.bind(this);
        this.onBye = this.onBye.bind(this);
        this.on('register',this.onRegister);
        this.on('invite',this.onInvite);

    }

    onRegister(){
        console.info(`Agent ${this.contact.name} Registered`);
    }
    onInvite(call){
        console.info(`Agent ${this.contact.name} Invited by ${call.from.name} to call ${call.id}`);
        setTimeout(()=>{
            call.take();
            this.once('call',this.onCall);
            this.once('bye',this.onBye);
            setTimeout(()=>{
                call.drop()
            },10000)
        },10000);
    }
    onCall(call){
        console.info(`Agent ${this.contact.name} start talking to ${call.from.name} on call ${call.id}`);
    }

    onBye(call){
        console.info(`Agent ${this.contact.name} end talking to ${call.from.name} on call ${call.id}`);
    }
}

class Client extends Station {
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new Transport('sip:win.freedomdebtrelief.com')
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
        super(`sip:${username}:${password}@win.freedomdebtrelief.com`,Client.transport);
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
        console.info(`Agent ${this.contact.name} Invited by ${call.from.name} to call ${call.id}`);
        setTimeout(()=>{
            call.take();
            this.once('call',this.onCall);
            this.once('bye',this.onBye);
        },10000);
    }
    onCall(call){
        console.info(`Agent ${this.contact.name} start talking to ${call.from.name} on call ${call.id}`);
    }
    onBye(call){
        console.info(`Agent ${this.contact.name} end talking to ${call.from.name} on call ${call.id}`);
    }
}


Agent.start([
    ["101","101"]
]);
Client.start([
    ["201","201"]
]);