/**
 *  0               1               2               3
 *  0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |V=2|P|X|  CC   |M|     PT      |       sequence number         |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                           timestamp                           |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |           synchronization source (SSRC) identifier            |
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 * |            contributing source (CSRC) identifiers             |
 * |                             ....                              |
 * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |      defined by profile       |           length              |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                        header extension                       |
 * |                             ....                              |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *                              payload
 *                               ....
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * @author <a href="http://bruno.biasedbit.com/">Bruno de Carvalho</a>
 */
export declare class RtpPacket {
    private static getPayloadType(buffer);
    private static hasExtension(buffer);
    private static getExtensionType(buffer);
    private static getExtensionCount(buffer);
    private static getExtensionLength(buffer);
    private static getSourcesCount(buffer);
    private static getSourcesLength(buffer);
    private static getHeaderLength(buffer);
    constructor(options: any);
    buffer: Buffer;
    version: number;
    padding: boolean;
    marker: boolean;
    sequence: number;
    timestamp: number;
    sources: number[];
    source: number;
    type: number;
    data: Buffer;
    extension: any;
    toJSON(): {
        version: number;
        padding: boolean;
        marker: boolean;
        type: number;
        sequence: number;
        timestamp: number;
        source: number;
        sources: number[];
        extension: any;
        data: Buffer;
    };
    copy(): RtpPacket;
}
