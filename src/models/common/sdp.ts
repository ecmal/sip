import {Model} from "../model";

var DURATIONS = {
    "d": 86400,
    "h": 3600,
    "m": 60,
    "s": 1,
    FORMAT_ORDER:["d", "h", "m"]
};


/** The SDP types and the corresponding properties. */
var MEDIA_OUTPUT_ORDER = ["i", "c", "b", "k", "rtcp", "ice-ufrag", "ice-pwd", "fingerprint", "setup", "mid", "extmap", "sendrecv", "rtcp-mux", "payloads", "ptime", "maxptime", "ssrc"];
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
var OUTPUT_ORDER = ["v", "o", "s", "i", "u", "e", "p", "c", "b", "t", "r", "z", "k", "a", "*", "m"];
var FORMATTERS = {
    "*": function (value) {
        return value.toString();
    },
    origin: function (origin) {
        return origin.username + " " + origin.sessionId + " " + origin.sessionVersion + " " + origin.networkType + " " + origin.addressType + " " + origin.unicastAddress;
    },
    timing: function (timing) {
        return timing.start + " " + timing.stop;
    },
    duration: function (duration) {
        if (duration === 0) {
            return duration;
        }
        for (var i = 0, n = DURATIONS.FORMAT_ORDER.length; i < n; i++) {
            var x = duration / DURATIONS[DURATIONS.FORMAT_ORDER[i]];
            if (typeof x=="number") {
                return x + DURATIONS.FORMAT_ORDER[i];
            }
        }
        return duration;
    },
    repeat: function (repeat) {
        var s = FORMATTERS.duration(repeat.interval) + " " + FORMATTERS.duration(repeat.activeDuration);
        for (var i = 0, n = repeat.offsets.length; i < n; i++) {
            s += " " + FORMATTERS.duration(repeat.offsets[i]);
        }
        return s;
    },
    timezones: function (timezones) {
        var s = "";
        for (var i = 0, n = timezones.length; i < n; i++) {
            s += (i > 0 ? " " : "") + timezones[i].adjustment + " " + FORMATTERS.duration(timezones[i].offset);
        }
        return s;
    },
    encryptionKey: function (encryptionKey) {
        return encryptionKey.method + (encryptionKey.key ? ":" + encryptionKey.key : "");
    },
    media: function (media) {
        var s = media.type + " " + media.port + (media.numberOfPorts ? "/" + media.numberOfPorts : "") + " " + media.protocol;
        if (media.formats) {
            s += " " + media.formats.join(" ") + EOL;
        }
        if (media.payloads) {
            for (var i = 0; i < media.payloads.length; i++) {
                s += " " + media.payloads[i].id;
            }
            s += EOL;
        }
        s += formatSdpSection(media, ["type", "port", "protocol", "numberOfPorts", "formats"], MEDIA_OUTPUT_ORDER);
        return s;
    },
    payloads: function (payload) {
        return formatSdpSection(payload, ["id"], ["rtp", "fmtp"]);
    },
    rtpmap: function (rtp, parent) {
        var s = parent.id + " " + rtp.codec + "/" + rtp.rate;
        if (rtp.codecParams) {
            s += "/" + rtp.codecParams;
        }
        return s;
    },
    fmtp: function (fmtp, parent) {
        var s = parent.id + " ";
        if (fmtp.params.split) {
            s += fmtp.params;
        } else {
            var i = 0;
            for (var p in fmtp.params) {
                if (fmtp.params.hasOwnProperty(p)) {
                    s += (++i === 1 ? "" : "; ") + p + "=" + fmtp.params[p];
                }
            }
        }
        return s;
    },
    connection: function (connection) {
        return connection.networkType + " " + connection.addressType + " " + connection.connectionAddress;
    }
};
var EOL = "\r\n";
for (var t in SDP_TYPES) {
    if (SDP_TYPES.hasOwnProperty(t)) {
        SDP_TYPES[SDP_TYPES[t]] = t;
    }
}
function includes(bwlist, element) {
    if (!bwlist) {
        return false;
    }
    if (typeof bwlist === "function") {
        return bwlist(element);
    }
    if (bwlist.indexOf) {
        return bwlist.indexOf(element) >= 0;
    }
    return false;
}
function forEach(obj, callback, options) {
    options = options || {};
    var props = [];
    for (var p in obj) {
        if (options.onlyOwnProperties === false && !obj.hasOwnProperty(p)) {
            continue;
        }
        if (options.skipFunctions !== false && (typeof obj[p] === "function")) {
            continue;
        }
        if (options.whitelist && !includes(options.whitelist, p)) {
            continue;
        }
        if (options.blacklist && includes(options.blacklist, p)) {
            continue;
        }
        props.push(p);
    }
    props.sort(options.comparator);
    for (var i = 0; i < props.length; i++) {
        callback(obj[props[i]], props[i], obj);
    }
}
function getOutputOrder(order, property):number {
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
    return idx;
}
function ordering(order) {
    return function(a, b) {
        return getOutputOrder(order, a) - getOutputOrder(order, b);
    };
}
function formatSdpProperty(section, propertyName) {
    // if the property does not exist, return empty
    if (section[propertyName] === undefined) {
        return "";
    }
    // get the prefix of the property according to SDP specs
    var prefix = SDP_TYPES[propertyName] !== undefined ? SDP_TYPES[propertyName] : propertyName;
    // gets the formatter for the property
    var formatter = FORMATTERS[propertyName] || FORMATTERS[prefix] || FORMATTERS["*"];
    // if the prefix is one single character, then it is a SDP type
    // otherwise it is a SDP attribute
    if (prefix.length > 1) {
        prefix = "a=" + prefix;
        if (section[propertyName] === false) {
            return "";
        }
        if (section[propertyName] === true) {
            return prefix + EOL;
        }
        prefix += ":";
    } else if (prefix.length > 0) {
        prefix += "=";
    }
    if (propertyName !== "timezones" && section[propertyName].push) {
        var s = "";
        for (var i = 0; i < section[propertyName].length; i++) {
            s += prefix + formatter(section[propertyName][i], section[propertyName]) + (prefix.length ? EOL : "");
        }
        return s;
    }
    return prefix + formatter(section[propertyName], section) + (prefix.length ? EOL : "");
}
function formatSdpSection(section, excluded, order) {
    var s = "";
    forEach(section, function (value, property, section) {
        s += formatSdpProperty(section, property);
    }, {
        blacklist: excluded ? function (p) {
            return excluded.indexOf(p) >= 0 || excluded.indexOf(SDP_TYPES[p]) >= 0;
        } : null,
        comparator: ordering(order)
    });
    // remove empty lines - it seems that browsers cannot deal with empty lines in SDP, even at the end
    s = s.replace(/[\r\n]{2,}/g, EOL);
    return s;
}

