export class Util {
    static toParamString(params:any){
        return params?Object.keys(params).map(k=>`;${k}${
            params[k]?(`=${params[k]}`):''
        }`).join(''):''
    }
}