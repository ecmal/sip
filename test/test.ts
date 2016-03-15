import {Transport} from "sip/transport";
import {Station} from "sip/station";
import {Contact} from "sip/models/common/contact";
import {Parser} from "sip/parser";
import {Message} from "sip/models/message";
import {Request} from "sip/models/message/request";
import {InviteFlow} from "sip/station/invitation";
import {Response} from "sip/models/message/response";

type AgentMap = {[k:string]:Agent}
type AgentList = Agent[];

class Agent extends Station {
    static get proxy(){
        return 'i3-dcic1-px1.freedomdebtrelief.com:8060'
    }
    static get server(){
        return 'i3-dcic1-px1.freedomdebtrelief.com'
    }
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new Transport(`sip:${Agent.proxy}`)
        }).transport;
    }
    static get directory():AgentMap{
        return Object.defineProperty(this,'directory',<any>{
            value : Object.create(null)
        }).directory;
    }

    static start(list:any[]):AgentList{
        return list.map((o:any[])=>{
            return Agent.directory[o[0]]=new Agent(o[0],o[1],...o.slice(2));
        })
    }
    constructor(username,password,...options){
        super(`sip:${username}:${password}@${Agent.server}`,Agent.transport);
        this.onRegister = this.onRegister.bind(this);
        this.onInvite = this.onInvite.bind(this);
        this.onCall = this.onCall.bind(this);
        this.onBye = this.onBye.bind(this);
        this.on('register',this.onRegister);
        this.on('invite',this.onInvite);

    }

    onRegister(){
        console.info(`Agent ${this.name} Registered`);
    }
    onInvite(call){
        console.info(`Agent ${this.name} Invited by ${call.from.name} to call ${call.id}`);
        this.once('call',this.onCall);
        this.once('bye',this.onBye);
        setTimeout(()=>{
            call.take();
        },5000)
    }
    onCall(call){
        console.info(`Agent ${this.contact} start talking to ${call.from.name} on call ${call.id}`);
        setTimeout(()=>{
            call.drop();
        },30000)
    }
    onBye(call){
        console.info(`Agent ${this.contact} end talking to ${call.from.name} on call ${call.id}`);
    }
    call(extension){
        this.invitation.sendInvite(new Contact(`sip:${extension}@${Agent.server}`));
    }
    drop(){
        this.invitation.call.drop();
    }
    take(){
        this.invitation.call.take();
    }

    testCall(){
        try {
            var guid= `<urn:uuid:${Math.round(Math.random()*0xFFFFFFFF).toString(16)}-4303-475b-bbd4-ca6559d3f960>`;
            var message:Request = <Request>Parser.parse(Parser.normalize(`
                INVITE sip:123456789@i3-dcic1-px1.freedomdebtrelief.com:8060 SIP/2.0
                Via: SIP/2.0/TCP 10.19.19.112:50454;branch=z9hG4bK.uMqMnoOis;rport
                From: <sip:Dev3SIP@i3-dcic1-px1.freedomdebtrelief.com>;tag=${Math.round(Math.random()*0xFFFFFFFF)}
                To: sip:123456789@i3-dcic1-px1.freedomdebtrelief.com
                CSeq: 20 INVITE
                Call-ID: ${Math.round(Math.random()*0xFFFFFFFF)}
                Max-Forwards: 70
                Supported: outbound
                Content-Type: application/sdp
                Content-Length: 584
                Contact: <sip:Dev3SIP@${this.transport.socket.localAddress}:${this.transport.socket.localPort};transport=tcp>;+sip.instance="${guid}"
                User-Agent: Linphone/3.9.0 (belle-sip/1.4.2)
            `),Message);

            delete message.from.name;
            delete message.to.name;

            message.setHeader('Allow','INVITE, ACK, CANCEL, OPTIONS, BYE, REFER, NOTIFY, MESSAGE, SUBSCRIBE, INFO, UPDATE')
            message.content = new Buffer(InviteFlow.encodeSdp(InviteFlow.decodeSdp(`
                v=0
                o=Dev3SIP 714 2813 IN IP4 10.19.19.112
                s=Talk
                c=IN IP4 10.19.19.112
                t=0 0
                a=rtcp-xr:rcvr-rtt=all:10000 stat-summary=loss,dup,jitt,TTL voip-metrics
                m=audio 18089 RTP/AVP 96 97 98 0 8 3 9 99 10 11 101 100 102 103 104
                a=rtpmap:96 opus/48000/2
                a=fmtp:96 useinbandfec=1
                a=rtpmap:97 speex/16000
                a=fmtp:97 vbr=on
                a=rtpmap:98 speex/8000
                a=fmtp:98 vbr=on
                a=rtpmap:99 speex/32000
                a=fmtp:99 vbr=on
                a=rtpmap:101 telephone-event/48000
                a=rtpmap:100 telephone-event/16000
                a=rtpmap:102 telephone-event/8000
                a=rtpmap:103 telephone-event/32000
                a=rtpmap:104 telephone-event/44100
            `)));
            message.contentLength = message.content.length;
            //this.registration.sign(message);
            this.transport.send(message);
            this.transport.on('message',(m:Message)=>{
                if(m instanceof Response){
                    if(m.status == 401){
                        console.info(m.toString());
                        message.sequence.value++;
                        message.authorization = m.authenticate.authorize(message,'Dev3SIP','735433');
                        /*
                        this.transport.send(<Request>Parser.parse(Parser.normalize(`
                            ACK sip:123456789@i3-dcic1-px1.freedomdebtrelief.com:8060 SIP/2.0
                            Via: SIP/2.0/TCP 10.19.19.112:56671;branch=z9hG4bK.eMq88P7ia;rport
                            Call-ID: ${message.callId}
                            From: ${m.from}
                            To: ${m.to}
                            Contact: ${message.contact} 
                            Max-Forwards: 70
                            CSeq: 20 ACK
                            Content-Length: 0
                        `),Message));*/
                        message.callId = Math.round(Math.random()*0xFFFFFFFF).toString();
                        this.transport.send(message);
                    }
                }
            })
        }catch(ex){
            console.info(ex.stack)
        }
        var body =`
v=0
o=Dev3SIP 714 2813 IN IP4 10.19.19.112
s=Talk
c=IN IP4 10.19.19.112
t=0 0
a=rtcp-xr:rcvr-rtt=all:10000 stat-summary=loss,dup,jitt,TTL voip-metrics
m=audio 7078 RTP/AVP 96 97 98 0 8 3 9 99 10 11 101 100 102 103 104
a=rtpmap:96 opus/48000/2
a=fmtp:96 useinbandfec=1
a=rtpmap:97 speex/16000
a=fmtp:97 vbr=on
a=rtpmap:98 speex/8000
a=fmtp:98 vbr=on
a=rtpmap:99 speex/32000
a=fmtp:99 vbr=on
a=rtpmap:101 telephone-event/48000
a=rtpmap:100 telephone-event/16000
a=rtpmap:102 telephone-event/8000
a=rtpmap:103 telephone-event/32000
a=rtpmap:104 telephone-event/44100`
    }
}

