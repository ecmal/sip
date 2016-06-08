system.register("sip/media/rtcp", ["../models/common/utils", "../dialogs/invitation/call", "../models/common/sdp"], function(system,module) {
    var utils_1, call_1, sdp_1;
    var REPORT_LENGTH, SR_REPORT_START, RR_REPORT_START;
    var RtcpPacket = (function (__super) {
        RtcpPacket.parse = function (buffer) {
            switch (RtcpPacket.getType(buffer)) {
                case 200: return new RtcpSRPacket(buffer);
                case 201: return new RtcpRRPacket(buffer);
                case 202: return new RtcpSDPacket(buffer);
                case 203: return new RtcpGBPacket(buffer);
                case 204: return new RtcpAPPacket(buffer);
            }
        };
        RtcpPacket.getType = function (buffer) {
            return buffer[1];
        };
        RtcpPacket.getLength = function (buffer) {
            return (buffer.readUInt16BE(2) + 1) * 4;
        };
        Object.defineProperty(RtcpPacket.prototype, "version", {
            get: function () {
                return this.buffer[0] >> 6;
            },
            set: function (val) {
                this.buffer[0] |= (val << 6);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpPacket.prototype, "padding", {
            get: function () {
                return (this.buffer[0] >> 5) & 1;
            },
            set: function (val) {
                this.buffer[0] |= ((val & 1) << 5);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpPacket.prototype, "type", {
            get: function () {
                return this.buffer[1];
            },
            set: function (val) {
                val = utils_1.Util.toUnsigned(val);
                if (val <= 127) {
                    this.buffer[1] &= 0x80;
                    this.buffer[1] |= val;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpPacket.prototype, "length", {
            get: function () {
                return RtcpPacket.getLength(this.buffer);
            },
            set: function (val) {
            },
            enumerable: true,
            configurable: true
        });
        RtcpPacket.prototype.toJSON = function () {
            return {
                version: this.version,
                type: this.type,
                length: this.length
            };
        };
        RtcpPacket.prototype.copy = function () {
            var newBuffer = new Buffer(this.buffer.length);
            this.buffer.copy(newBuffer);
            return new RtcpPacket(newBuffer);
        };
        return RtcpPacket;
        function RtcpPacket(options) {
            if (options instanceof Buffer) {
                if (this.constructor == RtcpPacket) {
                    return RtcpPacket.parse(options);
                }
                else {
                    this.buffer = options;
                }
            }
        }
    })();
    module.define('class', RtcpPacket);
    module.export("RtcpPacket", RtcpPacket);
    var RtcpSRPacket = (function (__super) {
        Object.defineProperty(RtcpSRPacket.prototype, "reportsCount", {
            get: function () {
                return this.buffer[0] & 0x1F;
            },
            set: function (val) {
                if (val <= 31) {
                    this.buffer[0] &= 0xe0;
                    this.buffer[0] |= val;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpSRPacket.prototype, "source", {
            get: function () {
                return this.buffer.readUInt32BE(4);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 4);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpSRPacket.prototype, "startTime", {
            get: function () {
                return this.buffer.readUInt32BE(8);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 8);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpSRPacket.prototype, "endTime", {
            get: function () {
                return this.buffer.readUInt32BE(12);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 12);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpSRPacket.prototype, "timestamp", {
            get: function () {
                return this.buffer.readUInt32BE(16);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 16);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpSRPacket.prototype, "senderPacketCount", {
            get: function () {
                return this.buffer.readUInt32BE(20);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 20);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpSRPacket.prototype, "senderOctetCount", {
            get: function () {
                return this.buffer.readUInt32BE(24);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 24);
            },
            enumerable: true,
            configurable: true
        });
        RtcpSRPacket.prototype.toJSON = function () {
            return {
                version: this.version,
                padding: this.padding,
                reportsCount: this.reportsCount,
                type: this.type,
                length: this.length,
                source: this.source,
                startTime: this.startTime,
                endTime: this.endTime,
                timestamp: this.timestamp,
                senderPacketCount: this.senderPacketCount,
                senderOctetCount: this.senderOctetCount,
                reports: (this.reportsCount == 0) ? null : RtcpReport.getReports(this.buffer, SR_REPORT_START)
            };
        };
        RtcpSRPacket.__initializer = function(__parent){
            __super=__parent;
        };
        return RtcpSRPacket;
        function RtcpSRPacket(options) {
            __super.call(this, options);
        }
    })();
    module.define('class', RtcpSRPacket);
    module.export("RtcpSRPacket", RtcpSRPacket);
    var RtcpRRPacket = (function (__super) {
        Object.defineProperty(RtcpRRPacket.prototype, "reportsCount", {
            get: function () {
                return this.buffer[0] & 0x1F;
            },
            set: function (val) {
                if (val <= 31) {
                    this.buffer[0] &= 0xe0;
                    this.buffer[0] |= val;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpRRPacket.prototype, "source", {
            get: function () {
                return this.buffer.readUInt32BE(4);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 4);
            },
            enumerable: true,
            configurable: true
        });
        RtcpRRPacket.prototype.toJSON = function () {
            return {
                version: this.version,
                padding: this.padding,
                reportsCount: this.reportsCount,
                type: this.type,
                length: this.length,
                source: this.source,
                reports: (this.reportsCount == 0) ? null : RtcpReport.getReports(this.buffer, RR_REPORT_START)
            };
        };
        RtcpRRPacket.__initializer = function(__parent){
            __super=__parent;
        };
        return RtcpRRPacket;
        function RtcpRRPacket(options) {
            __super.call(this, options);
        }
    })();
    module.define('class', RtcpRRPacket);
    module.export("RtcpRRPacket", RtcpRRPacket);
    var RtcpReport = (function (__super) {
        RtcpReport.getReports = function (buffer, start) {
            var reports = [];
            var count = buffer.slice(start).length / REPORT_LENGTH;
            for (var i = 0; i < count; i++) {
                var buf;
                buf = buffer.slice(start + i * REPORT_LENGTH, start + i * REPORT_LENGTH + REPORT_LENGTH);
                reports.push(new RtcpReport(buf).toJSON());
            }
            return reports;
        };
        Object.defineProperty(RtcpReport.prototype, "source", {
            get: function () {
                return this.buffer.readUInt32BE(0);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpReport.prototype, "lostFraction", {
            get: function () {
                return this.buffer.readUInt8(4);
            },
            set: function (val) {
                this.buffer.writeInt8(val, 4);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpReport.prototype, "lostCount", {
            get: function () {
                return this.buffer.readUIntBE(5, 3);
            },
            set: function (val) {
                this.buffer.writeIntBE(val, 5, 3);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpReport.prototype, "highestSequence", {
            get: function () {
                return this.buffer.readUInt32BE(8);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 8);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpReport.prototype, "jitter", {
            get: function () {
                return this.buffer.readUInt32BE(12);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 12);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpReport.prototype, "LSR", {
            get: function () {
                return this.buffer.readUInt32BE(16);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 16);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtcpReport.prototype, "DLSR", {
            get: function () {
                return this.buffer.readUInt32BE(20);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 20);
            },
            enumerable: true,
            configurable: true
        });
        RtcpReport.prototype.toJSON = function () {
            return {
                source: this.source,
                lostFraction: this.lostFraction,
                lostCount: this.lostCount,
                highestSequence: this.highestSequence,
                jitter: this.jitter,
                LSR: this.LSR,
                DLSR: this.DLSR
            };
        };
        return RtcpReport;
        function RtcpReport(buffer) {
            this.buffer = buffer;
        }
    })();
    module.define('class', RtcpReport);
    module.export("RtcpReport", RtcpReport);
    var RtcpSDPacket = (function (__super) {
        RtcpSDPacket.getSourcesCount = function (buffer) {
            return buffer[0] & 0x1f;
        };
        Object.defineProperty(RtcpSDPacket.prototype, "sources", {
            get: function () {
                var cnt = RtcpSDPacket.getSourcesCount(this.buffer);
                var list = [], ofs = 4, type, len, val, source;
                for (var s = 0; s < cnt; s++) {
                    list.push(source = {
                        id: this.buffer.readUInt32BE(ofs)
                    });
                    ofs += 4;
                    while (type = this.buffer[ofs]) {
                        len = this.buffer[ofs + 1];
                        val = this.buffer.toString('utf8', ofs + 2, ofs + 2 + len);
                        ofs = ofs + 2 + len;
                        switch (type) {
                            case 1:
                                source.uri = val;
                                break;
                            case 2:
                                source.name = val;
                                break;
                            case 3:
                                source.email = val;
                                break;
                            case 4:
                                source.phone = val;
                                break;
                            case 5:
                                source.location = val;
                                break;
                            case 6:
                                source.tool = val;
                                break;
                            case 7:
                                source.note = val;
                                break;
                        }
                    }
                    ofs++;
                }
                return list;
            },
            enumerable: true,
            configurable: true
        });
        RtcpSDPacket.prototype.toJSON = function () {
            return {
                version: this.version,
                type: this.type,
                length: this.length,
                sources: this.sources
            };
        };
        RtcpSDPacket.__initializer = function(__parent){
            __super=__parent;
        };
        return RtcpSDPacket;
        function RtcpSDPacket(options) {
            __super.call(this, options);
        }
    })();
    module.define('class', RtcpSDPacket);
    module.export("RtcpSDPacket", RtcpSDPacket);
    var RtcpAPPacket = (function (__super) {
        RtcpAPPacket.__initializer = function(__parent){
            __super=__parent;
        };
        return RtcpAPPacket;
        function RtcpAPPacket(options) {
            __super.call(this, options);
        }
    })();
    module.define('class', RtcpAPPacket);
    module.export("RtcpAPPacket", RtcpAPPacket);
    var RtcpGBPacket = (function (__super) {
        RtcpGBPacket.getSourcesCount = function (buffer) {
            return buffer[0] & 0x1f;
        };
        Object.defineProperty(RtcpGBPacket.prototype, "sources", {
            get: function () {
                var cnt = RtcpGBPacket.getSourcesCount(this.buffer);
                var list = [], ofs = 4, type, len, val, source;
                for (var s = 0; s < cnt; s++) {
                    list.push(source = {
                        id: this.buffer.readUInt32BE(ofs)
                    });
                    ofs += 4;
                }
                return list;
            },
            enumerable: true,
            configurable: true
        });
        RtcpGBPacket.prototype.toJSON = function () {
            return {
                version: this.version,
                type: this.type,
                length: this.length,
                sources: this.sources
            };
        };
        RtcpGBPacket.__initializer = function(__parent){
            __super=__parent;
        };
        return RtcpGBPacket;
        function RtcpGBPacket(options) {
            __super.call(this, options);
        }
    })();
    module.define('class', RtcpGBPacket);
    module.export("RtcpGBPacket", RtcpGBPacket);
    return {
        setters:[
            function (utils_1_1) {
                utils_1 = utils_1_1;
            },
            function (call_1_1) {
                call_1 = call_1_1;
            },
            function (sdp_1_1) {
                sdp_1 = sdp_1_1;
            }],
        execute: function() {
            RtcpPacket = module.init(RtcpPacket);
            REPORT_LENGTH = 24;
            SR_REPORT_START = 28;
            RR_REPORT_START = 8;
            RtcpSRPacket = module.init(RtcpSRPacket,RtcpPacket);
            RtcpRRPacket = module.init(RtcpRRPacket,RtcpPacket);
            RtcpReport = module.init(RtcpReport);
            RtcpSDPacket = module.init(RtcpSDPacket,RtcpPacket);
            RtcpAPPacket = module.init(RtcpAPPacket,RtcpPacket);
            RtcpGBPacket = module.init(RtcpGBPacket,RtcpPacket);
        }
    }
});
//# sourceMappingURL=rtcp.js.map