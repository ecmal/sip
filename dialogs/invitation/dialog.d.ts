import { Station } from "../../station";
import { Call } from "./call";
import { Emitter } from "../../events";
export declare class InviteDialog extends Emitter {
    static encodeSdp(sdp: string[]): string;
    static decodeSdp(sdp: string): any;
    static getSdp(username: string, host: string, port?: number): Buffer;
    call: Call;
    station: Station;
    constructor(station: Station, call: Call);
}
