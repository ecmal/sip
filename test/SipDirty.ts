import * as util from 'node/util';
import * as net from 'node/net';
import * as dns from 'node/dns';
import assert from 'node/assert';
import * as dgram from 'node/dgram';
import * as HTTP from 'node/http';

import * as querystring from 'node/querystring';

import {WsServer} from 'http/ws/server';
import {WsConnection} from "http/ws/connection";

//import * as WS from 'node/ws';

export interface Body {
    version? :string;
    status?  :string|number;
    reason?  :string;
    headers? :any;
    method?  :string;
    uri?     :any;
    content? :string
}

export interface CSeq {
    seq     :number,
    method  :string
}

export interface URI{
    schema?     :string;
    user?       :string;
    password?   :string;
    host?       :string;
    port?       :number;
    params?     :any;
    headers?    :any;
}

export interface Transport {
    open(t:any,e:any,d:any):any;
    destroy():void
}

export interface TransportFactory extends Transport{
    send(t:any,m:any):void;
    stop():void;
}

export interface Transaction {
    send?    : any;
    message? : any
}

export abstract class SIP {
    send(m:Body, callback?:Function):void {};
    stop():void{}
}



class Sip extends SIP {

    private static compactForm:Object = {
        i: 'call-id',
        m: 'contact',
        e: 'contact-encoding',
        l: 'content-length',
        c: 'content-type',
        f: 'from',
        s: 'subject',
        k: 'supported',
        t: 'to',
        v: 'via'
    };
    private static parsers:any = {
        'to': Sip.parseAOR,
        'from': Sip.parseAOR,
        'contact': (v, h)=> {
            if(v == '*')
                return v;
            else
                return Sip.parseMultiHeader(Sip.parseAOR, v, h);
        },
        'route': Sip.parseMultiHeader.bind(0, Sip.parseAOR),
        'record-route': Sip.parseMultiHeader.bind(0, Sip.parseAOR),
        'cseq': Sip.parseCSeq,
        'content-length': (v) =>{ return +v.s; },
        'via': Sip.parseMultiHeader.bind(0, Sip.parseVia),
        'www-authenticate': Sip.parseMultiHeader.bind(0, Sip.parseAuthHeader),
        'proxy-authenticate': Sip.parseMultiHeader.bind(0, Sip.parseAuthHeader),
        'authorization': Sip.parseMultiHeader.bind(0,Sip.parseAuthHeader),
        'proxy-authorization': Sip.parseMultiHeader.bind(0, Sip.parseAuthHeader),
        'authentication-info': Sip.parseAuthenticationInfoHeader,
        'refer-to': Sip.parseAOR
    };

    public static debug(e:any):void {
        if(e.stack) {
            util.debug(e + '\n' + e.stack);
        }
        else{
            util.debug(util.inspect(e));
        }
    }

