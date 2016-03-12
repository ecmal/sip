import {Model} from "../model";
import {Uri} from "./uri";

export class Contact extends Model {

    public name:string;
    public uri:Uri;
    public params:any;
    constructor(data?){
        if(typeof data =='string'){
            return <Contact>Contact.new(data)
        }else{
            super(data);
        }
    }
    toString(options?:any){
        return `${this.name?JSON.stringify(this.name)+' ':''}<${this.uri.toString(options)}>${
            ((params:any)=>{
                return params?Object.keys(params).map(k=>`;${k}${
                    params[k]?(k[0]=='+'?`="<${params[k]}>"`:`=${params[k]}`):''
                }`).join(''):''
            })(this.params)
        }`;
    }
}