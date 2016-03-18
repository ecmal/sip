
import {Emitter} from "../events";
import {Parser} from "../parser";
import {Message} from "../models/message";
import {Via} from "../models/common/via";
import {Agent} from "../models/common/agent";
import {Request} from "../models/message/request";
import {Uri} from "../models/common/uri";
import {Response} from "../models/message/response";
import {Util} from "../models/common/utils";


export class Transport extends Emitter {

    public static CONNECT:string='connected';
    public static DISCONNECT:string='disconnect';


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

    public get uri():Uri{
        return Object.defineProperty(this,'uri',<any>{
            value : new Uri({
                host : '0.0.0.0',
                port : 5060
            })
        }).uri;
    }
    public get proxy():Uri{
        return Object.defineProperty(this,'proxy',<any>{
            value : new Uri({
                host : '0.0.0.0',
                port : 5060
            })
        }).proxy;
    }
    public get protocol():string{
        throw new Error('Abstract property "protocol"')
    }
    public get connected():boolean{
        return false;
    }
    public get localAddress():string{
        return this.uri.host;
    }
    public get localPort():number{
        return this.uri.port;
    }

    public get remoteAddress():string{
        return this.proxy.host;
    }
    public get remotePort():number{
        return this.proxy.port;
    }

    public get debug():boolean{
        return true;
    }

    constructor(proxy:Uri|string){
        super();
        if(proxy){
            if(typeof proxy =='string'){
                this.proxy.set(new Uri(<string>proxy));
            }else{
                this.proxy.set(proxy);
            }
        }
        this.doInit();
    }

    public request(request:Request):Promise<Response>{
        return new Promise((accept,reject)=>{
            this.once(`response:${request.callId}`,(response:Response)=>{
                if(response.status>400){
                    reject(response)
                }else{
                    accept(response)
                }
            });
            setTimeout(()=>{
                this.emit(`response:${request.callId}`,new Response({
                    status  : 408,
                    message : 'Request Timeout',
                    callId  : request.callId
                }))
            },60000);
            this.send(request);
        })
    }
    public send(message:Message){
        message.agent = this.agent;
        if(message.content){
            message.contentLength = message.content.length;
        }else{
            message.contentLength = 0;
        }
        if(message instanceof Request){
            if(!message.contact){
                message.contact = message.to.clone();
                message.contact.uri.host = this.localAddress;
                message.contact.uri.port = this.localPort;
            }
            message.via = this.via;
        }
        if(this.debug){
            message.print(true)
        }
        this.doSend(message.toBuffer());
    }
    public toString(options?:any){
        return `Station(${this.uri.toString(options)})`;
    }

    protected get via(){
        return Object.defineProperty(this,'via',<any>{
            value:new Via({
                protocol    : 'SIP',
                version     : '2.0',
                transport   : this.protocol,
                host        : this.remoteAddress,
                port        : this.remotePort,
                params      : {
                    branch  : `z9hG4bK.${Util.hash(8)}`,
                    alias   : undefined,
                    rport   : undefined
                }
            })
        }).via;
    }
    protected get agent(){
        return Object.defineProperty(this,'agent',<any>{
            value : new Agent({
                name        : 'WCB',
                version     : "1.0.0"
            })
        }).agent;
    }
    protected get processor(){
        var head = new Buffer(0);
        var message : Message=null;
        return Object.defineProperty(this,'processor',<any>{
            value : (chunk)=>{
                var sep,data:Buffer = Buffer.concat([head,chunk],head.length+chunk.length);
                function messageDone(){
                    return message.contentLength==message.content.length;
                }
                function writeHead(header){
                    try{
                        message = Parser.parse(header, Message);
                    }catch(ex){
                        console.info(header);
                        console.info(ex.stack);
                    }
                }
                function writeBody(chunk){
                    if(!message.content){
                        message.content = new Buffer(0);
                    }
                    if(typeof message.contentLength!="number"){
                        console.info(message)
                    }
                    var totalLength = message.contentLength;
                    var bodyLength = message.content.length;
                    var pendingLength = totalLength-bodyLength;
                    var availableLength = Math.min(pendingLength,chunk.length);
                    var newLength = bodyLength+availableLength;
                    message.content = Buffer.concat([message.content,chunk.slice(0,availableLength)],newLength) ;
                    //console.info("CHUNK",totalLength,bodyLength,pendingLength,availableLength,newLength,message.content.length,chunk.length);
                    return chunk.slice(availableLength);
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
            }
        }).processor;
    }
    protected onMessage(message:Message){
        if(this.debug){
            message.print()
        }
        if(message instanceof Request){
            this.onRequest(message);
        } else
        if(message instanceof Response){
            this.onResponse(message)
        }
    }
    protected onRequest(request:Request){
        if(!request.uri.username && request.method=="OPTIONS"){
           this.send(request.reply(200,'OK','to,from,callId,sequence,via,maxForwards'));
        }
        this.emit('request',request);
    }
    protected onResponse(response:Response){
        this.emit(`response:${response.callId}`,response);
        this.emit('response',response);
    }
    protected doSend(buffer:Buffer){
        throw new Error('Abstract method "send"')
    }
    protected doInit(){
        throw new Error('Abstract method "send"')
    }
    protected inspect(){
        return this.toString({inspect:true})
    }
}