    private static parseResponse(rs:string, m:any):Body {
        var r = rs.match(/^SIP\/(\d+\.\d+)\s+(\d+)\s*(.*)\s*$/);

        if(r) {
            m.version = r[1];
            m.status = +r[2];
            m.reason = r[3];

            return m;
        }
    }
    private static parseRequest(rq:string, m:Body):Body {
        var r = rq.match(/^([\w\-.!%*_+`'~]+)\s([^\s]+)\sSIP\s*\/\s*(\d+\.\d+)/);

        if(r) {
            m.method = querystring.unescape(r[1]);
            m.uri = r[2];
            m.version = r[3];

            return m;
        }
    }

    private static applyRegex(regex:any, data:any):any {
        regex.lastIndex = data.i;
        var r = regex.exec(data.s);

        if(r && (r.index === data.i)) {
            data.i = regex.lastIndex;
            return r;
        }
    }

    private static parseParams(data:any, hdr:any):any {
        hdr.params = hdr.params || {};

        var re = /\s*;\s*([\w\-.!%*_+`'~]+)(?:\s*=\s*([\w\-.!%*_+`'~]+|"[^"\\]*(\\.[^"\\]*)*"))?/g;

        for(var r = Sip.applyRegex(re, data); r; r = Sip.applyRegex(re, data)) {
            //hdr.params[r[1].toLowerCase()] = r[2];
            hdr.params[r[1]] = r[2];
        }

        return hdr;
    }

    private static parseMultiHeader(parser:Function, d:any, h:any[]):any[] {
        h = h || [];

        var re = /\s*,\s*/g;
        do {
            h.push(parser(d));
        } while(d.i < d.s.length && Sip.applyRegex(re, d));

        return h;
    }

    private static parseGenericHeader(d:any, h:any):string {
        return h ? h + ',' + d.s : d.s;
    }

    private static parseAOR(data:any):any {
        var r = Sip.applyRegex(/((?:[\w\-.!%*_+`'~]+)(?:\s+[\w\-.!%*_+`'~]+)*|"[^"\\]*(?:\\.[^"\\]*)*")?\s*\<\s*([^>]*)\s*\>|((?:[^\s@"<]@)?[^\s;]+)/g, data);

        return Sip.parseParams(data, {name: r[1], uri: r[2] || r[3]});
    }

    private static parseVia(data:any):any {
        var r = Sip.applyRegex(/SIP\s*\/\s*(\d+\.\d+)\s*\/\s*([\S]+)\s+([^\s;:]+)(?:\s*:\s*(\d+))?/g, data);
        return Sip.parseParams(data, {version: r[1], protocol: r[2], host: r[3], port: r[4] && +r[4]});
    }

    private static parseCSeq(d:any):CSeq {
        var r = /(\d+)\s*([\S]+)/.exec(d.s);
        return { seq: +r[1], method: querystring.unescape(r[2]) };
    }

    private static parseAuthHeader(d:any):any {
        var r1 = Sip.applyRegex(/([^\s]*)\s+/g, d);
        var a = {scheme: r1[1]};

        var r2 = Sip.applyRegex(/([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d);
        a[r2[1]]=r2[2];

        while(r2 = Sip.applyRegex(/,\s*([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d)) {
            a[r2[1]]=r2[2];
        }

        return a;
    }

    private static parseAuthenticationInfoHeader(d:any):any {
        var a = {};
        var r = Sip.applyRegex(/([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d);
        a[r[1]]=r[2];

        while(r = Sip.applyRegex(/,\s*([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d)) {
            a[r[1]]=r[2];
        }
        return a;
    }

    private static stringifyVersion(v:string):string {
        return v || '2.0';
    }

    private static stringifyParams(params:any):string {
        var s = '';
        for(var n in params) {
            s += ';'+n+(params[n]?'='+params[n]:'');
        }

        return s;
    }

    private static clone(o:any, deep:any = undefined):any {
        if(typeof o === 'object') {
            var r = Array.isArray(o) ? [] : {};
            Object.keys(o).forEach((k)=> { r[k] = deep ? Sip.clone(o[k], deep): o[k]; });
            return r;
        }

        return o;
    }

    private static makeResponse(rq:Body, status:number|string, reason?:string|any):Body {
        return {
            status: status,
            reason: reason || '',
            version: rq.version,
            headers: {
                via: rq.headers.via,
                to: rq.headers.to,
                from: rq.headers.from,
                'call-id': rq.headers['call-id'],
                cseq: rq.headers.cseq
            }
        };
    }

    private static makeSM():any {
        var state:any;

        return {
            enter: function(newstate) {
                if(state && state.leave)
                    state.leave();

                state = newstate;
                Array.prototype.shift.apply(arguments);
                if(state.enter)
                    state.enter.apply(this, arguments);
            },
            signal: function(s) {
                if(state && state[s])
                    state[Array.prototype.shift.apply(arguments)].apply(state, arguments);
            }
        };
    }

    private static generateBranch():string {
        return ['z9hG4bK',Math.round(Math.random()*1000000)].join('');
    }

    private static parseUri(s:string):URI {
        if(typeof s === 'object')
            return s;
        var re = /^([^:]+):(?:([^\s>:@]+)(?::([^\s@>]+))?@)?([\w\-\.]+)(?::(\d+))?((?:;[^\s=\?>;]+(?:=[^\s?\;]+)?)*)(\?([^\s&=>]+=[^\s&=>]+)(&[^\s&=>]+=[^\s&=>]+)*)?$/;

        var r = re.exec(s);

        if(r) {
            return {
                schema: r[1],
                user: r[2],
                password: r[3],
                host: r[4],
                port: +r[5],
                params: (r[6].match(/([^;=]+)(=([^;=]+))?/g) || [])
                    .map((s) =>{ return s.split('='); })
                    .reduce((params, x) =>{ params[x[0]]=x[1] || null; return params;}, {}),
                headers: ((r[7] || '').match(/[^&=]+=[^&=]+/g) || [])
                    .map((s)=>{ return s.split('=') })
                    .reduce((params, x) =>{ params[x[0]]=x[1]; return params; }, {})
            }
        }
    }

    private static resolve(uri:URI, action:Function):any {
        if(net.isIP(uri.host))
            return action([{protocol: uri.params.transport || 'UDP', address: uri.host, port: uri.port || 5060}]);

        var protocols:any = uri.params.protocol ? [uri.params.protocol] : ['UDP', 'TCP'];
        dns.resolve4(uri.host, function(err, address) {
            address = (address || []).map(function(x) { return protocols.map(function(p) { return { protocol: p, address: x, port: uri.port || 5060};});})
                .reduce(function(arr,v) { return arr.concat(v); }, []);
            action(address);
        });
        /* // TODO re-enable this stuff
         function resolve46(host, cb) {
         dns.resolve4(host, function(e4, a4) {
         dns.resolve6(host, function(e6, a6) {
         if((a4 || a6).length)
         cb(null, a4.concat(a6));
         else
         cb(e4 || e6, []);
         });
         });
         }

         if(uri.port) {
         var protocols = uri.params.protocol ? [uri.params.protocol] : ['UDP', 'TCP'];

         resolve46(uri.host, function(err, address4) {
         address = (address || []).map(function(x) { return protocols.map(function(p) { return { protocol: p, address: x, port: uri.port || 5060};});})
         .reduce(function(arr,v) { return arr.concat(v); }, []);
         action(address);
         });
         }
         else {
         var protocols = uri.params.protocol ? [uri.params.protocol] : ['tcp', 'udp'];

         var n = protocols.length;
         var addresses = [];

         protocols.forEach(function(proto) {
         dns.resolveSrv('_sip._'+proto+'.'+uri.host, function(e, r) {
         --n;
         if(Array.isArray(r)) {
         n += r.length;
         r.forEach(function(srv) {
         resolve46(srv.name, function(e, r) {
         addresses = addresses.concat((r||[]).map(function(a) { return {protocol: proto, address: a, port: srv.port};}));

         if((--n)===0) // all outstanding requests has completed
         action(addresses);
         });
         });
         }
         else if(0 === n) {
         // all srv requests failed
         resolve46(uri.host, function(err, address) {
         address = (address || []).map(function(x) { return protocols.map(function(p) { return { protocol: p, address: x, port: uri.port || 5060};});})
         .reduce(function(arr,v) { return arr.concat(v); }, []);
         action(address);
         });
         }
         })
         });
         }
         */
    }

    private static createServerTransaction(transport:Function|any, cleanup:any):Transaction {
        var sm = Sip.makeSM();
        var rs;

        var trying = {
            message: function() { if(rs) transport(rs); },
            send: function(m) {
                rs = m;
                transport(m);
                if(m.status >= 200) sm.enter(completed);
            }
        };

        var completed = {
            message: function() { transport(rs); },
            enter: function() { setTimeout(cleanup, 32000); }
        };

        sm.enter(trying);

        return {send: sm.signal.bind(sm, 'send'), message: sm.signal.bind(sm, 'message')};
    }

    private static createInviteServerTransaction(transport:Function, cleanup:any):Transaction {
        var sm = Sip.makeSM();
        var rs;

        var proceeding = {
            message: function() {
                if(rs) transport(rs);
            },
            send: function(message) {
                rs = message;

                if(message.status >= 300)
                    sm.enter(completed);
                else if(message.status >= 200)
                    sm.enter(accepted);

                transport(rs);
            }
        }

        var g, h;
        var completed = {
            enter: function () {
                g = setTimeout(function retry(t) {
                    setTimeout(retry, t*2, t*2);
                    transport(rs)
                }, 500, 500);
                h = setTimeout(sm.enter.bind(sm, terminated), 32000);
            },
            leave: function() {
                clearTimeout(g);
                clearTimeout(h);
            },
            message: function(m) {
                if(m.method === 'ACK')
                    sm.enter(confirmed);
                else
                    transport(rs);
            }
        }

        var confirmed = {enter: function() { setTimeout(sm.enter.bind(sm, terminated), 5000);} };

        var accepted = {
            enter: function() { setTimeout(sm.enter.bind(sm, terminated), 32000);},
            send: function(m) {
                rs = m;
                transport(rs);
            }
        };

        var terminated = {enter: cleanup};

        sm.enter(proceeding);

        return {send: sm.signal.bind(sm, 'send'), message: sm.signal.bind(sm,'message')};
    }

    private static createInviteClientTransaction(rq:any, transport:Function|any, tu:Function, cleanup:any):Transaction {
        var sm = Sip.makeSM();

        var a, b;
        var calling = {
            enter: function() {
                transport(rq);

                if(!transport.reliable) {
                    a = setTimeout(function resend(t) {
                        transport(rq);
                        a = setTimeout(resend, t*2, t*2);
                    }, 500, 500);
                }

                b = setTimeout(function() {
                    tu(Sip.makeResponse(rq, 408, 'Request timeout'));
                    sm.enter(terminated);
                }, 2000); // Yes, very short.
            },
            leave: function() {
                clearTimeout(a);
                clearTimeout(b);
            },
            message: function(message) {
                tu(message);

                if(message.status < 200)
                    sm.enter(proceeding);
                else if(message.status < 300)
                    sm.enter(accepted, message);
                else
                    sm.enter(completed, message);
            }
        };

        var proceeding = {
            message: function(message) {
                tu(message);

                if(message.status >= 300)
                    sm.enter(completed, message);
                else if(message.status >= 200)
                    sm.enter(accepted, message);
            }
        };

        var ack:any = {
            method: 'ACK',
            uri: rq.uri,
            headers: {
                from: rq.headers.from,
                cseq: {method: 'ACK', seq: rq.headers.cseq.seq},
                'call-id': rq.headers['call-id'],
                via: [rq.headers.via[0]]
            }
        };

        var completed = {
            enter: function(rs) {
                ack.headers.to=rs.headers.to;
                transport(ack);
                setTimeout(sm.enter.bind(sm, terminated), 32000);
            },
            message: function(message, remote) {
                if(remote) transport(ack);  // we don't want to ack internally generated messages
            }
        };

        var accepted = {
            enter: function(rs) {
                ack.headers.to=rs.headers.to;
                transport(ack);
                setTimeout(function() { sm.enter(terminated); }, 32000);
            },
            message: function(m) {
                if(m.status >= 200 && m.status <= 299)
                    tu(m);
            }
        };

        var terminated = {enter: cleanup};

        sm.enter(calling);

        return {message: sm.signal.bind(sm, 'message')};
    }

    private static createClientTransaction(rq:any, transport:Function|any, tu:any, cleanup:any):Transaction {
        if(rq.method == 'INVITE'){
            throw new Error('not invite');
        }

        var sm = Sip.makeSM();

        var e, f;
        var trying = {
            enter: function() {
                transport(rq);
                if(!transport.reliable)
                    e = setTimeout(function() { sm.signal('timerE', 500); }, 500);
                f = setTimeout(function() { sm.signal('timerF'); }, 32000);
            },
            leave: function() {
                clearTimeout(e);
                clearTimeout(f);
            },
            message: function(message, remote) {
                if(message.status >= 200)
                    sm.enter(completed);
                else
                    sm.enter(proceeding);
                tu(message);	// XXX this used to be before sm.enter()
            },
            timerE: function(t) {
                transport(rq);
                e = setTimeout(function() { sm.signal('timerE', t*2); }, t*2);
            },
            timerF: function() {
                tu(Sip.makeResponse(rq, 503,undefined));
                sm.enter(terminated);
            }
        };

        var proceeding = { // XXX this used to be proceeding = trying;
            message: function(message, remote) {
                if(message.status >= 200)
                    sm.enter(completed);
                tu(message);
            }
        };

        var completed = {enter: function () { setTimeout(function() { sm.enter(terminated); }, 5000); } };

        var terminated = {enter: cleanup};

        sm.enter(trying);

        return {message: sm.signal.bind(sm, 'message')};
    }

    private static makeTransactionId(m:Body):string {
        if(m.method === 'ACK')
            return ['INVITE', m.headers['call-id'], m.headers.via[0].params.branch].join();
        return [m.headers.cseq.method, m.headers['call-id'], m.headers.via[0].params.branch].join();
    }

    private static makeTransactionLayer(options:any, transport:Transport):any {
        var server_transactions = Object.create(null);
        var client_transactions = Object.create(null);

        return {
            createServerTransaction: function(rq, remote) {
                var id = Sip.makeTransactionId(rq);
                var cn = transport.open(remote, function() {}, true);
                return server_transactions[id] = (rq.method === 'INVITE' ? Sip.createInviteServerTransaction : Sip.createServerTransaction)(
                    cn.send.bind(cn),
                    function() {
                        delete server_transactions[id];
                        cn.release();
                    });
            },
            createClientTransaction: function(rq:Body, callback:Function) {
                if(rq.method !== 'CANCEL') {
                    if(rq.headers.via)
                        rq.headers.via.unshift({params:{}});
                    else
                        rq.headers.via = [{params:{}}];
                    rq.headers.via[0].params.branch = Sip.generateBranch();
                }

                var transaction = rq.method === 'INVITE' ? Sip.createInviteClientTransaction : Sip.createClientTransaction;

                var hop = Sip.parseUri(rq.uri);

                if(rq.headers.route) {
                    if(typeof rq.headers.route === 'string')
                        rq.headers.route = Sip.parsers.route({s: rq.headers.route, i:0});

                    hop = Sip.parseUri(rq.headers.route[0].uri);
                    if(hop.params.lr === undefined ) {
                        rq.headers.route.shift();
                        rq.headers.route.push({uri: rq.uri});
                        rq.uri = hop;
                    }
                }

                Sip.resolve(hop, function(address) {
                    var onresponse;

                    function next() {
                        onresponse = searching;
                        if(address.length > 0) {
                            try {

                                var id = Sip.makeTransactionId(rq);

                                var cn = transport.open(address.shift(), function(e) { client_transactions[id].message(Sip.makeResponse(rq, 503,undefined));},undefined);
                                var send = cn.send.bind(cn);
                                send.reliable = cn.local.protocol.toUpperCase() !== 'UDP';

                                client_transactions[id] = transaction(rq, send, onresponse, function() {
                                    delete client_transactions[id];
                                    cn.release();
                                });
                            }
                            catch(e) {
                                var errorLog = (options.logger && options.logger.error) || function(e) { console.error(e); };
                                errorLog("Caught exception: "+e.stack);
                                onresponse(Sip.makeResponse(rq, 503,undefined));
                            }
                        }
                        else
                            onresponse(Sip.makeResponse(rq, 404,undefined));
                    }

                    function searching(rs) {
                        if(rs.status === 503)
                            return next();
                        else if(rs.status > 100)
                            onresponse = callback;

                        callback(rs);
                    }

                    next();
                });
            },
            getServer: function(m) {
                return server_transactions[Sip.makeTransactionId(m)];
            },
            getClient: function(m) {
                return client_transactions[Sip.makeTransactionId(m)];
            }
        };
    }

    private static parse(data:any):Body|any {
        data = data.split(/\r\n(?![ \t])/);

        if(data[0] === '')
            return;

        var m:Body = {};

        if(!(Sip.parseResponse(data[0], m) || Sip.parseRequest(data[0], m)))
            return;

        m.headers = {};

        for(var i = 1; i < data.length; ++i) {
            var r = data[i].match(/^([\S]*?)\s*:\s*([\s\S]*)$/);
            if(!r) {
                return;
            }

            var name = querystring.unescape(r[1]).toLowerCase();
            name = Sip.compactForm[name] || name;

            m.headers[name] = (Sip.parsers[name] || Sip.parseGenericHeader)({s:r[2], i:0}, m.headers[name]);
        }

        return m;
    }

    private compactForm:Object;
    private parsers:Object;
    private stringifiers:Object;



    constructor(){
        super();
        this.compactForm = Sip.compactForm;
        this.parsers = Sip.parsers;
        this.stringifiers = {
            via: (h)=> {
                return h.map((via)=> {
                    return 'Via: SIP/'+Sip.stringifyVersion(via.version)+'/'+via.protocol.toUpperCase()+' '+via.host+(via.port?':'+via.port:'')+Sip.stringifyParams(via.params)+'\r\n';
                }).join('');
            },
            to: (h) =>{
                return 'To: '+this.stringifyAOR(h) + '\r\n';
            },
            from: (h)=> {
                return 'From: '+this.stringifyAOR(h)+'\r\n';
            },
            contact: (h)=> {
                return 'Contact: '+ ((h !== '*' && h.length) ? h.map(r=>this.stringifyAOR(r)).join(', ') : '*') + '\r\n';
            },
            route: (h) =>{

                return h.length ? 'Route: ' + h.map(r=>this.stringifyAOR(r)).join(', ') + '\r\n' : '';
            },
            'record-route': (h) =>{
                return h.length ? 'Record-Route: ' + h.map(r=>this.stringifyAOR(r)).join(', ') + '\r\n' : '';
            },
            cseq: (cseq)=> {
                return 'CSeq: '+cseq.seq+' '+cseq.method+'\r\n';
            },
            'www-authenticate': (h) =>{
                return h.map((x) =>{ return 'WWW-Authenticate: '+this.stringifyAuthHeader(x)+'\r\n'; }).join('');
            },
            'proxy-authenticate': (h) =>{
                return h.map((x) =>{ return 'Proxy-Authenticate: '+this.stringifyAuthHeader(x)+'\r\n'; }).join('');
            },
            'authorization': (h) =>{
                return h.map((x) =>{ return 'Authorization: ' + this.stringifyAuthHeader(x) + '\r\n'}).join('');
            },
            'proxy-authorization': (h) =>{
                return h.map((x) =>{ return 'Proxy-Authorization: ' + this.stringifyAuthHeader(x) + '\r\n'}).join('');;
            },
            'authentication-info': (h) =>{
                return 'Authentication-Info: ' + this.stringifyAuthHeader(h) + '\r\n';
            },
            'refer-to': (h)=> { return 'Refer-To: ' + this.stringifyAOR(h) + '\r\n'; }
        }
    }

    public parseAOR(data:any):any {
        var r = Sip.parseAOR({s:data, i:0});
        if (r&&r.uri) r.uri=this.parseUri(r.uri);
        return r;
    }

    public parseUri(s:string):URI {
        return Sip.parseUri(s);
    }

    public stringifyUri(uri:any):string {
        if(typeof uri === 'string')
            return uri;

        var s:string = (uri.schema || 'sip') + ':';

        if(uri.user) {
            if(uri.password)
                s += uri.user + ':' + uri.password + '@';
            else
                s += uri.user + '@';
        }

        s += uri.host;

        if(uri.port)
            s += ':' + uri.port;

        if(uri.params)
            s += Object.keys(uri.params).map((x)=>{return ';'+x+(uri.params[x] ? '='+uri.params[x] : '');}).join('');

        if(uri.headers) {
            var h = Object.keys(uri.headers).map((x)=>{return x+'='+uri.headers[x];}).join('&');
            if(h.length)
                s += '?' + h;
        }
        return s;
    }

    public stringifyAOR(aor:any):string {
        if (!aor) return '';
        return (aor.name || '') + '<' + this.stringifyUri(aor.uri) + '>'+Sip.stringifyParams(aor.params);
    }

    public stringifyAuthHeader(a:any):string {
        var s:any[] = [];

        for(var n in a) {
            if(n !== 'scheme' && a[n] !== undefined) {
                s.push(n + '=' + a[n]);
            }
        }

        return a.scheme ? a.scheme + ' ' + s.join(',') : s.join(',');
    }

    public stringify(m:Body):string {
        var s;
        if(m.status) {
            s = 'SIP/' + Sip.stringifyVersion(m.version) + ' ' + m.status + ' ' + m.reason + '\r\n';
        }
        else {
            s = m.method + ' ' + this.stringifyUri(m.uri) + ' SIP/' + Sip.stringifyVersion(m.version) + '\r\n';
        }

        for(var n in m.headers) {
            if(typeof m.headers[n] === 'string' || !this.stringifiers[n])
                s += n + ': ' + m.headers[n] + '\r\n';
            else
                s += this.stringifiers[n](m.headers[n], n);
        }

        s += '\r\n';

        if(m.content)
            s += m.content;

        return s;
    }

    public makeResponse(rq:Body, status:number|string, reason?:string):Body {
        return Sip.makeResponse(rq,status,reason);
    }

    public copyMessage(msg:Body, deep?:any):Body {
        if(deep) return Sip.clone(msg, true);

        var r = {
            uri: deep ? Sip.clone(msg.uri, deep) : msg.uri,
            method: msg.method,
            status: msg.status,
            reason: msg.reason,
            headers: Sip.clone(msg.headers, deep),
            content: msg.content
        };

        // always copy via array
        r.headers.via = Sip.clone(msg.headers.via);

        return r;
    }

    public makeStreamParser(onMessage:Function):Function {
        var m:Body;
        var r = '';

        function headers(data) {
            r += data;
            var a = r.match(/^\s*([\S\s]*?)\r\n\r\n([\S\s]*)$/);

            if(a) {
                r = a[2];
                m = Sip.parse(a[1]);

                if(m && m.headers['content-length'] !== undefined) {
                    state = content;
                    content('');
                }
            }
        }

        function content(data) {
            r += data;

            if(r.length >= m.headers['content-length']) {
                m.content = r.substring(0, m.headers['content-length']);

                onMessage(m);

                var s = r.substring(m.headers['content-length']);
                state = headers;
                r = '';
                headers(s);
            }
        }

        var state=headers;

        return function(data) { state(data); }
    }

    public parse(s:any):Body|any{
        var r = s.toString('ascii').split('\r\n\r\n');
        if (!r) return false;
        var m = Sip.parse(r[0]);
        if (!m) return false;

        if(m.headers['content-length']) {
            var c = Math.max(0, Math.min(m.headers['content-length'], r[1].length));
            m.content = r[1].substring(0, c);
        }
        else {
            m.content = r[1];
        }

        return m;
    }

    private makeWsTransport(options:any, callback:Function):Transport {
        var connections = Object.create(null);
        var self = this;
        function init(ws:any,remote) {
            var stream = ws._stream;
            var id = [remote.address, remote.port].join(),
                local = {protocol: 'WS', address: Sip.formatAddress(stream.address().address), port: stream.address().port},
                pending = [],
                refs = 0;

            function send(m) {
                if (typeof m=="object") {
                    if(m.method) {
                        m.headers.via[0].host = local.address;
                        m.headers.via[0].port = options.port;
                        m.headers.via[0].protocol = local.protocol;
                    }
                    options.logger && options.logger.send && options.logger.send(m);
                    m = self.stringify(m);
                }
                try {
                    ws.send(m);
                }
                catch(e) {
                    process.nextTick(stream.emit.bind(stream, 'error', e));
                }
            }


            var parser = this.makeStreamParser(function(m) {
                if(m.method) m.headers.via[0].params.received = remote.address;
                callback(m, remote);
            });
            ws.onmessage = function(event) { return parser(event.data); }
            ws.onclose = function() { delete connections[id]; }

            stream.on('timeout',  function() { if(refs === 0) ws.close(); });

            stream.setTimeout(60000);

            connections[id] = function(onError) {
                ++refs;
                if (typeof onError == 'function') ws.onerror = onError;

                return {
                    release	: function() {
                        if (onError) ws.onerror = null;
                        if(--refs <= 0) ws.close();
                    },
                    send	: send,
                    local	: local
                }
            };

            return connections[id];
        }

        var http = HTTP.createServer();
        http.on('error', function(err) {
            console.error('sip.js HTTP server: '+err);
        });
        var ws:WsServer = WsServer.inject(http,'sip');
        ws.on('connection',(connection:WsConnection)=>{
            //init(ws,{protocol: 'WS', address: stream.remoteAddress, port: stream.remotePort});
        });

        http.listen(options.port || 5060, options.address);

        return {
            open: function(remote, error, dontopen) {
                var id = [remote.address, remote.port].join();
                if (id in connections) return connections[id](error);
                // We can't make outbound websocket connections yet
                return null;
            },
            destroy: function() { http.close(); }
        }
    }
    private static formatAddress(add:string){
        return add.replace(/[^\d]*(\d+\.\d+\.\d+\.\d+).*/,'$1')
    }
    private makeTcpTransport(options:any, callback:Function):Transport {
        var connections = Object.create(null);
        var self = this;
        function init(stream, remote) {
            var id = [remote.address, remote.port].join(),
                local:any = {protocol: 'TCP'},
                pending = [],
                refs = 0;

            function send(m) {
                if (stream.readyState === 'opening') return pending.push(m);
                if (!local.address) {
                    local.address = Sip.formatAddress(stream.address().address);
                    local.port = stream.address().port;
                }

                if (typeof m=="object") {
                    if(m.method) {
                        m.headers.via[0].host = local.address;
                        m.headers.via[0].port = options.port;
                        m.headers.via[0].protocol = local.protocol;
                    }
                    options.logger && options.logger.send && options.logger.send(m);
                    m = new Buffer(self.stringify(m), 'ascii');	// TODO: ascii conversions everywhere - speed?
                }
                try {
                    //console.log("TCP SEND: "+m.toString());
                    stream.write(m, 'ascii');
                } catch(e) {
                    process.nextTick(stream.emit.bind(stream, 'error', e));
                }
            }

            stream.setEncoding('ascii');

            var parse = self.makeStreamParser(function(m) {
                if(m.method) m.headers.via[0].params.received = remote.address;
                callback(m, remote);
            });
            stream.on('data', function(data) { /*console.log("TCP RECV: "+data);*/ parse(data); });

            stream.on('close',    function() { delete connections[id]; });
            stream.on('error',    function() {});
            stream.on('end',      function() { if(refs === 0) stream.end(); });
            stream.on('timeout',  function() { if(refs === 0) stream.end(); });
            stream.on('connect',  function() { pending.splice(0).forEach(send); });
            stream.setTimeout(60000);

            connections[id] = function(onError) {
                ++refs;
                if(onError) stream.on('error', onError);

                return {
                    release: function() {
                        if(onError) stream.removeListener('error', onError);

                        if(--refs === 0) {
                            if(stream.readyState === 'writeOnly')
                                stream.end();
                            else
                                setTimeout(()=>{},60000);
                        }
                    },
                    send: send,
                    local: local
                }
            };

            return connections[id];
        }

        var server = net.createServer(function(stream) {
            init(stream, {protocol: 'TCP', address: Sip.formatAddress(stream.remoteAddress), port: stream.remotePort});
        });

        server.listen(options.port || 5060, options.address);

        var transport:Transport = {
            open: function(remote, error, dontopen) {
                var id = [remote.address, remote.port].join();
                if (id in connections) return connections[id](error);
                if (dontopen) return null;
                return init(net.createConnection(remote.port, remote.address), remote)(error);
            },
            destroy: function() { server.close(); }
        }
        return transport;
    }

    private makeUdpTransport(options:any, callback:Function):Transport {

        var socket:any = dgram.createSocket(net.isIPv6(options.address) ? 'udp6' : 'udp4', (data, rinfo) =>{
            var msg = this.parse(data);
            if (!msg) return;

            if(msg.method) {
                msg.headers.via[0].params.received = rinfo.address;
                if(msg.headers.via[0].params.hasOwnProperty('rport'))
                    msg.headers.via[0].params.rport = rinfo.port;
            }
            callback(msg, {protocol: 'UDP', address: rinfo.address, port: rinfo.port});
        });
        socket.on('error', function() {});
        if (socket.setSndBuf) {
            // I've added a bunch of socket options to my build of node.js, sorry
            socket.setSndBuf(1024*1024);
            socket.setRcvBuf(1024*1024);
        }

        try {
            socket.bind(options.port || 5060, options.address);
        } catch (e) {
            return null;
        }

        var local = {protocol: 'UDP', address: Sip.formatAddress(socket.address().address), port: socket.address().port};
        return {
            open: (remote, error) =>{
                function cb(err) { if (err) error(err); }
                return {
                    send:(m)=>{
                        if (!socket) return;
                        if (typeof m=="object") {
                            if(m.method) {
                                m.headers.via[0].host = local.address;
                                m.headers.via[0].port = options.port;
                                m.headers.via[0].protocol = local.protocol;
                            }
                            options.logger && options.logger.send && options.logger.send(m);
                            m = new Buffer(this.stringify(m), 'ascii');
                        }
                        //console.log("UDP SEND: "+m.toString());
                        socket.send(m, 0, m.length, remote.port, remote.address, cb);
                    },
                    release: ()=>{},
                    local: local,
                }
            },
            destroy: function() { if (socket) socket.close(); socket=false; },
        };
    }

    public makeTransport(options:any, callback:Function):TransportFactory|any {
        var protocols:any = {};

        var callbackAndLog = callback;
        if(options.logger && options.logger.recv) {
            callbackAndLog = function(m, remote) {
                options.logger.recv(m, remote);
                callback(m, remote);
            }
        }

        if (!options.port) options.port = 5060;

        if(options.udp === undefined || options.udp) {
            if (!(protocols.UDP = this.makeUdpTransport(options, callbackAndLog)))
                return null;
        }
        if (!options.ws && (options.tcp === undefined || options.tcp))
            protocols.TCP = this.makeTcpTransport(options, callbackAndLog);
        if(options.ws)
            protocols.WS = this.makeWsTransport(options, callbackAndLog);

        return {
            open: function(target, error) {
                return protocols[target.protocol.toUpperCase()].open(target, error);
            },
            send: function(target, message) {
                var cn = this.open(target);
                cn.send(message);
                cn.release();
            },
            destroy: function() {
                Object.keys(protocols).forEach(function(key) { protocols[key].destroy(); });
            },
        };
    }

    public resolve(uri:URI, action:Function):any {
        return Sip.resolve(uri,action);
    }

    public generateBranch():string {
        return Sip.generateBranch();
    }

    public makeTransactionLayer(options:any, transport:Transport):any {
        return Sip.makeTransactionLayer(options,transport);
    }

    public create(options:any, callback:Function):any {
        var self = this;
        var transport = this.makeTransport(options, (m,remote)=> {
            try {
                var t = m.method ? transaction.getServer(m) : transaction.getClient(m);

                if(!t) {
                    if(m.method && m.method !== 'ACK') {
                        var t = transaction.createServerTransaction(m,remote);
                        try {
                            callback(m,remote);
                        } catch(e) {
                            t.send(this.makeResponse(m, '500', 'Internal Server Error'));
                            throw e;
                        }
                    }
                    else if(m.method === 'ACK') {
                        callback(m,remote);
                    }
                }
                else {
                    t.message && t.message(m, remote);
                }
            }
            catch(e) {
                var errorLog = (options.logger && options.logger.error) || function(e) { console.error(e); };
                errorLog("Caught exception: "+e.stack);
            }
        });
        if (!transport) return false;

        var transaction = Sip.makeTransactionLayer(options, transport);

        return {
            address: options.address || '0.0.0.0',
            port: options.port || 5060,
            send: (m, callback)=> {
                if(m.method === undefined) {
                    var t = transaction.getServer(m);
                    t && t.send && t.send(m);
                }
                else {
                    if(m.method === 'ACK') {
                        if(!m.headers.via) m.headers.via = [];

                        m.headers.via.unshift({params: {branch: Sip.generateBranch()}});

                        Sip.resolve(Sip.parseUri(m.uri), (address)=> {
                            if(address.length === 0) {
                                console.error(new Error("ACK: couldn't resove" + this.stringifyUri(m.uri)));
                                return;
                            }
                            transport.send(m, address[0]);
                        });
                    }
                    else {
                        return transaction.createClientTransaction(m, callback || function() {});
                    }
                }
            },
            destroy: transport.destroy.bind(transport)
        }
    }

    public start(options:any, callback:Function) {
        var r = this.create(options, callback);
        if (!r) return false;

        this.send = r.send;
        this.stop = r.destroy;

        return r;
    }

}

export default Sip;
