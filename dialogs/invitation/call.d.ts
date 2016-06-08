import { Contact } from "../../models/common/contact";
import { Emitter } from "../../events";
import { Sdp } from "../../models/common/sdp";
export declare enum CallState {
    INITIAL = 0,
    TRYING = 1,
    TALKING = 2,
    RINGING = 3,
    DIALING = 4,
    ENDED = 5,
}
export declare enum CallDirection {
    INCOMING = 0,
    OUTGOING = 1,
}
export declare class Call extends Emitter {
    static EVENTS: {
        AUDIO: {
            SENT: string;
            RECEIVE: string;
            START: string;
            STOP: string;
            UPDATE: string;
        };
    };
    id: string;
    direction: CallDirection;
    state: CallState;
    from: Contact;
    to: Contact;
    localSdp: Sdp;
    remoteSdp: Sdp;
    localUsername: string;
    remoteUsername: string;
    constructor(options: any);
    take(): void;
    drop(): void;
}
