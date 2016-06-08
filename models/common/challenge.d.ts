import { Model } from "../model";
import { Request } from "../message/request";
export declare class Challenge extends Model {
    type: string;
    params: any;
    private cn;
    private nc;
    constructor(data?: any);
    authorize(request: Request, username: string, password: string): Challenge;
    toString(options?: any): string;
}
