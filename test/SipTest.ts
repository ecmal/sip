import {Transport} from "sip/transport";
import {Station} from "sip/station";
import {Parser} from "sip/parser";
import {Message} from "sip/models";
import {Uri} from "sip/models/common/uri";
import {Version} from "sip/models/common/version";
import {Via} from "sip/models/common/via";
import {Contact} from "sip/models/common/contact";
import {Sequence} from "sip/models/common/sequence";
import {Mime} from "sip/models/common/mime";
import {Agent} from "sip/models/common/agent";
import {Request} from "sip/models/message/request";
import {SipClient} from "sip/sip";

import  {createHash} from 'node/crypto';


/*console.info(Parser.parse(`
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
`,Message));*/

const SIP_METHODS={
    REGISTER    :"REGISTER",
    INVITE      :"INVITE",
    ACK         :"ACK",
    BYE         :"BYE",
    CANCEL      :"CANCEL",
    OPTIONS     :"OPTIONS",
    PRACK       :"PRACK",
    SUBSCRIBE   :"SUBSCRIBE",
    NOTIFY      :"NOTIFY",
    PUBLISH     :"PUBLISH",
    INFO        :"INFO",
    REFER       :"REFER",
    MESSAGE     :"MESSAGE",
    UPDATE      :"UPDATE"
};

var x=(new Request({
    method  : SIP_METHODS.REGISTER,
    uri     : Parser.parse('sip:win.freedomdebtrelief.com',Uri,false),
    version : new Version({
        minor: 0,
        major: 2
    }),
    headers : {
        "Call-ID"        : "eRebdDPcxy",
        "Max-Forwards"   : 70,
        "Expires"        : 3600,
        "Content-Length" : 0,
        "From"           : new Contact({
            name        : "101",
            uri         : new Uri({
                scheme   : "sip",
                host     : "win.freedomdebtrelief.com",
                username : "101"
            }),
            params      : {
                tag : "7Lq7OgaDW"
            }
        }),
        "To"             : new Contact({
            name    : "101",
            uri     : new Uri({
                scheme   : "sip",
                host     : "win.freedomdebtrelief.com",
                username : "101"
            }),
            params  : {
                tag : "7Lq7OgaDW"
            }
        }),
        "CSeq"           : new Sequence({
            method  : "REGISTER",
            value   : 20
        }),
        "User-Agent"     : new Agent({
            class        : "Agent",
            name         : "Linphone",
            version      : "3.9.0",
            comment      : "belle-sip/1.4.2"
        }),
        "Via"            : [
            new Via({
                protocol    : "SIP",
                version     : "2.0",
                transport   : "TCP",
                host        : "192.168.10.105",
                port        : 50405,
                params      : {
                    alias   : null,
                    branch  : "z9hG4bK.~3I3SLROQ",
                    rport   : null
                }
            })
        ],
        "Supported"      : [
            "outbound"
        ],
        "Accept"         : [
            new Mime({
                type    : "application",
                subtype : "sdp"
            }),
            new Mime({
                type    : "text",
                subtype : "plain"
            }),
            new Mime({
                type    : "application",
                subtype : "vnd.gsma.rcs-ft-http+xml"
            })
        ],
        "Contact"        : [
            new Contact({
                name    : "101",
                uri     : new Uri({
                    scheme     : "sip",
                    host       : "192.168.10.105",
                    port       : 50405,
                    username   : "101",
                    params     : {
                        transport: "tcp"
                    }
                }),
                params  : {
                    "+sip.instance": "urn:uuid:9548ce0d-4303-475b-bbd4-ca6559d3f960"
                }
            })
        ]
    }
}).toString());

var y=`REGISTER sip:win.freedomdebtrelief.com;transport=UDP SIP/2.0
Via: SIP/2.0/UDP 192.168.10.103:37273;branch=z9hG4bK-d8754z-ed993d8215917780-1---d8754z-
Max-Forwards: 70
Contact: <sip:102@192.168.10.103:37273;rinstance=3d805b948ede0fdf;transport=UDP>
To: <sip:102@win.freedomdebtrelief.com;transport=UDP>
From: <sip:102@win.freedomdebtrelief.com;transport=UDP>;tag=a94ce10d
Call-ID: NzMzY2I1M2VmZDBjZTEzYmRhNWQ4Nzc2NGQ0OTQyZTg.
CSeq: 1 REGISTER
Expires: 3600
Allow: INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE
Supported: replaces, norefersub, extended-refer, timer, X-cisco-serviceuri
User-Agent: Z 3.3.21933 r21903
Allow-Events: presence, kpml
Content-Length: 0`;

var z=`REGISTER sip:win.freedomdebtrelief.com;transport=UDP SIP/2.0
Via: SIP/2.0/UDP 192.168.10.103:37273;branch=z9hG4bK-d8754z-57ba7316134c7229-1---d8754z-
Max-Forwards: 70
Contact: <sip:102@192.168.10.103:37273;rinstance=3d805b948ede0fdf;transport=UDP>
To: <sip:102@win.freedomdebtrelief.com;transport=UDP>
From: <sip:102@win.freedomdebtrelief.com;transport=UDP>;tag=a94ce10d
Call-ID: NzMzY2I1M2VmZDBjZTEzYmRhNWQ4Nzc2NGQ0OTQyZTg.
CSeq: 2 REGISTER
Expires: 3600
Allow: INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE
Supported: replaces, norefersub, extended-refer, timer, X-cisco-serviceuri
User-Agent: Z 3.3.21933 r21903
Authorization: Digest username="102",realm="win.freedomdebtrelief.com",nonce="33013310c380f48dff5561ac6d2a077a",uri="sip:win.freedomdebtrelief.com;transport=TCP",response="",cnonce="5e08d57725feeaf0c2ee922419715974",nc=00000001,qop=auth,algorithm=MD5,opaque="00000041"
Allow-Events: presence, kpml
Content-Length: 0`;

