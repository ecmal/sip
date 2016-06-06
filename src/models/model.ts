import {Parser} from "../parser";

export class Model  {
    protected static parser:any;
    public static new(text):Model{
        if(!Model.parser){
            Object.defineProperty(Model,'parser',<any>{
                value: Parser
            })
        }
        return Model.parser.parse(text,this);
    }
    constructor(data?){
        Object.defineProperty(this,'class',<any>{
            enumerable:false,
            value:this.constructor.name
        });
        if(data){
            this.set(data);
        }
    }
    set(data:any){
        for(var key in data){
            if(typeof data[key]!='undefined'){
                this[key] = data[key];
            }else{
                delete this[key];
            }
        }
        return this;
    }
    inspect(){
        return `${this.constructor.name}(${JSON.stringify(this,null,2)})`;
    }
    toString(options?:any){
        return `${this.constructor.name}(${JSON.stringify(this,null,2)})`;
    }
    clone(select?:string){
        var object = this.constructor['new'](this.toString());
        if(select){
            var keys = select.trim().split(',').map(k=>k.trim()).filter((k,i,a)=>a.indexOf(k)==i);
            for(var key in object){
                if(keys.indexOf(key)<0){
                    delete object[key];
                }
            }
        }
        return object;
    }
}
