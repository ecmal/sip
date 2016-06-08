import { Message } from "../models/message";
import { Transport } from "./transport";
export declare class TcpTransport extends Transport {
    debug: boolean;
    protocol: string;
    connected: boolean;
    send(message: Message): void;
    protected socket: any;
    protected queue: Message[];
    protected doInit(): void;
    protected doConnect(): void;
    protected onConnect(): void;
    protected onError(error: any): void;
    protected onClose(): void;
    protected doDestroy(): void;
    protected doSend(buffer: Buffer): void;
}
