import {Contact} from "./models";
import {Emitter} from "./events";
import {Parser} from "./parser";
import {Socket} from "node/net";
import * as NET from "node/net";

const TRANSPORTS:{[k:string]:Transport} = Object.create(null);
export class Transport extends Emitter {

    static get(uri:string|Contact):Transport{
        var contact = (uri instanceof Contact)?uri:Parser.parse(<string>uri,Contact);
        return TRANSPORTS[contact.uri.server] || new Transport(contact);
    }

    private static getMessage(text:string):string{
        return text.trim().split('\n').map(l=>l.trim()).join('\r\n')+'\r\n\r\n';
    }

    private static separator = new Buffer('\r\n\r\n');
    private static indexOf(buffer:Buffer):number{
        var sep =Transport.separator;
        for(var i=0;i<buffer.length-sep.length+1;i++){
            var found = true;
            for(var m=0;m<sep.length;m++){
                if(buffer[i+m]!=sep[m]){
                    found = false;
                    break;
                }
            }
            if(found) {
                return i;
            }
        }
        return -1;
    }

    private socket:Socket;
    private message:any;
    private contact:Contact;

    public get port(){
        return this.contact.uri.port || 5060;
    }

    public get host(){
        return this.contact.uri.host || 'localhost';
    }

    constructor(contact:Contact){
        super();
        this.contact = contact;
        TRANSPORTS[contact.uri.server] = this;
    }

    connect():Promise<Transport>{
        return new Promise((accept,reject)=>{
            this.socket = NET.connect(this.port,this.host);
            this.socket.on('connect',(data)=>{
                accept(this)
            });
            this.socket.on('error',(err)=>{
                reject(err)
            });
            var head = new Buffer(0),message=null;
            this.socket.on('data',(chunk)=>{
                var sep,data:Buffer = Buffer.concat([head,chunk],head.length+chunk.length);
                function messageDone(){
                    return message.headers.contentLength==message.body.length;
                }
                function writeHead(header){
                    message = Parser.parse(header);
                }
                function writeBody(chunk){
                    var totalLength = message.headers.contentLength;
                    if(!message.body){
                        message.body = chunk.slice(0,totalLength);
                        return chunk.slice(totalLength);
                    }else{
                        var bodyLength = message.body.length;
                        var pendingLength = totalLength-bodyLength;
                        var availableLength = Math.min(pendingLength,chunk.length);
                        var newLength = bodyLength+availableLength;
                        message.body = Buffer.concat([message.body,chunk.slice(0,availableLength)],newLength) ;
                        return chunk.slice(availableLength);
                    }
                }
                if(message){
                    data = writeBody(data);
                }
                while((sep=Transport.indexOf(data))>0){
                    writeHead(data.toString('utf8',0,sep+2));
                    data = data.slice(sep+4);
                    data = writeBody(data);
                    if(messageDone()){
                        this.onMessage(message);
                        message = null;
                    }
                }
                head = data;
            })
        });
    }
    
    onMessage(message){
        console.info(message);
        this.emit('message',message);
    }
    register(){
        this.send(Transport.getMessage(`
            REGISTER sip:win.freedomdebtrelief.com SIP/2.0
            Via: SIP/2.0/TCP 192.168.10.105:50405;alias;branch=z9hG4bK.~3I3SLROQ;rport
            From: <sip:101@win.freedomdebtrelief.com>;tag=7Lq7OgaDW
            To: sip:101@win.freedomdebtrelief.com
            CSeq: 20 REGISTER
            Call-ID: eRebdDPcxy
            Max-Forwards: 70
            Supported: outbound
            Accept: application/sdp
            Accept: text/plain
            Accept: application/vnd.gsma.rcs-ft-http+xml
            Contact: <sip:101@192.168.10.105:50405;transport=tcp>;+sip.instance="<urn:uuid:9548ce0d-4303-475b-bbd4-ca6559d3f960>"
            Expires: 3600
            User-Agent: Linphone/3.9.0 (belle-sip/1.4.2)
            Content-Length: 0
        `));
    }

    send(text:string){
        console.info(text);
        this.socket.write(text);
    }

    toString(options?:any){
        return `Station(${this.contact.toString(options)})`;
    }
    inspect(){
        return this.toString({inspect:true})
    }
}