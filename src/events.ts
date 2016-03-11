const EVENTS:symbol = Symbol('listener');
const ORIGINAL:symbol = Symbol('listener');

export interface EventEmitter {
    on(event:string, listener:Function): Emitter;
    once(event:string, listener:Function): Emitter;
    off(event?:string, listener?:Function): Emitter;
    listeners(event?:string): Function[];
    emit(event:string, ...args:any[]): void;
}

export class Emitter implements EventEmitter {
    public static on<T>(target:T,event:string,handler:Function,once:boolean=false):T{
        var listener = (...args)=>{
            handler(...args);
            if(once){
                Emitter.off(target,event,handler)
            }
        };

        listener[ORIGINAL] = handler;

        var events = target[EVENTS];
        if(!events){
            events = target[EVENTS] = {};
        }
        var listeners:Function|Function[] = events[event];
        if(!listeners){
            events[event] = listener;
        }else
        if(typeof listeners=='function'){
            events[event] = [<Function>listeners,listener];
        }else{
            (<Function[]>listeners).push(listener);
        }
        return target;
    }
    public static off<T>(target:T,event:string,handler:Function):T{
        var events = target[EVENTS];
        if(events){
            var listeners:Function|Function[] = events[event];
            if(typeof listeners=='function'){
                if((handler[ORIGINAL]||handler)===(listeners[ORIGINAL]||listeners)){
                    delete events[event];
                }
            } else
            if(listeners){
                var index=-1;
                for(var i=0;i<listeners.length;i++){
                    if((handler[ORIGINAL]||handler)===(listeners[i][ORIGINAL]||listeners[i])){
                        index=i;
                        break;
                    }
                }
                if(index>=0){
                    (<Function[]>listeners).splice(i,1);
                }
                if(listeners.length==1){
                    listeners = listeners[0];
                }else
                if(listeners.length==0){
                    delete events[event];
                }
            }
            return target;
        }
    }
    public static listeners(target:any,event:string):Function[]{
        var events = target[EVENTS];
        if(events){
            var listeners = events[event];
            if(typeof listeners=='function'){
                return [listeners]
            } else
            if(listeners){
                var result:Function[] = [];
                for(var i=0;i<listeners.length;i++){
                    result.push(listeners[i]);
                }
                return result;
            }
        }else{
            console.info('NO EVENTS');
        }
    }
    public static emit(target:any,event:string,...args:any[]):void{
        setTimeout(()=> {
            var listeners = Emitter.listeners(target,event);
            if(listeners && listeners.length){
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](...args);
                }
            }else{
                return false;
            }
        },0);
    }
    on(event:string, listener:Function): Emitter {
        return Emitter.on(this,event,listener);
    }
    once(event:string, listener:Function): Emitter{
        return Emitter.on(this,event,listener,true);
    }
    off(event?:string, listener?:Function): Emitter{
        return Emitter.off(this,event,listener);
    }
    listeners(event?:string): Function[]{
        return Emitter.listeners(this,event);
    }
    emit(event:string, ...args:any[]): void {
        return Emitter.emit(this, event, ...args);
    }
}