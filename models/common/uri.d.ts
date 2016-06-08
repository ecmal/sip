import { Model } from "../model";
export declare class Uri extends Model {
    scheme: string;
    username: string;
    password: string;
    host: string;
    port: number;
    params: any;
    headers: any;
    setParam(name: any, value: any): void;
    getParam(name: any): any;
    constructor(data?: any);
    server: Uri;
    toString(options?: any): string;
}
