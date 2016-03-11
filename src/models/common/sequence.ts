import {Model} from "../model";
import {Uri} from "./uri";
export class Sequence extends Model {
    public method:string;
    public sequence:number;
    toString(options?:any){
        return `${this.sequence} ${this.method}`;
    }
}