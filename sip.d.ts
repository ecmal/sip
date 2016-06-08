import { Emitter } from "./events";
export declare class SipClient extends Emitter {
    private static getMessage(text);
    private static separator;
    private static indexOf(buffer);
    private socket;
    connect(host: string, port: number): void;
    register(): void;
    send(text: string): void;
}
