import {Model} from "../model";
import {Uri} from "./uri";
export class Version extends Model {
    minor:number;
    major:number;
    toString(){
        return `SIP/${this.major}.${this.minor}`
    }
}