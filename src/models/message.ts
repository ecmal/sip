import {Transport} from "../transport";
import {Model} from "./model";
import {Version} from "./common/version";

export class Message extends Model {
    version:Version;
    headers:any;

    send(transport:Transport){
        return Promise.resolve(this)
    }
}
