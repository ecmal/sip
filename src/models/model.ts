
export class Model  {
    protected static parser:any;
    public static new(text):Model{
        if(!Model.parser){
            Object.defineProperty(Model,'parser',<any>{
                value: Reflect.Module.get('sip/parser').exports.Parser
            })
        }
        return Model.parser.parse(text,this);
    }
    constructor(data?){
        Object.defineProperty(this,'class',<any>{
            enumerable:true,
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
        var keys = select?select.trim().split(',').map(k=>k.trim()).filter((k,i,a)=>a.indexOf(k)==i):Object.keys(this)
        var object = Object.create(null);
        for(var key of keys){
            object[key] = this[key]
        }
        return new (<any>this.constructor)(object);
    }
}
