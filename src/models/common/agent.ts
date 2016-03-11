import {Model} from "../model";
import {Uri} from "./uri";
export class Agent extends Model {
    public name:string;
    public version:Uri;
    public comment:string;
    toString(options?:any){
        return `${this.name}/${this.version} (${this.comment})`;
    }
}