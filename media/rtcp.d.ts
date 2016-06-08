export declare class RtcpPacket {
    static parse(buffer: Buffer): RtcpAPPacket;
    static getType(buffer: Buffer): number;
    static getLength(buffer: Buffer): number;
    constructor(options: any);
    buffer: Buffer;
    version: number;
    padding: number;
    type: number;
    length: number;
    toJSON(): {
        version: number;
        type: number;
        length: number;
    };
    copy(): RtcpPacket;
}
export declare class RtcpSRPacket extends RtcpPacket {
    constructor(options: any);
    reports: RtcpReport[];
    reportsCount: number;
    source: number;
    startTime: number;
    endTime: number;
    timestamp: number;
    senderPacketCount: number;
    senderOctetCount: number;
    toJSON(): {
        version: number;
        padding: number;
        reportsCount: number;
        type: number;
        length: number;
        source: number;
        startTime: number;
        endTime: number;
        timestamp: number;
        senderPacketCount: number;
        senderOctetCount: number;
        reports: any[];
    };
}
export declare class RtcpRRPacket extends RtcpPacket {
    constructor(options: any);
    reportsCount: number;
    source: number;
    toJSON(): {
        version: number;
        padding: number;
        reportsCount: number;
        type: number;
        length: number;
        source: number;
        reports: any[];
    };
}
export declare class RtcpReport {
    private buffer;
    constructor(buffer: Buffer);
    static getReports(buffer: Buffer, start: number): any[];
    source: number;
    lostFraction: number;
    lostCount: number;
    highestSequence: number;
    jitter: number;
    LSR: number;
    DLSR: number;
    toJSON(): {
        source: number;
        lostFraction: number;
        lostCount: number;
        highestSequence: number;
        jitter: number;
        LSR: number;
        DLSR: number;
    };
}
export declare class RtcpSDPacket extends RtcpPacket {
    private static getSourcesCount(buffer);
    constructor(options: any);
    sources: any[];
    toJSON(): {
        version: number;
        type: number;
        length: number;
        sources: any[];
    };
}
export declare class RtcpAPPacket extends RtcpPacket {
    constructor(options: any);
}
export declare class RtcpGBPacket extends RtcpPacket {
    private static getSourcesCount(buffer);
    constructor(options: any);
    sources: any[];
    toJSON(): {
        version: number;
        type: number;
        length: number;
        sources: any[];
    };
}
