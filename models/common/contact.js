system.register("sip/models/common/contact", ["../model", "./uri"], function(system,module) {
    var model_1, uri_1;
    var Contact = (function (__super) {
        Object.defineProperty(Contact.prototype, "tag", {
            get: function () {
                return this.getParam('tag');
            },
            set: function (v) {
                this.setParam('tag', v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Contact.prototype, "displayName", {
            get: function () {
                return this.name || this.uri.username;
            },
            enumerable: true,
            configurable: true
        });
        Contact.prototype.setParam = function (name, value) {
            if (!this.params) {
                this.params = Object.create(null);
            }
            this.params[name] = value;
        };
        Contact.prototype.getParam = function (name) {
            if (this.params) {
                return this.params[name];
            }
        };
        Contact.prototype.toString = function (options) {
            return (this.name ? JSON.stringify(this.name) + ' ' : '') + "<" + this.uri.toString(options) + ">" + (function (params) {
                return params ? Object.keys(params).map(function (k) { return (";" + k + (params[k] ? (k[0] == '+' ? "=\"<" + params[k] + ">\"" : "=" + params[k]) : '')); }).join('') : '';
            })(this.params);
        };
        Contact.__initializer = function(__parent){
            __super=__parent;
        };
        return Contact;
        function Contact(data) {
            __super.call(this, data);
            if (typeof data == 'string') {
                return Contact.new(data);
            }
            else {
                __super.call(this, data);
            }
        }
    })();
    module.define('class', Contact);
    module.export("Contact", Contact);
    return {
        setters:[
            function (model_1_1) {
                model_1 = model_1_1;
            },
            function (uri_1_1) {
                uri_1 = uri_1_1;
            }],
        execute: function() {
            Contact = module.init(Contact,model_1.Model);
        }
    }
});
//# sourceMappingURL=contact.js.map