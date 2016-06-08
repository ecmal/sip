import { Model } from "./model";
import { Version } from "./common/version";
import { Agent } from "./common/agent";
import { Via } from "./common/via";
import { Sequence } from "./common/sequence";
import { Contact } from "./common/contact";
import { Event } from "./common/event";
import { Mime } from "./common/mime";
export declare class Message extends Model {
    static headersToString(headers: any): any[];
    static headersToDebugString(headers: any): any[];
    static HEADERS: {
        VIA: string;
        USER_AGENT: string;
        CONTENT_LENGTH: string;
        CONTENT_TYPE: string;
        CALL_ID: string;
        CSEQ: string;
        FROM: string;
        TO: string;
        CONTACT: string;
        ROUTE: string;
        RECORD_ROUTE: string;
        EXPIRES: string;
        WWW_AUTHENTICATE: string;
        AUTHORIZATION: string;
        ALLOW: string;
        ALLOW_EVENTS: string;
        EVENT: string;
        MAX_FORWARDS: string;
        SUPPORTED: string;
    };
    version: Version;
    headers: any;
    headline: string;
    content: Buffer;
    callId: string;
    sequence: Sequence;
    from: Contact;
    to: Contact;
    contact: Contact;
    route: any;
    recordRoute: any;
    event: Event;
    supported: string[];
    allow: string[];
    allowEvents: string[];
    contentLength: number;
    contentType: Mime;
    maxForwards: number;
    agent: Agent;
    vias: Via[];
    via: Via;
    getHeader(name: string): any;
    setHeader(name: string, value: any): void;
    constructor(data?: any);
    print(b?: boolean): void;
    toBuffer(): Buffer;
}
