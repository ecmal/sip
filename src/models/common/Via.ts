import {Model} from "../model";
import {Uri} from "./uri";
import {Util} from "./utils";

export class Via extends Model {

    public protocol:string;
    public version:string;
    public transport:string;
    public host:string;
    public port:number;
    public params:any;

    toString(options?:any){
        return `${this.protocol}/${this.version}/${this.transport} ${this.host}${this.port?`:${this.port}`:''}${
            Util.toParamString(this.params)
        }`;
    }
}