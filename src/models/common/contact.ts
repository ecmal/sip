import {Model} from "../model";
import {Uri} from "./uri";

export class Contact extends Model {

    public name:string;
    public uri:Uri;
    public params:any;

    set tag(v:string){
        this.setParam('tag',v);
    }
    get tag():string{
        return this.getParam('tag');
    }

    get displayName(){
        return this.name||this.uri.username;
    }

    setParam(name,value){
        if(!this.params){
            this.params = Object.create(null)
        }
        this.params[name]=value;
    }
    getParam(name):any{
        if(this.params){
            return this.params[name];
        }
    }
    
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