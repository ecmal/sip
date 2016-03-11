import {Emitter} from "./events";
import {Transport} from "./transport";
import {Parser} from "./parser";
import {Contact} from "./models";
import {RegisterRequest} from "./models";

const STATIONS:{[k:string]:Station} = Object.create(null);

export class Station extends Emitter {
    public static get all(){
        return STATIONS;
    }
    public static get(uri:string):Station{
        var contact   = Parser.parse(uri,Contact);
        var address   = `${contact.uri.user}`;
        return STATIONS[address] || new Station(contact);
    }

    private transport:Transport;
    private contact:Contact;
   
    private get id(){
        return this.contact.uri.user
    }
    constructor(contact:Contact){
        super();
        this.contact = contact;
        STATIONS[this.id] = this;
    }

    public register(transport?:Transport):Promise<Station>{
        this.transport = transport?transport:Transport.get(this.contact);
        return new RegisterRequest({}).send(this.transport).then(r=>{
            return this;
        });
    }
    toString(options?:any){
        return `Station(${this.contact.toString(options)})`;
    }
    inspect(){
        return this.toString({inspect:true})
    }
}