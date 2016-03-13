export class Util {
    static get crypto():any{
        return require('crypto');
    }
    static get dgram():any{
        return require('dgram');
    }
    static guid(){
        return this.crypto.randomBytes(16).toString('hex');
    }
    static md5(text:string){
        return this.crypto.createHash('md5').update(text).digest('hex');
    }
    static toParamString(params:any){
        return params?Object.keys(params).map(k=>`;${k}${
            params[k]?(`=${params[k]}`):''
        }`).join(''):''
    }
}