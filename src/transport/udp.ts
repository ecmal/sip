
import {Message} from "../models/message";
import {Util} from "../models/common/utils";
import {Transport} from "./transport";

export class UdpTransport extends Transport {
    public get debug():boolean{
        return false;
    }
    public get connected():boolean{
        return !!this.socket;
    }
    public get protocol():string{
        return 'UDP';
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
        this.doConnect();//6028928700
    }
    protected doConnect(){
        Util.getLocalIpAddress().then(local=>{
            this.uri.host = local;
            this.socket = Util.udp.createSocket("udp4");
            this.socket.on('error',this.onError.bind(this));
            this.socket.on('listening',this.onConnect.bind(this));
            this.socket.bind(this.localPort||5060,local);
        }).catch(e=>console.info(e));
    }
    protected onConnect(){
        this.socket.once('close',this.onClose.bind(this));
        this.socket.on('message',this.processor);
        this.via.host = this.localAddress;
        this.via.port = this.localPort;
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
            this.socket = null;
        }
    }
    protected doSend(buffer:Buffer){
        this.socket.send(buffer,0,buffer.length,this.remotePort,this.remoteAddress);
    }
}
