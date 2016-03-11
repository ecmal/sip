import {Grammar} from "./grammar";
import {Model} from "./models";
import * as Models from "./models";

export class Parser {
    public static parse<T extends Model>(content:string, model?:{new():T;}):T{
        return <T>Grammar.parse(content,{
            startRule   : model.name||'Start',
            Models      : Models
        })
    }
}
