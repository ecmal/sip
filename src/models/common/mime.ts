import {Model} from "../model";
import {Uri} from "./uri";
export class Mime extends Model {
    static SDP = new Mime({
        type        : 'application',
        subtype     : 'sdp'
    });
    public type:string;
    public subtype:Uri;
    public params:any;
    toString(options?:any){
        return `${this.type}/${this.subtype}${this.params?Object.keys(this.params).map(
            k=>`;${k}=${this.params[k]}`
        ).join(''):''}`;
    }
}