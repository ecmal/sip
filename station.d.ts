import { Emitter } from "./events";
import { Transport } from "./transport";
import { Contact } from "./models";
import { RegisterDialog } from "./dialogs/registration";
import { InviteManager } from "./dialogs/invitation";
export declare enum State {
    REGISTERING = 0,
    UNREGISTERING = 1,
    OFFLINE = 2,
    ONLINE = 3,
    DIALING = 4,
    TALKING = 5,
    RINGING = 6,
}
export declare class Station extends Emitter {
    state: State;
    transport: Transport;
    contact: Contact;
    address: Contact;
    registration: RegisterDialog;
    calls: InviteManager;
    connected(): boolean;
    isOffline: boolean;
    isRegistered: boolean;
    name: string;
    constructor(contact: Contact | string, transport?: Transport);
    setContact(contact: Contact | string): Station;
    setTransport(transport: Transport): Station;
    register(expires?: number): Promise<void>;
    toString(options?: any): string;
    private inspect();
    private onConnect();
    private onRequest(request);
    private onResponse(response);
}
