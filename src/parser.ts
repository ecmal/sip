import {Grammar} from "./grammar";
import {Model} from "./models/model";
import * as Models from "./models";

export class Parser {
    private static normalize(text:string):string{
        if(text.match(/\r?\n/) && text.trim().split(/\r?\n/)[0].match(/SIP\/2\.0/)){
            return text.replace(/\r?\n/g,'\r\n').trim().split('\r\n').map(l=>l.trim()).join('\r\n')+'\r\n';
        }else{
            return text;
        }
    }
    public static parse<T>(content:string, model?:{new():T;}):T{
        return <T>Grammar.parse(Parser.normalize(content),{
            startRule   : model.name||'Start',
            Models      : Models
        })
    }
}

