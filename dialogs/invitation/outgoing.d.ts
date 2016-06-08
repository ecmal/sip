import { Station } from "../../station";
import { Request } from "../../models/message/request";
import { Response } from "../../models/message/response";
import { InviteDialog } from "./dialog";
export declare class OutgoingInviteDialog extends InviteDialog {
    constructor(station: Station, request: Request);
    protected onResponse(message: Response): void;
    protected onRequest(message: Request): void;
    protected onAck(request: Request): void;
    protected onBye(request: Request): void;
    protected onInvite(request: Request): void;
    protected onCancel(request: Request): void;
    protected sendByeAccept(message: Request): void;
    protected sendCancelAccept(message: Request): void;
    protected sendAck(response: Response): void;
    protected sendBye(): void;
    protected sendInvite(): void;
    protected sendInviteAccept(message: Request): void;
    protected init(request: Request): void;
    protected done(): void;
}
