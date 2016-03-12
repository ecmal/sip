import {Transport} from "../transport";
import {Model} from "./model";
import {Version} from "./common/version";

export class Message extends Model {
    version:Version;
    headers:any;
    constructor(data?){
        super(data);
        if(!this.version){
            this.version = Version.SIP_2_0;
        }
        if(!this.headers){
            this.headers = Object.create(null)
        }
    }
    send(transport:Transport) {
        return Promise.resolve(this);
        //return transport.send(this.toString());
    }
}
