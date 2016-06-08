import { Model } from "../model";
export declare class Via extends Model {
    protocol: string;
    version: string;
    transport: string;
    host: string;
    port: number;
    params: any;
    toString(options?: any): string;
}
