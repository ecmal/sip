export interface EventEmitter {
    on(event: string, listener: Function): Emitter;
    once(event: string, listener: Function): Emitter;
    off(event?: string, listener?: Function): Emitter;
    listeners(event?: string): Function[];
    emit(event: string, ...args: any[]): void;
}
export declare class Emitter implements EventEmitter {
    static on<T>(target: T, event: string, handler: Function, once?: boolean): T;
    static off<T>(target: T, event: string, handler: Function): T;
    static listeners(target: any, event: string): Function[];
    static emit(target: any, event: string, ...args: any[]): void;
    on(event: string, listener: Function): Emitter;
    once(event: string, listener: Function): Emitter;
    off(event?: string, listener?: Function): Emitter;
    listeners(event?: string): Function[];
    emit(event: string, ...args: any[]): void;
}
