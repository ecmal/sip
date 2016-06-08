import { Request } from "../models/message/request";
import { Contact } from "../models/common/contact";
import { Response } from "../models/message/response";
import { Station } from "../station";
export declare class RegisterRequest extends Request {
    constructor(contact: Contact, expires?: number);
}
export declare class SubscribeRequest extends Request {
    constructor(contact: Contact, address: Contact);
}
export declare class RegisterDialog {
    private station;
    private request;
    private challenge;
    private address;
    private contact;
    constructor(station: Station);
    sign(request: Request): void;
    register(expires: any): Promise<Response>;
    doRegister(expires: any): Promise<Response>;
    doSubscribe(): Promise<boolean>;
    sendNotifyOk(message: Request): void;
    onRequest(message: Request): void;
    onResponse(message: Response): void;
}
