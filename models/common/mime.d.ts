import { Model } from "../model";
import { Uri } from "./uri";
export declare class Mime extends Model {
    static SDP: Mime;
    type: string;
    subtype: Uri;
    params: any;
    toString(options?: any): string;
}
