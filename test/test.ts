import {Transport} from "sip/transport";
import {Station} from "sip/station";

class Agent extends Station {
    static get transport(){
        return Object.defineProperty(this,'transport',{
            value : new Transport('sip:win.freedomdebtrelief.com')
        }).transport;
    }
    static get directory():{[k:string]:Agent}{
        return Object.defineProperty(this,'directory',{
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
        this.on('register',this.onRegister);
        this.on('invite',this.onInvite);
    }

    onRegister(){
        console.info(`Agent ${this.contact} Registered`);
    }
    onInvite(){
        console.info(`Agent ${this.contact} Got Invite`);
    }
}

class Client extends Station {
    static get transport(){
        return Object.defineProperty(this,'transport',{
            value : new Transport('sip:win.freedomdebtrelief.com')
        }).transport;
    }
    static get directory():{[k:string]:Agent}{
        return Object.defineProperty(this,'directory',{
            value : Object.create(null)
        }).directory;
    }
    static start(list:any[]):Client[]{
        return list.map((o:any[])=>{
            return Agent.directory[o[0]]=new Client(o[0],o[1],...o.slice(2));
        })
    }
    constructor(username,password,...options){
        super(`sip:${username}:${password}@win.freedomdebtrelief.com`,Client.transport);
        this.onRegister = this.onRegister.bind(this);
        this.onInvite = this.onInvite.bind(this);
        this.on('register',this.onRegister);
        this.on('invite',this.onInvite);
    }
    onRegister(){
        console.info(`Client ${this.contact} Registered`);
    }
    onInvite(){
        console.info(`Client ${this.contact} Got Invite`);
    }
}


Agent.start([
    ["101","101"]
]);
Client.start([
    ["201","201"]
]);