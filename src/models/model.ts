export class Model extends Object{
    constructor(data?){
        Object.defineProperty(this,'class',{
            enumerable:true,
            value:this.constructor.name
        });
        if(data){this.set(data);}
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
        return this.toString({inspect:true});
    }
    toString(options?:any){
        return `${this.constructor.name}(${JSON.stringify(this,null,2)})`;
    }
}
