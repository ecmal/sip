/**
 * Created by Sergey on 2/5/16.
 */
import Sip from "./SipDirty";
import * as util from "node/util";
import {Body} from "./SipDirty";

var sip = new Sip();
var contexts = {};

function makeContextId(msg):string {
    var via = msg.headers.via[0];
    return [via.params.branch, via.protocol, via.host, via.port, msg.headers['call-id'], msg.headers.cseq.seq].toString();
}
function defaultCallback(rs) {
    rs.headers.via.shift();
    proxy.send(rs);
}
function forwardResponse(ctx, rs, callback?) {
    if(+rs.status >= 200) {
        delete contexts[makeContextId(rs)];
    }
    sip.send(<Body>rs);
}
function sendCancel(rq, via) {
    sip.send({
        method: 'CANCEL',
        uri: rq.uri,
        headers: {
            via: [via],
            to: rq.headers.to,
            from: rq.headers.from,
            'call-id': rq.headers['call-id'],
            cseq: {method: 'CANCEL', seq: rq.headers.cseq.seq}
        }
    });
}
function forwardRequest(ctx, rq, callback) {
    sip.send(rq, function(rs, remote) {
        if(+rs.status < 200) {
            var via = rs.headers.via[0];
            ctx.cancellers[rs.headers.via[0].params.branch] = function() { sendCancel(rq, via); };

            if(ctx.cancelled)
                sendCancel(rq, via);
        }
        else {
            delete ctx.cancellers[rs.headers.via[0].params.branch];
        }

        callback(rs, remote);
    });
}
function onRequest(rq, route, remote?) {
    var id = makeContextId(rq);
    contexts[id] = { cancellers: {} };

    try {
        route(sip.copyMessage(rq), remote);
    } catch(e) {
        delete contexts[id];
        throw e;
    }
}

var proxy = {
    send(msg, callback?) {
        var ctx = contexts[makeContextId(msg)];

        if(!ctx) {
            sip.send.apply(sip, arguments);
            return;
        }

        return msg.method ? forwardRequest(ctx, msg, callback || defaultCallback) : forwardResponse(ctx, msg);
    },
    start(options, route) {
        sip.start(options, function(rq) {
            if(rq.method === 'CANCEL') {
                var ctx = contexts[makeContextId(rq)];

                if(ctx) {
                    sip.send(sip.makeResponse(rq, 200));

                    ctx.cancelled = true;
                    if(ctx.cancellers) {
                        Object.keys(ctx.cancellers).forEach(function(c) { ctx.cancellers[c](); });
                    }
                }
                else {
                    sip.send(sip.makeResponse(rq, 481));
                }
            }
            else {
                onRequest(rq, route);
            }
        });
    },
    stop:sip.stop
};

var contacts = {};

proxy.start({
    udp:false,

    tcp:{port:5060,address:'195.168.10.105'},
    logger: {
        recv: function(m) {
            console.info('recv:' + util.inspect(m, null, null));
        },
        send: function(m) {
            console.info('send:' + util.inspect(m, null, null));
        },
        error: function(e) {
            console.error(e.stack|e);
        }
    }
}, function(rq) {
    if(rq.method === 'REGISTER') {
        var user = sip.parseUri(rq.headers.to.uri).user;
        contacts[user] = rq.headers.contact;
        var rs = sip.makeResponse(rq, 200, 'Ok');
        rs.headers.to.tag = Math.floor(Math.random() * 1e6);
        // Notice  _proxy.send_ not sip.send
        proxy.send(rs);
    }
    else {
        var user = sip.parseUri(rq.uri).user;
        if(contacts[user] && Array.isArray(contacts[user]) && contacts[user].length > 0) {
            rq.uri = contacts[user][0].uri;
            proxy.send(sip.makeResponse(rq, 100, 'Trying'));
            proxy.send(rq);
        }
        else {
            proxy.send(sip.makeResponse(rq, 404, 'Not Found'));
        }
    }
});