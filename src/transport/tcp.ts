import {Message} from "../models/message";
import {Util} from "../models/common/utils";
import {Transport} from "./transport";
export class TcpTransport extends Transport {
    public get debug():boolean{
        return false;
    }
    public get protocol():string{
        return 'TCP';
    }
    public get connected():boolean{
        return this.socket['connected'];
    }
    public send(message:Message){
        if(this.connected){
            super.send(message);
        }else{
            this.queue.push(message);
        }
    }
    protected socket:any;
    protected queue:Message[];
    protected doInit(){
        this.queue=[];
        Object.defineProperties(this.uri,{
            host:{get:()=>this.socket.localAddress||'0.0.0.0'},
            port:{get:()=>this.socket.localPort||5060}
        });
        this.doConnect();
    }
    protected doConnect(){
        this.socket = Util.net.connect(<any>{
            host        : this.remoteAddress,
            port        : this.remotePort
        });
        this.socket.once('connect',this.onConnect.bind(this));
        this.socket.on('error',this.onError.bind(this));
    }
    protected onConnect(){
        this.socket.once('close',this.onClose.bind(this));
        this.socket.on('data',this.processor);
        this.via.host = this.socket.localAddress;
        this.via.port = this.socket.localPort;
        this.socket['connected'] = true;
        this.emit('connect',this);
        while(this.queue.length){
            this.send(this.queue.shift());
        }
    }
    protected onError(error){
        this.emit('error',error,this);
        this.onClose()
    }
    protected onClose(){
        this.doDestroy();
        this.emit('disconnect',this);
    }
    protected doDestroy(){
        if(this.socket) {
            this.socket.destroy();
            this.socket = null;
        }
    }
    protected doSend(buffer:Buffer){
        this.socket.write(buffer);
    }
}
