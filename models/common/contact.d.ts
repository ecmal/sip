import { Model } from "../model";
import { Uri } from "./uri";
export declare class Contact extends Model {
    name: string;
    uri: Uri;
    params: any;
    tag: string;
    displayName: string;
    setParam(name: any, value: any): void;
    getParam(name: any): any;
    constructor(data?: any);
    toString(options?: any): string;
}
