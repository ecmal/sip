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
            var model;
            eval('model = function '+name+'(data){Model.call(this,data)}');
            E(model,Model);
            return model;
        })()
    }
    return new Class(params);
}