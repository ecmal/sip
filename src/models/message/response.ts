import {Message} from "../message";
export class Response extends Message {
    /*
     SIP/2.0 401 Unauthorized
     Call-ID: eRebdDPcxy
     From:  "101" <sip:101@win.freedomdebtrelief.com>;tag=7Lq7OgaDW
     To:  "101" <sip:101@win.freedomdebtrelief.com>;tag=7Lq7OgaDW
     CSeq: 20 REGISTER
     Via: SIP/2.0/TCP 192.168.10.105:50405;alias;branch=z9hG4bK.~3I3SLROQ;rport
     x-Error-Details: No auth header
     WWW-Authenticate: Digest realm="win.freedomdebtrelief.com",nonce="abdad2a006c1db119503c31f5ae66b9c",qop="auth",algorithm=MD5,stale=false,opaque="0000001d"
     Content-Length: 0
     */
    public responseCode:string;
    public description:string;
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
            `${this.version} ${this.responseCode} ${this.description}`,
            ...headers(),
            '',
            ''
        ].join('\r\n');
    }
}
