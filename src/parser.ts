import {Grammar} from "./grammar";
import {Model} from "./models/model";
import * as Models from "./models";

export class Parser {
    private static normalize(text:string):string{
        return text.replace(/\r?\n/g,'\r\n').trim().split('\r\n').map(l=>l.trim()).join('\r\n')+'\r\n';
    }
    public static parse<T extends Model>(content:string, model?:{new():T;},normalize=true):T{
        return <T>Grammar.parse(normalize?Parser.normalize(content):content,{
            startRule   : model.name||'Start',
            Models      : Models
        })
    }
}
