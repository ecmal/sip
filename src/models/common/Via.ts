import {Model} from "../model";
import {Uri} from "./uri";

export class Via extends Model {

    public protocol:string;
    public version:string;
    public transport:string;
    public host:string;
    public port:number;
    public params:any;

    toString(options?:any){
        return `${this.protocol}/${this.version}/${this.transport} ${this.host}:${this.port}${
            this.params?Object.keys(this.params).map(k=>`;${k}${
                this.params[k]?(`=${this.params[k]}`):''
            }`).join(''):''    
        }`;
    }
}