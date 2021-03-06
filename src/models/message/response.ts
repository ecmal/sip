import {Message} from "../message";
import {Challenge} from "../common/challenge";
import {Paint} from "../common/utils";
export class Response extends Message {
    public status:number;
    public message:string;

    get headline():string{
        return `${this.version} ${this.status} ${this.message}`;

    }

    get authenticate():Challenge{
        return this.getHeader(Message.HEADERS.WWW_AUTHENTICATE);
    }
    set authenticate(value:Challenge){
        this.setHeader(Message.HEADERS.WWW_AUTHENTICATE,value);
    }
    toString(){
        return [
            this.headline,
            ...Message.headersToString(this.headers),
            '',
            ''
        ].join('\r\n');
    }
    print(s?):Response{
        var status, c = (s?Paint.magenta:Paint.cyan).bind(Paint);
        var t = new Date().toISOString().substring(11,23);
        if(this.status>=400){
            status = Paint.red(`${this.status} ${this.message}`);
        }else
        if(this.status>=300){
            status = Paint.yellow(`${this.status} ${this.message}`);
        }else
        if(this.status>=200){
            status = Paint.green(`${this.status} ${this.message}`);
        }else
        if(this.status>=100){
            status = Paint.cyan(`${this.status} ${this.message}`);
        }
        console.info('');
        console.info(`${c('============================================ ')}${Paint.gray(t)}${c(` RESPONSE -- ${s?'>>':'<<'} --`)}`);
        console.info(`${this.version} ${Paint.bold(status)} `);
        console.info(c(`---------------------------------------------------------- HEADERS -- ${s?'>>':'<<'} --`));
        console.info(Message.headersToDebugString(this.headers).join('\n'));
        if(this.content && this.content.length){
            console.info(c(`------------------------------------------------------------- BODY -- ${s?'>>':'<<'} --`));
            console.info(Paint.gray(this.content.toString().trim()));

        }
        console.info(c(`-------------------------------------------------------------- END -- ${s?'>>':'<<'} --`));
        return this;
    }
}
