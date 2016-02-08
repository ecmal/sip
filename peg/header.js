function Model(type,data){
    if(typeof options[type]=='function'){
        var model = new options[type]();
        for(var i in data){
            model[i] = data[i];
        }
        return model;
    }else{
        this.type = type;
        for(var i in data){
            this[i] = data[i];
        }
    }
}

var Rules = {
    SipUri : function(sh,ui,hp,pm,hd){
        var uri = {protocol:sh,hostname:hp.host}
        if(hp.port){
            uri.port = hp.port
        }
        if(ui){
            uri.username = ui.user
            if(ui.pass){
                uri.password = ui.pass
            }
        }
        if(pm && pm.length){
            uri.params=pm;
        }

        if(hd && hd.length){
            uri.headers=hd;
        }
        return new Model('SipUri',uri);
    }
};
