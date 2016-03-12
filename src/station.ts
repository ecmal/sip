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
            var req=new RegisterRequest({
                uri: new Uri({
                    scheme :this.contact.uri.scheme,
                    host   :this.contact.uri.host,
                    port   :this.contact.uri.port
                }),
                headers     : {
                    Via             :'SIP/2.0/TCP 192.168.10.103:37273',
                    Contact         :this.contact,
                    From            :this.contact,
                    To              :this.contact,
                    'Call-ID'       :'a1',
                    CSeq            :'1 REGISTER',
                    Expires         :'300',
                    'User-Agent'    :'Test Agent',
                    'Content-Length':'0'

                }
            }).toString();
            this.transport.send(req);
            this.transport.on('message',(message)=>{
                 //console.info(message);
            });

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