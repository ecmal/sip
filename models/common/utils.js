system.register("sip/models/common/utils", ['../../node'], function(system,module) {
    var node_1;
    var Color = new (function Color(){
        this[this.RED = 31] = "RED";
        this[this.RED_FG = 41] = "RED_FG";
        this[this.GREEN = 32] = "GREEN";
        this[this.GREEN_FG = 42] = "GREEN_FG";
        this[this.YELLOW = 33] = "YELLOW";
        this[this.YELLOW_FG = 43] = "YELLOW_FG";
        this[this.BLUE = 34] = "BLUE";
        this[this.BLUE_FG = 44] = "BLUE_FG";
        this[this.MAGENTA = 35] = "MAGENTA";
        this[this.MAGENTA_FG = 45] = "MAGENTA_FG";
        this[this.CYAN = 36] = "CYAN";
        this[this.CYAN_FG = 46] = "CYAN_FG";
        this[this.LGRAY = 37] = "LGRAY";
        this[this.LGRAY_FG = 47] = "LGRAY_FG";
        this[this.GRAY = 90] = "GRAY";
        this[this.GRAY_FG = 100] = "GRAY_FG";
    })();
    module.define("enum", Color)
    module.export("Color", Color);
    var Paint = (function (__super) {
        Paint.bold = function (text) {
            return "\033[1m" + text + "\033[0m";
        };
        Paint.dim = function (text) {
            return "\033[2m" + text + "\033[0m";
        };
        Paint.underline = function (text) {
            return "\033[4m" + text + "\033[0m";
        };
        Paint.color = function (text, color) {
            return "\033[" + color + "m" + text + "\033[0m";
        };
        Paint.red = function (text, bg) {
            return this.color(text, !bg ? Color.RED : Color.RED_FG);
        };
        Paint.green = function (text, bg) {
            return this.color(text, !bg ? Color.GREEN : Color.GREEN_FG);
        };
        Paint.yellow = function (text, bg) {
            return this.color(text, !bg ? Color.YELLOW : Color.YELLOW_FG);
        };
        Paint.blue = function (text, bg) {
            return this.color(text, !bg ? Color.BLUE : Color.BLUE_FG);
        };
        Paint.magenta = function (text, bg) {
            return this.color(text, !bg ? Color.MAGENTA : Color.MAGENTA_FG);
        };
        Paint.cyan = function (text, bg) {
            return this.color(text, !bg ? Color.CYAN : Color.CYAN_FG);
        };
        Paint.gray = function (text, bg) {
            return this.color(text, !bg ? Color.GRAY : Color.GRAY_FG);
        };
        return Paint;
        function Paint() {
        }
    })();
    module.define('class', Paint);
    module.export("Paint", Paint);
    var Util = (function (__super) {
        Util.getLocalIpAddress = function () {
            return new Promise(function (accept, reject) {
                try {
                    var dis = node_1.default.Net.connect(80, 'google.com');
                    dis.on('connect', function (r) {
                        var address = dis.localAddress;
                        dis.end();
                        dis.destroy();
                        accept(address);
                    });
                    dis.on('error', function (e) { return reject(e); });
                }
                catch (ex) {
                    reject(ex);
                }
            });
        };
        Util.toUnsigned = function (n) {
            return ((n >>> 1) * 2 + (n & 1));
        };
        Util.addZeros = function (num, size) {
            var s = '';
            for (var i = 0; i < size; i++) {
                s += '0';
            }
            return (s + num.toString(16)).substr(-size);
        };
        Util.random = function () {
            return Math.round(Math.random() * 0xFFFFFFFF);
        };
        Util.guid = function () {
            return node_1.default.Crypto.randomBytes(16).toString('hex');
        };
        Util.md5 = function (text) {
            return node_1.default.Crypto.createHash('md5').update(text).digest('hex');
        };
        Util.hash = function (count, text) {
            return this.md5(text ? text.toString() : Util.guid()).substring(0, count || 32);
        };
        Util.toParamString = function (params) {
            return params ? Object.keys(params).map(function (k) { return (";" + k + (params[k] ? ("=" + params[k]) : '')); }).join('') : '';
        };
        return Util;
        function Util() {
        }
    })();
    module.define('class', Util);
    module.export("Util", Util);
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            }],
        execute: function() {
            Paint = module.init(Paint);
            Util = module.init(Util);
        }
    }
});
//# sourceMappingURL=utils.js.map