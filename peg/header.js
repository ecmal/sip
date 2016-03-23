function list (first, rest) {
    return [first].concat(rest);
}
function pairsToObject(pairs){
    if(pairs && pairs.length){
        var value = {};
        pairs.forEach(function(pair){
            var key = pair[0],val = pair[1];
            if(!value[key]){
                value[key]=val
            }else
            if(Array.isArray(val)){
                value[key] = value[key].concat(val)
            }
        });
        return value;
    }
}

if(!options.Models){
    options.Models = Object.create(null);
}
function Model(data){
    Object.defineProperty(this,'class',{
        enumerable:true,
        value:this.constructor.name
    });
    if(data){this.set(data);}
}
Model.prototype.set = function update(data){
    for(var key in data){
        if(typeof data[key]!='undefined'){
            this[key] = data[key];
        }else{
            delete this[key];
        }
    }
    return this;
};
function E(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function M(name,params){
    var Class;
    if(options.Models && options.Models[name]){
        Class = options.Models[name];
    }else{
        Class = options.Models[name] = (function(){
            console.info("WARNING : unknown model '"+name+"'");
            var model;
            eval('model = function '+name+'(data){Model.call(this,data)}');
            E(model,Model);
            return model;
        })()
    }
    return new Class(params);
}




// SDP ---------------------------------------

/** The offset of the NTP time compared to Unix time. */
var NTP_OFFSET = 2208988800;

/** End of line. */
var EOL = "\r\n";

/** The SDP types and the corresponding properties. */
var SDP_TYPES = {
    v: "version"
    , o: "origin"
    , s: "sessionName"
    , i: "sessionDescription"
    , u: "uri"
    , e: "emailAddress"
    , p: "phoneNumber"
    , c: "connection"
    , m: "media"
    , b: "bandwidth"
    , t: "timing"
    , r: "repeat"
    , z: "timezones"
    , k: "encryptionKey"
    , cat: "category"
    , keywds: "keywords"
    , ptime: "packetTime"
    , maxptime: "maximumPacketTime"
    , orient: "orientation"
    , rtp: "rtpmap"
    , "payloads": ""
};

for (var t in SDP_TYPES) {
    if (SDP_TYPES.hasOwnProperty(t)) {
        SDP_TYPES[SDP_TYPES[t]] = t;
    }
}

var aggregateSdpProperties = function(sdpProperties) {
    var sdp = {};
    var obj = sdp;
    for (var i = 0; i < sdpProperties.length; i++) {
        for (var p in sdpProperties[i]) {
            if (sdpProperties[i].hasOwnProperty(p)) {
                if (options.useMediaSections !== false && p == SDP_TYPES["m"]) {
                    obj = sdp;
                }
                if (obj[p]) {
                    if (!obj[p].push) {
                        obj[p] = [obj[p]];
                    }
                    obj[p].push(sdpProperties[i][p]);
                } else {
                    obj[p] = sdpProperties[i][p];
                }
                if (options.useMediaSections !== false && p == SDP_TYPES["m"]) {
                    obj = sdpProperties[i][p];
                }
            }
        }
    }
    return sdp;
};

var aggregateSdp = function(sdpProperties) {
    var sdp = aggregateSdpProperties(sdpProperties);
    // ensure that media is an array
    if (sdp.media && !sdp.media.join) {
        sdp.media = [sdp.media];
    }

    // aggregate payloads in each media section
    if (options.aggregatePayloads !== false) {
        aggregatePayloads(sdp);
    }
    return M('Sdp',sdp);
};

var aggregate = aggregateSdp;

var aggregatePayloads = function(sdp) {
    if (!sdp.media || !sdp.media.length) {
        return sdp;
    }
    for (var i = 0; i < sdp.media.length; i++) {
        var m = sdp.media[i];
        if (!m.payloads) {
            continue;
        }
        var payloads = [];
        for (var j = 0; j < m.payloads.length; j++) {
            var payload = {id: m.payloads[j]};
            aggregatePayloadAttribute(payload, m, "rtp");
            aggregatePayloadAttribute(payload, m, "fmtp");
            payloads[j] = payload;
        }
        if (m.rtp) {
            delete m.rtp;
        }
        if (m.fmtp) {
            delete m.fmtp;
        }
        m.payloads = payloads;
    }
    return sdp;
};

var aggregatePayloadAttribute = function(payload, media, attr) {
    if (media[attr] && !media[attr].push) {
        media[attr] = [media[attr]];
    }
    if (media[attr]) {
        payload[attr] = getPayload(media[attr], payload.id);
    }
    if (payload[attr]) {
        delete payload[attr].payload;
    } else {
        delete payload[attr];
    }
};

var getPayload = function(payloads, id) {
    if (payloads.payload === id) {
        return payloads;
    }
    for (var i = 0; i < payloads.length; i++) {
        if (payloads[i].payload === id) {
            return payloads[i];
        }
    }
    return null;
};

var getOutputOrder = function(order, property) {
    var idx = order.indexOf(property);
    if (idx < 0) {
        idx = order.indexOf(SDP_TYPES[property]);
    }
    if (idx < 0) {
        idx = order.indexOf("*");
    }
    if (idx < 0) {
        idx = order.length;
    }
};

var ordering = function(order) {
    return function(a, b) {
        return getOutputOrder(order, a) - getOutputOrder(order, b);
    };
};
