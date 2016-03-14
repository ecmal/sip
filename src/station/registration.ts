import {Request} from "../models/message/request";
import {Contact} from "../models/common/contact";
import {Transport} from "../transport";
import {Uri} from "../models/common/uri";
import {Util} from "../models/common/utils";
import {Sequence} from "../models/common/sequence";
import {Message} from "../models/message";
import {Response} from "../models/message/response";
import {Station} from "../station";
import {Challenge} from "../models/common/challenge";


export class RegisterFlow {

    private station:Station;
    private request:Request;
    private challenge:Challenge;

    constructor(station:Station){
        this.station = station;
        this.request = new Request({
            method          : "REGISTER",
            uri             : new Uri({
                scheme      : station.contact.uri.scheme,
                host        : station.contact.uri.host,
                port        : station.contact.uri.port
            }),
            from            : station.contact.uri,
            to              : station.contact.uri,
            contact         : station.contact,
            expires         : 3600,
            callId          : Util.guid(),
            sequence        : new Sequence({
                method      : "REGISTER",
                value       : 1
            }),
            contentLength   : 0
        });
        this.request.setHeader('Allow','INVITE, ACK, CANCEL,  BYE, REFER, NOTIFY, MESSAGE, SUBSCRIBE, INFO');
        this.onResponse = this.onResponse.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.station.on('response',this.onResponse);
        this.station.on('connect',this.onConnect);
    }
    sign(request:Request){
        request.authorization = this.challenge.authorize(request.method,this.station.contact.uri);
    }
    onConnect(){
        this.station.emit('registering');
        this.station.transport.send(this.request)
    }
    onResponse(message:Response){
        if(message.callId == this.request.callId){
            if(message.status == 401){
                this.challenge = message.authenticate;
                if(!this.request.authorization){
                    this.sign(this.request);
                    this.request.sequence.value++;
                    this.station.transport.send(this.request);
                }else{
                    console.info(`Invalid credentials for ${this.station.contact}`);
                }
            }else
            if(message.status == 200){
                this.station.emit('register')
            }
        }
    }
}