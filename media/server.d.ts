import { Call } from "../dialogs/invitation/call";
import { Sdp } from "../models/common/sdp";
import { RtpPacket } from "./rtp";
export declare class MediaServer {
    static calls: {
        [k: string]: Call;
    };
    static RTP_PORT: number;
    static RTCP_PORT: number;
    static listenTo(call: Call): Sdp;
    static talkTo(call: Call, sdp: Sdp): void;
    static instance: MediaServer;
    private rtp;
    private rtcp;
    private client;
    packet: RtpPacket;
    enabled: boolean;
    private debug;
    send(message: Buffer, port: number, host: string): void;
    host: string;
    rtpPort: number;
    rtcpPort: number;
    file: any;
    constructor();
    listen(host?: string, rtpPort?: number, rtcpPort?: number): Promise<any>;
}
