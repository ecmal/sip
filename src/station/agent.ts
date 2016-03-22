import {TcpTransport, UdpTransport} from "../transport";
import {Station} from "./station";
import {Contact} from "../models/common/contact";
import {Call} from "../dialogs/invitation/call";

//reverted
type AgentMap = {[k:string]:Agent}
type AgentList = Agent[];

export class Agent extends Station {
    static get proxy(){
        return 'i3-dcic1-px1.freedomdebtrelief.com:8060'
    }
    static get server(){
        return 'i3-dcic1-px1.freedomdebtrelief.com'
    }
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new TcpTransport(`sip:${Agent.proxy}`)
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
    public currentCall:Call;

    constructor(username,password,...options){
        this.options=options;
        //console.info(options);
        super(`sip:${username}:${password}@${Agent.server}`,Agent.transport);
        this.onRegister = this.onRegister.bind(this);
        this.onCall = this.onCall.bind(this);
        this.on('register',this.onRegister);
        this.on('call',this.onCall);

    }
    private static count:number=0;
    onRegister(){
        Agent.count++;
        console.info(`${Agent.count}Agent ${this.name} Registered`);
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
    onBye(call){
        console.info(`Agent ${this.name} end talking to ${call.from.displayName} on call ${call.id}`);
    }
    call(extension){
        this.calls.sendInvite(new Contact(`sip:${extension}@${Agent.server}`));
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

