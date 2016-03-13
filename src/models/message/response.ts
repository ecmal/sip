import {Message} from "../message";
import {Challenge} from "../common/challenge";
export class Response extends Message {
    public status:number;
    public message:string;

    get authenticate():Challenge{
        return this.getHeader(Message.HEADERS.WWW_AUTHENTICATE);
    }
    set authenticate(value:Challenge){
        this.setHeader(Message.HEADERS.WWW_AUTHENTICATE,value);
    }
    toString(){
        var header = (k,h)=>{
            if(Array.isArray(h)){
                return h.map(i=>header(k,i))
            }else{
                return [`${k}: ${h}`]
            }
        };
        var headers = ()=>{
            return Object.keys(this.headers).map(k=>{
                return header(k,this.headers[k]).join('\r\n')
            })
        };
        return [
            `${this.version} ${this.status} ${this.message}`,
            ...headers(),
            '',
            ''
        ].join('\r\n');
    }
}
