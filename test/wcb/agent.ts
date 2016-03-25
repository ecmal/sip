import {TcpTransport} from "sip/transport";
import {Phone} from "./phone";

export class Agent extends Phone {

    static audioInterval;

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
    
    static start(l:any[]):Agent[]{
        var list = l.map((o:any[]):Agent=>{
            return new Agent(o[0],...o.slice(1));
        });
        this.audioInterval = setInterval(()=>{
            list.forEach(a=>a.sendAudio());
        },160*2);
        return list;
    }

    constructor(username,...options){
        super(username,Agent.server,Agent.transport);
    }
}

