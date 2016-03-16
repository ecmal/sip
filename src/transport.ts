import {Contact} from "./models";
import {Emitter} from "./events";
import {Parser} from "./parser";
import {Socket} from "node/net";
import * as NET from "node/net";
import {Message} from "./models/message";
import {Via} from "./models/common/via";
import {Agent} from "./models/common/agent";
import {Request} from "./models/message/request";
import {Uri} from "./models/common/uri";
import {Response} from "./models/message/response";

enum State {
    CONNECTED,
    CONNECTING,
    DISCONNECTED
}

export class Transport extends Emitter {

    static guid(){
        return Math.round(Math.random()*0xFFFFFFFF).toString(16)
    }

    public static separator = new Buffer('\r\n\r\n');
    public static indexOf(buffer:Buffer):number{
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

    public socket:Socket;
    private message:any;

    public via:Via;
    private agent:Agent;
    private uri:Uri;
    private state:State;
    private get debug():boolean{
        return true;
    }
    public get isConnected():boolean{
        return this.state == State.CONNECTED;
    }
    public get isConnecting():boolean{
        return this.state == State.CONNECTING;
    }
    public get isDisconnected():boolean{
        return this.state == State.DISCONNECTED;
    }

    public get port(){
        return this.uri.port || 5060;
    }
    public get host(){
        return this.uri.host || 'localhost';
    }

    constructor(uri:Uri|string){
        super();
        this.state      = State.DISCONNECTED;
        this.uri        = (uri instanceof Uri) ? uri : new Uri(<string>uri);
        this.via        = new Via({
            protocol    :'SIP',
            version     :'2.0',
            transport   :'TCP',
            host        :null,
            port        :null,
            params      : {
                branch  : `z9hG4bK.${Transport.guid()}`
            }
        });
        this.agent      = new Agent({
            name        :'WCB',
            version     :"1.0.0"
        });
        this.doConnect();
    }

    private doConnect(){
        if(this.isDisconnected){
            this.state = State.CONNECTING;
            this.socket = NET.connect(<any>{
                port            : this.port,
                host            : this.host/*,
                localPort       : 5060*/
            });
            this.socket.on('connect',(data)=>{
                this.state = State.CONNECTED;
                this.via.host = this.socket.localAddress;
                this.via.port = this.socket.localPort;
                this.emit('connect',this)
            });
            this.socket.on('error',(err)=>{
                this.state = State.DISCONNECTED;
                this.emit('error',err,this);
            });
            this.socket.on('close',()=>{
                this.state = State.DISCONNECTED;
                this.emit('disconnect',this);
            });
            var head = new Buffer(0),message:Message=null;
            this.socket.on('data',(chunk)=>{
                //console.info("CHUNK",chunk.length);
                //console.info(chunk.toString());
                
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
            })
        }
    }

    connect():Promise<Transport>{
        return new Promise((accept,reject)=>{
            if(this.isConnected){
                accept(this)
            }else{
                this.once('connect',r=>accept(this));
                this.once('error',e=>reject(e));
                this.doConnect();
            }
        });
    }

    onMessage(message:Message){
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
    onRequest(request:Request){
        if(!request.uri.username && request.method=="OPTIONS"){
           this.send(request.reply(200,'OK','to,from,callId,sequence,via,maxForwards'));
        }
        this.emit('request',request);
    }
    onResponse(response:Response){
        this.emit(`response:${response.callId}`,response);
        this.emit('response',response);
    }
    request(request:Request){
        return new Promise((accept,reject)=>{
            this.once(`response:${request.callId}`,(response:Response)=>{
                if(response.status>400){
                    reject(response)
                }else{
                    accept(response)
                }
            });
            setTimeout(()=>{this.emit(`response:${request.callId}`,new Response({
                status  : 408,
                message : 'Request Timeout',
                callId  : request.callId
            }))},60000);
            this.send(request);
        })
    }

    send(message:Message){
        message.agent = this.agent;
        if(message.content){
            message.contentLength = message.content.length;
        }else{
            message.contentLength = 0;
        }
        if(message instanceof Request){
            message.via = this.via;
            this.sendRequest(message)
        }else
        if(message instanceof Response){
            this.sendResponse(message);
        }

        if(message.contentLength>0){
            this.socket.write(message.content);
        }

    }
    sendRequest(request:Request){
        if(this.debug) {
            request.print(true)
        }
        this.sendText(request.toString());
    }
    sendResponse(response:Response){
        if(this.debug) {
            response.print(true)
        }
        this.sendText(response.toString());
    }
    sendText(message:string){
        this.socket.write(message);
    }
    toString(options?:any){
        return `Station(${this.uri.toString(options)})`;
    }
    inspect(){
        return this.toString({inspect:true})
    }
}