export interface SdpOrigin {
    username:string;
    sessionId:string;
    sessionVersion:number;
    networkType:string;
    addressType:string;
    unicastAddress:string;
}

export interface SdpConnection {
    networkType:string;
    addressType:string;
    connectionAddress:string;
}
export interface SdpTiming {
    start:number;
    stop:number;
}

export interface SdpMedia {
    type:string;
    port:number;
    protocol:string;
    payloads:SdpPayload[];
    inactive:boolean;
}

export interface SdpPayload {
    id:number;
    rtp:SdpRtp;
    fmtp:SdpFmtp;
}

export interface SdpRtp {
    codec:string;
    rate:number;
}
export interface SdpFmtp {
    params:any;
}

export class Sdp extends Model {
    
    public version:number;
    public origin:SdpOrigin;
    public sessionName:string;
    public connection:SdpConnection;
    public timing:SdpTiming;
    public media:SdpMedia[];

    get audio():SdpMedia{
        for(var i=0;i<this.media.length;i++){
            if(this.media[i].type=="audio"){
                return this.media[i];
            }
        }
    }
    
    public static format(sdp) {
        return formatSdpSection(sdp, ['audio'], OUTPUT_ORDER);
    }
    
    constructor(data?){
        if(typeof data =='string' || data instanceof Buffer){
            return <Sdp>Sdp.new(data.toString())
        }else{
            super(data);
        }
    }
    toString(options?:any){
        return Sdp.format(this);
    }
}