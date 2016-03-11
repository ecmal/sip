import {Message} from "../message";
import {Uri} from "../common/uri";
import {Via} from "../common/Via";
export class Request extends Message {
    public method:string;
    public uri:Uri;
    get via():Via[]{
        return <Via[]>this.headers.Via;
    }
    toString(){
        var header = (k,h)=>{
            if(Array.isArray(h)){
                return h.map(i=>header(k,i))
            }else{
                return [`${k}: ${h}`]
            }
        };
        var headers = ()=>{
            return Object.keys(this.headers).map(k=>{
                return header(k,this.headers[k]).join('\r\n')
            })
        };
        return [
            `${this.method} ${this.uri} ${this.version}`,
            ...headers(),
            '',
            ''
        ].join('\r\n');
    }
}

/**
 * REGISTER sip:win.freedomdebtrelief.com SIP/2.0
 * Via: SIP/2.0/TCP 192.168.10.105:50405;alias;branch=z9hG4bK.~3I3SLROQ;rport
 * From: <sip:101@win.freedomdebtrelief.com>;tag=7Lq7OgaDW
 * To: sip:101@win.freedomdebtrelief.com
 * CSeq: 20 REGISTER
 * Call-ID: eRebdDPcxy
 * Max-Forwards: 70
 * Supported: outbound
 * Accept: application/sdp
 * Accept: text/plain
 * Accept: application/vnd.gsma.rcs-ft-http+xml
 * Contact: <sip:101@192.168.10.105:50405;transport=tcp>;+sip.instance="<urn:uuid:9548ce0d-4303-475b-bbd4-ca6559d3f960>"
 * Expires: 3600
 * User-Agent: Linphone/3.9.0 (belle-sip/1.4.2)
 * Content-Length: 0
 */
export class RegisterRequest extends Request {

}
