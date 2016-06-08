import { Message } from "../message";
import { Uri } from "../common/uri";
import { Transport } from "../../transport";
import { Response } from "./response";
import { Challenge } from "../common/challenge";
export declare class Request extends Message {
    method: string;
    uri: Uri;
    headline: string;
    expires: number;
    authorization: Challenge;
    toString(): string;
    print(s?: any): Request;
    send(transport: Transport): Promise<Response>;
    reply(status: any, message: any, fields: string): Response;
}
