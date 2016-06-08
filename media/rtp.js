system.register("sip/media/rtp", ["../models/common/utils", "../dialogs/invitation/call", "../models/common/sdp"], function(system,module) {
    var utils_1, call_1, sdp_1;
    /**
     *  0               1               2               3
     *  0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
     * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     * |V=2|P|X|  CC   |M|     PT      |       sequence number         |
     * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     * |                           timestamp                           |
     * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     * |           synchronization source (SSRC) identifier            |
     * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
     * |            contributing source (CSRC) identifiers             |
     * |                             ....                              |
     * +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
     * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     * |      defined by profile       |           length              |
     * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     * |                        header extension                       |
     * |                             ....                              |
     * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     *                              payload
     *                               ....
     * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
     * @author <a href="http://bruno.biasedbit.com/">Bruno de Carvalho</a>
     */
    var RtpPacket = (function (__super) {
        RtpPacket.getPayloadType = function (buffer) {
            return buffer[1] & 0x7F;
        };
        RtpPacket.hasExtension = function (buffer) {
            return !!(buffer[0] >>> 4 & 1);
        };
        RtpPacket.getExtensionType = function (buffer) {
            var count = RtpPacket.getExtensionCount(buffer);
            if (count > 0) {
                return (count + 1) * 4;
            }
            else {
                return 0;
            }
        };
        RtpPacket.getExtensionCount = function (buffer) {
            if (RtpPacket.hasExtension(buffer)) {
                return buffer[14] << 8 & buffer[15];
            }
            else {
                return 0;
            }
        };
        RtpPacket.getExtensionLength = function (buffer) {
            var count = RtpPacket.getExtensionCount(buffer);
            if (count > 0) {
                return (count + 1) * 4;
            }
            else {
                return 0;
            }
        };
        RtpPacket.getSourcesCount = function (buffer) {
            return buffer[0] & 0x0F;
        };
        RtpPacket.getSourcesLength = function (buffer) {
            return RtpPacket.getSourcesCount(buffer) * 4;
        };
        RtpPacket.getHeaderLength = function (buffer) {
            //fixed length
            var len = 12;
            //csrc length
            len += RtpPacket.getSourcesLength(buffer);
            //extensional length
            len += RtpPacket.getExtensionLength(buffer);
            return len;
        };
        Object.defineProperty(RtpPacket.prototype, "version", {
            get: function () {
                return this.buffer[0] >> 6;
            },
            set: function (val) {
                this.buffer[0] &= 0x3f;
                this.buffer[0] |= (val << 6);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "padding", {
            get: function () {
                return (this.buffer[0] & 0x20) == 0x20;
            },
            set: function (val) {
                if (val) {
                    this.buffer[0] |= 0x20;
                }
                else {
                    this.buffer[0] &= 0xdf;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "marker", {
            get: function () {
                return (this.buffer[1] & 0x80) == 0x80;
            },
            set: function (val) {
                if (val) {
                    this.buffer[1] |= 0x80;
                }
                else {
                    this.buffer[1] &= 0x7F;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "sequence", {
            get: function () {
                return this.buffer.readUInt16BE(2);
            },
            set: function (val) {
                this.buffer.writeInt16BE(val, 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "timestamp", {
            get: function () {
                return (this.buffer.readUInt32BE(4));
            },
            set: function (val) {
                this.buffer.writeUInt32BE(val, 4);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "sources", {
            //contributing sources
            get: function () {
                var csrcCount = RtpPacket.getSourcesCount(this.buffer);
                var csrcList = [];
                for (var i = 0; i < csrcCount; i++) {
                    csrcList.push(this.buffer.readUInt32BE(12 + 4 * i));
                }
                return csrcList;
            },
            set: function (val) {
                var count = val.length;
                this.buffer[0] &= (count | 0xF0);
                if (count > 0) {
                    throw new Error('todo sources');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "source", {
            //synchronization source
            get: function () {
                return this.buffer.readUInt32BE(8);
            },
            set: function (val) {
                this.buffer.writeInt32BE(val, 8);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "type", {
            get: function () {
                return RtpPacket.getPayloadType(this.buffer);
            },
            set: function (val) {
                if (val <= 127) {
                    this.buffer[1] &= 0x80;
                    this.buffer[1] |= val;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "data", {
            get: function () {
                return this.buffer.slice(RtpPacket.getHeaderLength(this.buffer), this.buffer.length);
            },
            set: function (val) {
                var hLen = RtpPacket.getHeaderLength(this.buffer);
                var oLen = this.buffer.length - hLen;
                var nLen = val.length;
                if (oLen == nLen) {
                    val.copy(this.buffer, hLen, 0, nLen);
                }
                else {
                    this.buffer = Buffer.concat([this.buffer.slice(0, hLen), val], nLen + oLen);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RtpPacket.prototype, "extension", {
            get: function () {
                var eCount = RtpPacket.getExtensionCount(this.buffer);
                if (eCount > 0) {
                    var sCount = RtpPacket.getSourcesCount(this.buffer);
                    var eOffset = 12 + sCount * 4;
                    var eType = this.buffer.readInt16BE(eOffset);
                    var eData = this.buffer.slice(eOffset + 4, eOffset + 4 + eCount * 4);
                    return {
                        count: eCount,
                        type: eType,
                        data: eData
                    };
                }
                else {
                    return null;
                }
            },
            set: function (val) {
                if (!val) {
                    this.buffer[0] &= 0xef;
                }
                else {
                    throw new Error('todo sources');
                }
            },
            enumerable: true,
            configurable: true
        });
        RtpPacket.prototype.toJSON = function () {
            return {
                version: this.version,
                padding: this.padding,
                marker: this.marker,
                type: this.type,
                sequence: this.sequence,
                timestamp: this.timestamp,
                source: this.source,
                sources: this.sources,
                extension: this.extension,
                data: this.data
            };
        };
        RtpPacket.prototype.copy = function () {
            var newBuffer = new Buffer(this.buffer.length);
            this.buffer.copy(newBuffer);
            return new RtpPacket(newBuffer);
        };
        return RtpPacket;
        function RtpPacket(options) {
            this.buffer = null;
            if (options instanceof Buffer) {
                this.buffer = options;
                return;
            }
            else if (typeof options == 'object') {
                var sCount = options.sources ? options.sources.length : 0;
                var eCount = options.extension ? Math.ceil(options.extension.data.length / 4) : 0;
                var pLen = options.data ? options.data.length : 0;
                this.buffer = new Buffer(12 - sCount * 4 + (eCount > 0 ? (eCount * 4 + 4) : 0) + pLen);
                this.buffer.fill(0);
                this.version = options.version || 2;
                this.padding = options.padding || false;
                this.marker = options.marker || false;
                this.type = options.type || 0;
                this.sequence = options.sequence || 0;
                this.timestamp = options.timestamp || 0;
                this.source = options.source || Math.round(Math.random() * 0xFFFFFFFF);
                this.sources = options.sources || [];
                this.extension = options.extension || null;
                this.data = options.data || new Buffer(0);
            }
        }
    })();
    module.define('class', RtpPacket);
    module.export("RtpPacket", RtpPacket);
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
            RtpPacket = module.init(RtpPacket);
        }
    }
});
//# sourceMappingURL=rtp.js.map