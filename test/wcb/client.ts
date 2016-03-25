import {UdpTransport} from "sip/transport";
import {Phone} from "./phone";

export class Client extends Phone {
    static audioInterval;
    static get server(){
        return '10.35.35.48:5060'
    }
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new UdpTransport(`sip:${Client.server}`)
        }).transport;
    }
    static start(l:any[]):Client[]{
        var list = l.map((o:any[])=>{
            return new Client(o[0],...o.slice(1));
        });
        this.audioInterval = setInterval(()=>{
            list.forEach(a=>a.sendAudio());
        },160*2);
        return list;
    }

    constructor(username,...options){
        super(username,Client.server,Client.transport);
    }

}