type ClientMap = {[k:string]:Client}
type ClientList = Client[];

class Client extends Station {
    static get server(){
        return 'win.freedomdebtrelief.com'
    }
    static get transport(){
        return Object.defineProperty(this,'transport',<any>{
            value : new Transport(`sip:${Client.server}`)
        }).transport;
    }
    static get directory():ClientMap{
        return Object.defineProperty(this,'directory',<any>{
            value : Object.create(null)
        }).directory;
    }
    static start(list:any[]):ClientList{
        return list.map((o:any[])=>{
            return Client.directory[o[0]]=new Client(o[0],o[1],...o.slice(2));
        })
    }
    constructor(username,password,...options){
        super(`sip:${username}:${password}@${Client.server}`,Client.transport);
        this.onRegister = this.onRegister.bind(this);
        this.onInvite = this.onInvite.bind(this);
        this.onCall = this.onCall.bind(this);
        this.onBye = this.onBye.bind(this);
        this.on('register',this.onRegister);
        this.on('invite',this.onInvite);
    }
    onRegister(){
        console.info(`Client ${this.contact.name} Registered`);
        //this.invitation.sendInvite(new Contact("sip:101@win.freedomdebtrelief.com"));
    }
    onInvite(call){
        console.info(`Agent ${this.contact.name} Invited by ${call.from.name} to call ${call.id}`);
        setTimeout(()=>{
            call.take();
            this.once('call',this.onCall);
            this.once('bye',this.onBye);
        },10000);
    }
    onCall(call){
        console.info(`Agent ${this.contact.name} start talking to ${call.from.name} on call ${call.id}`);
    }
    onBye(call){
        console.info(`Agent ${this.contact.name} end talking to ${call.from.name} on call ${call.id}`);
    }
    call(extension){
        this.invitation.sendInvite(new Contact(`sip:${extension}@${Client.server}`));
    }
    drop(){
        this.invitation.call.drop();
    }
    take(){
        this.invitation.call.take();
    }
}

System['Stations'] = Object.create(null);


Agent.start([
    ["SP0001","SP0003"]
]).forEach(a=>{
    System['Stations']['A'+a.contact.uri.username]=a;
});

/*
Client.start([
    ["201","201"]
]).forEach(a=>{
    System['Stations']['C'+a.contact.uri.username]=a;
});
*/
/*
Agent.start([
    ["101","101"]
]).forEach(a=>{
    System['Stations']['A'+a.contact.uri.username]=a;
});
*/




