import {Grammar} from "./grammar";
import {SipUri} from "./models";

export class Parser {
    static parse(content:string,type:string|Function):any{
        var startRule = type && (<Function>type).name || type;
        return Grammar.parse(content,{
            startRule,
            SipUri
        })
    }
}
