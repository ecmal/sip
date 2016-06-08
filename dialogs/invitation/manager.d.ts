import { Contact } from "../../models/common/contact";
import { Call } from "./call";
import { Station } from "../../station";
import { InviteDialog } from "./dialog";
import { Request } from "../../models/message/request";
export declare class InviteManager {
    call: Call;
    dialog: InviteDialog;
    station: Station;
    constructor(station: Station);
    onRequest(message: Request): void;
    sendInvite(to: Contact): void;
    protected createDialog(request: Request, type: {
        new (station: Station, request: Request): InviteDialog;
    }): void;
}
