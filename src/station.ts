import {Emitter} from "./events";
import {Transport} from "./transport";
import {Parser} from "./parser";
import {Contact} from "./models";
import {RegisterRequest} from "./models";
import {Uri} from "./models/common/uri";

const STATIONS:{[k:string]:Station} = Object.create(null);

export class Station extends Emitter {
    public static get all(){
        return STATIONS;
    }
    public static get(uri:string|Contact):Station{
        var contact = (uri instanceof Contact) ? uri : new Contact(uri);
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
        try {
            console.info(new RegisterRequest({
                uri: new Uri({
                    scheme :this.contact.uri.scheme,
                    host   :this.contact.uri.host,
                    port   :this.contact.uri.port
                }),
                headers     : {
                    Contact : this.contact,
                    From    : this.contact,
                    To      : this.contact
                }
            }).toString());
        }catch(ex){console.info(ex)}
        return Promise.resolve(this);
        
    }
    toString(options?:any){
        return `Station(${this.contact.toString(options)})`;
    }
    inspect(){
        return this.toString({inspect:true})
    }
}