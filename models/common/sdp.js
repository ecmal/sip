system.register("sip/models/common/sdp", ["../model"], function(system,module) {
    var model_1;
    var DURATIONS, MEDIA_OUTPUT_ORDER, SDP_TYPES, OUTPUT_ORDER, FORMATTERS, EOL, t;
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
    module.define('function', includes)
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
    module.define('function', forEach)
    function getOutputOrder(order, property) {
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
    module.define('function', getOutputOrder)
    function ordering(order) {
        return function (a, b) {
            return getOutputOrder(order, a) - getOutputOrder(order, b);
        };
    }
    module.define('function', ordering)
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
        }
        else if (prefix.length > 0) {
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
    module.define('function', formatSdpProperty)
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
    module.define('function', formatSdpSection)
    var SdpOrigin = module.define("interface","SdpOrigin");
    var SdpConnection = module.define("interface","SdpConnection");
    var SdpTiming = module.define("interface","SdpTiming");
    var SdpMedia = module.define("interface","SdpMedia");
    var SdpPayload = module.define("interface","SdpPayload");
    var SdpRtp = module.define("interface","SdpRtp");
    var SdpFmtp = module.define("interface","SdpFmtp");
    var Sdp = (function (__super) {
        Object.defineProperty(Sdp.prototype, "audio", {
            get: function () {
                for (var i = 0; i < this.media.length; i++) {
                    if (this.media[i].type == "audio") {
                        return this.media[i];
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Sdp.format = function (sdp) {
            return formatSdpSection(sdp, ['audio'], OUTPUT_ORDER);
        };
        Sdp.prototype.toString = function (options) {
            return Sdp.format(this);
        };
        Sdp.__initializer = function(__parent){
            __super=__parent;
        };
        return Sdp;
        function Sdp(data) {
            if (typeof data == 'string' || data instanceof Buffer) {
                return Sdp.new(data.toString());
            }
            else {
                __super.call(this, data);
            }
        }
    })();
    module.define('class', Sdp);
    module.export("Sdp", Sdp);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            }],
        execute: function() {
            DURATIONS = {
                "d": 86400,
                "h": 3600,
                "m": 60,
                "s": 1,
                FORMAT_ORDER: ["d", "h", "m"]
            };
            /** The SDP types and the corresponding properties. */
            MEDIA_OUTPUT_ORDER = ["i", "c", "b", "k", "rtcp", "ice-ufrag", "ice-pwd", "fingerprint", "setup", "mid", "extmap", "sendrecv", "rtcp-mux", "payloads", "ptime", "maxptime", "ssrc"];
            SDP_TYPES = {
                v: "version",
                o: "origin",
                s: "sessionName",
                i: "sessionDescription",
                u: "uri",
                e: "emailAddress",
                p: "phoneNumber",
                c: "connection",
                m: "media",
                b: "bandwidth",
                t: "timing",
                r: "repeat",
                z: "timezones",
                k: "encryptionKey",
                cat: "category",
                keywds: "keywords",
                ptime: "packetTime",
                maxptime: "maximumPacketTime",
                orient: "orientation",
                rtp: "rtpmap",
                "payloads": ""
            };
            OUTPUT_ORDER = ["v", "o", "s", "i", "u", "e", "p", "c", "b", "t", "r", "z", "k", "a", "*", "m"];
            FORMATTERS = {
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
                        if (typeof x == "number") {
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
                    }
                    else {
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
            EOL = "\r\n";
            for (t in SDP_TYPES) {
                if (SDP_TYPES.hasOwnProperty(t)) {
                    SDP_TYPES[SDP_TYPES[t]] = t;
                }
            }
            Sdp = module.init(Sdp,model_1.Model);
        }
    }
});
//# sourceMappingURL=sdp.js.map