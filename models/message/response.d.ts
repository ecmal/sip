import { Message } from "../message";
import { Challenge } from "../common/challenge";
export declare class Response extends Message {
    status: number;
    message: string;
    headline: string;
    authenticate: Challenge;
    toString(): string;
    print(s?: any): Response;
}
