import {Model} from "../model";
import {Util} from "./utils";
import {Uri} from "./uri";
import {Request} from "../message/request";


export class Challenge extends Model {
    public type:string;
    public params:any;

    //Authorization: Digest
    // username="102",
    // realm="win.freedomdebtrelief.com",
    // nonce="33013310c380f48dff5561ac6d2a077a",
    // uri="sip:win.freedomdebtrelief.com;transport=TCP",
    // response="",
    // cnonce="5e08d57725feeaf0c2ee922419715974",
    // nc=00000001,
    // qop=auth,
    // algorithm=MD5,
    // opaque="00000041"
    private cn:string;
    private nc:number;
    constructor(data?){
        super(data);
        this.nc = 1;
        this.cn = Util.guid();
    }
    authorize(request:Request,username:string,password:string):Challenge{
        var cnonce = this.cn;
        var nc = (100000000+(this.nc++)).toString().substring(1);
        var HA1=Util.md5(username+':'+this.params.realm+':'+password);
        var HA2=Util.md5(request.method+':'+request.uri.toString());
        var response =  Util.md5(HA1+':'+this.params.nonce+':'+nc+':'+cnonce+':'+this.params.qop+':'+HA2);
        var challenge = new Challenge({
            type   : this.type,
            params : {
                realm       : this.params.realm,
                nonce       : this.params.nonce,
                qop         : this.params.qop,
                algorithm   : this.params.algorithm,
                uri         : request.uri.toString(),
                username    : username,
                cnonce      : cnonce,
                nc          : nc,
                response    : response
            }
        });
        if(this.params.opaque){
            challenge.params.opaque = this.params.opaque
        }

        return challenge;
    }

    toString(options?:any){
        return `${this.type} ${Object.keys(this.params).map(k=>{
            if(['algorithm','stale','nc','qop'].indexOf(k)>=0){
                return `${k}=${this.params[k]}`
            }else{
                return `${k}="${this.params[k]}"`
            }
        }).join(',')}`;
    }
}