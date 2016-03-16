import {Util} from "./models/common/utils";
import {Message} from "./models/message";
import {Parser} from "./parser";
import {Transport} from "./transport";
import {Request} from "./models/message/request";
import {Response} from "./models/message/response";

export class Registry {
    static start(){
        this.instance.server.bind(5060);
    }
    static get instance(){
        return Object.defineProperty(this,'instance',<any>{
            value:new Registry()
        }).instance
    }
    private server:any;
    private received:any;

    constructor(){
        this.server = Util.dgram.createSocket("udp4");
        this.received = 0;
        var head = new Buffer(0),message:Message=null;
        this.server.on("message", (chunk, rinfo)=>{
            //console.info("CHUNK",chunk.length);
            //console.info(chunk.toString());

            var sep,data:Buffer = Buffer.concat([head,chunk],head.length+chunk.length);
            function messageDone(){
                return message.contentLength==message.content.length;
            }
            function writeHead(header){
                message = Parser.parse(header,Message);
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
        });
        this.server.on("listening", ()=>{
            var address = this.server.address();
            console.log("server listening " + address.address + ":" + address.port);
        });
    }
    onMessage(message:Message){
        if(message instanceof Request){
            this.onRequest(message);
        }else
        if(message instanceof Response){
            this.onResponse(message)
        }

    }

    onRequest(request:Request){
        request.print();
        if(request.method=="OPTIONS"){
            this.send(request.reply(200,"OK",'to,from,callId,sequence,maxForwards'));
        }
    }

    onResponse(response:Response){
        response.print()
    }

    send(message:Message){
        if(message.content){
            message.contentLength = message.content.length;
        }else{
            message.contentLength = 0;
        }
        if(message instanceof Request){
            this.sendRequest(message)
        }else
        if(message instanceof Response){
            this.sendResponse(message);
        }
        if(message.contentLength>0){
            this.sendBuffer(message.content,message.via.host,message.via.port)
        }
    }
    sendRequest(request:Request){
        request.print(true);
        this.sendText(request.toString(),request.via.host,request.via.port);
    }
    sendResponse(response:Response){
        response.print(true);
        this.sendText(response.toString(),response.via.host,response.via.port);
    }
    sendText(message:string,host:string,port?:number){
        this.sendBuffer(new Buffer(message),host,port);
    }
    sendBuffer(message:Buffer,host:string,port?:number){
        this.server.send(message,0,message.length, port||5060, host);
    }
}