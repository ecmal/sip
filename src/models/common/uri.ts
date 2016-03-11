import {Model} from "../model";

export class Uri extends Model {
    scheme:string;
    username:string;
    password:string;
    host:string;
    port:number;
    params:any;
    headers:any;
    get user():string{
        return `${this.username}@${this.server}`
    }
    get server():string{
        return `${this.host}${this.port?':'+this.port:''}`
    }
    toString(options:any={}){
        var authority = (this.username ? this.username + ( (options.inspect&&this.password) ? ':'+this.password:'' ) +'@': '');
        var server = `${this.host}${this.port?':'+this.port:''}`;
        var params = this.params?Object.keys(this.params).map(k=>`;${k}=${this.params[k]}`).join(''):'';
        var headers = this.headers?'?'+Object.keys(this.headers).map(k=>`${k}=${this.params[k]}`).join('&'):'';
        return `${this.scheme}:${authority}${server}${params}${headers}`;
    }
}