var client=new SipClient();
client.connect('192.168.10.200',5060);

setTimeout(()=>{client.send(Methods.toSIP(y))},1000);
client.on('SIPresponse',(e)=>{
    console.info(e);
    let response = Parser.parse(e,Message);
    //console.log(request.headers['CSeq']['method']);
        var method:string=response.headers['CSeq']['method'];
        var username:string=response.headers['To']['name'];
        var password:string='102';
        var realm:string=response.headers['WWW-Authenticate']['params']['realm'];
        var nonce:string=response.headers['WWW-Authenticate']['params']['nonce'];
        var cnonce:string='5e08d57725feeaf0c2ee922419715974';
        var nc:string='00000001';
        var qop:string=response.headers['WWW-Authenticate']['params']['qop'][0];
        var uri:string='sip:win.freedomdebtrelief.com;transport=TCP';
    //console.info(method,username,password,realm,nonce,cnonce,nc,qop,uri);
        var resHead:string=Methods.digRes(method,username,password,realm,nonce,cnonce,nc,qop,uri);
var req=`REGISTER sip:win.freedomdebtrelief.com;transport=UDP SIP/2.0
Via: SIP/2.0/UDP 192.168.10.103:37273;branch=z9hG4bK-d8754z-57ba7316134c7229-1---d8754z-
Max-Forwards: 70
Contact: <sip:102@192.168.10.103:37273;rinstance=3d805b948ede0fdf;transport=UDP>
To: <sip:102@win.freedomdebtrelief.com;transport=UDP>
From: <sip:102@win.freedomdebtrelief.com;transport=UDP>;tag=a94ce10d
Call-ID: NzMzY2I1M2VmZDBjZTEzYmRhNWQ4Nzc2NGQ0OTQyZTg.
CSeq: 2 REGISTER
Expires: 3600
Allow: INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE
Supported: replaces, norefersub, extended-refer, timer, X-cisco-serviceuri
User-Agent: Z 3.3.21933 r21903
Authorization: Digest username="${username}",realm="${realm}",nonce="${nonce}",uri="${uri}",response="${resHead}",cnonce="${cnonce}",nc=${nc},qop=${qop},algorithm=MD5,opaque="00000041"
Allow-Events: presence, kpml
Content-Length: 0`;
    console.info(Methods.toSIP(req));
    setTimeout(()=>{
        //console.info(Methods.toSIP(req));
        client.send(Methods.toSIP(req))
    },2000);

});
class Methods{
    static toSIP(text:string){
        return text.split('\n').join('\r\n').concat('\r\n\r\n');
    }
    static toMD5(text:string){
        return createHash('md5').update(text).digest('hex');
    }
    /*
    current calculating algorithm
    https://en.wikipedia.org/wiki/Digest_access_authentication

    HA1=MD5(username:realm:password)
    HA2=MD5(method:digestURI)
    response=MD5(HA1:nonce:nonceCount:cnonce:qop:HA2)

    whole algorithm
     If the algorithm directive's value is "MD5" or unspecified, then HA1 is

     HA1=MD5(username:realm:password)
     If the algorithm directive's value is "MD5-sess", then HA1 is

     HA1=MD5(MD5(username:realm:password):nonce:cnonce)
     If the qop directive's value is "auth" or is unspecified, then HA2 is

     HA2=MD5(method:digestURI)
     If the qop directive's value is "auth-int", then HA2 is

     HA2=MD5(method:digestURI:MD5(entityBody))
     If the qop directive's value is "auth" or "auth-int", then compute the response as follows:

     response=MD5(HA1:nonce:nonceCount:cnonce:qop:HA2)
     If the qop directive is unspecified, then compute the response as follows:

     response=MD5(HA1:nonce:HA2)
    */
    static digRes(
        method:string,
        username:string,
        password:string,
        realm:string,
        nonce:string,
        cnonce:string,
        nc:string,
        qop:string,
        uri:string){

        var HA1=this.toMD5(username+':'+realm+':'+password);
        var HA2=this.toMD5(method+':'+uri);

        return this.toMD5(HA1+':'+nonce+':'+nc+':'+cnonce+':'+qop+':'+HA2);
    }
}

/*console.info(Methods.digRes(
    SIP_METHODS.REGISTER,
    '102',
    '102',
    'win.freedomdebtrelief.com',
    'd56abdde9a7d97f72fb9ca5c0250411b',
    '5e08d57725feeaf0c2ee922419715974',
    '00000001',
    'auth',
    'sip:win.freedomdebtrelief.com;transport=TCP'
));*/
/*
Promise.all([
    Transport.get('"Clients" <sip:192.168.10.200;transport=tcp>').connect().then(win=>{
        return Promise.all([
            Station.get('"Sergey Mamyan" <sip:101:101@win.freedomdebtrelief.com>').register(win),
            Station.get('"Vahram Bleyan" <sip:102:102@win.freedomdebtrelief.com>').register(win),
            Station.get('"Grish Grigoryan" <sip:103:103@win.freedomdebtrelief.com>').register(win)
        ])
    }),
    Transport.get('"Agents" <sip:192.168.10.200;transport=tcp>').connect().then(win=>{
        return Promise.all([
            Station.get('"Sergey Mamyan" <sip:101:101@dev.freedomdebtrelief.com>').register(win),
            Station.get('"Vahram Bleyan" <sip:102:102@dev.freedomdebtrelief.com>').register(win),
            Station.get('"Grish Grigoryan" <sip:103:103@dev.freedomdebtrelief.com>').register(win)
        ])
    })
]).then(r=>console.info(r),e=>console.info(e))
*/
