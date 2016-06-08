import { Model } from "../model";
export interface SdpOrigin {
    username: string;
    sessionId: string;
    sessionVersion: number;
    networkType: string;
    addressType: string;
    unicastAddress: string;
}
export interface SdpConnection {
    networkType: string;
    addressType: string;
    connectionAddress: string;
}
export interface SdpTiming {
    start: number;
    stop: number;
}
export interface SdpMedia {
    type: string;
    port: number;
    protocol: string;
    payloads: SdpPayload[];
    inactive: boolean;
}
export interface SdpPayload {
    id: number;
    rtp: SdpRtp;
    fmtp: SdpFmtp;
}
export interface SdpRtp {
    codec: string;
    rate: number;
}
export interface SdpFmtp {
    params: any;
}
export declare class Sdp extends Model {
    version: number;
    origin: SdpOrigin;
    sessionName: string;
    connection: SdpConnection;
    timing: SdpTiming;
    media: SdpMedia[];
    audio: SdpMedia;
    static format(sdp: any): string;
    constructor(data?: any);
    toString(options?: any): string;
}
