system.register("sip/models/model", ["../parser"], function(system,module) {
    var parser_1;
    var Model = (function (__super) {
        Model.new = function (text) {
            if (!Model.parser) {
                Object.defineProperty(Model, 'parser', {
                    value: parser_1.Parser
                });
            }
            return Model.parser.parse(text, this);
        };
        Model.prototype.set = function (data) {
            for (var key in data) {
                if (typeof data[key] != 'undefined') {
                    this[key] = data[key];
                }
                else {
                    delete this[key];
                }
            }
            return this;
        };
        Model.prototype.inspect = function () {
            return this.constructor.name + "(" + JSON.stringify(this, null, 2) + ")";
        };
        Model.prototype.toString = function (options) {
            return this.constructor.name + "(" + JSON.stringify(this, null, 2) + ")";
        };
        Model.prototype.clone = function (select) {
            var object = this.constructor['new'](this.toString());
            if (select) {
                var keys = select.trim().split(',').map(function (k) { return k.trim(); }).filter(function (k, i, a) { return a.indexOf(k) == i; });
                for (var key in object) {
                    if (keys.indexOf(key) < 0) {
                        delete object[key];
                    }
                }
            }
            return object;
        };
        return Model;
        function Model(data) {
            Object.defineProperty(this, 'class', {
                enumerable: false,
                value: this.constructor.name
            });
            if (data) {
                this.set(data);
            }
        }
    })();
    module.define('class', Model);
    module.export("Model", Model);
    return {
        setters:[
            function (parser_1_1) {
                parser_1 = parser_1_1;
            }],
        execute: function() {
            Model = module.init(Model);
        }
    }
});
//# sourceMappingURL=model.js.map