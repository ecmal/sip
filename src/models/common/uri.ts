import {Model} from "../model";

export class Uri extends Model {
    scheme:string;
    username:string;
    password:string;
    host:string;
    port:number;
    params:any;
    headers:any;

    
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
            return <Uri>Uri.new(data)
        }else{
            super(data);
        }
    }
    get user():string{
        return `${this.username}@${this.server}`
    }
    get server():string{
        return `${this.host}${this.port?':'+this.port:''}`
    }
    toString(options:any={}){
        var authority = (this.username ? this.username + ( (options.inspect&&this.password) ? ':'+this.password:'' ) +'@': '');
        var server = `${this.host}${this.port?':'+this.port:''}`;
        var params = this.params?Object.keys(this.params).map(k=>`;${k}${this.params[k]?'='+this.params[k]:''}`).join(''):'';
        var headers = this.headers?'?'+Object.keys(this.headers).map(k=>`${k}=${this.params[k]}`).join('&'):'';
        return `${this.scheme}:${authority}${server}${params}${headers}`;
    }
}