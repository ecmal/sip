import process from "node/process";
import Node from "../node";

const grammarDir = Node.Path.resolve(process.argv[2]||'../peg');
const outputPath = Node.Path.resolve(process.argv[3]||'./sip','grammar.js');
console.info("GrammarDir :",grammarDir);
console.info("OutputPath :",outputPath);

class Compiler {
    static run():Compiler {
        return new Compiler().run();
    }
    private header:string;
    private wrapper:string;
    private grammar:string;
    private config:any;

    private readConfig(){
        this.config = JSON.parse(Node.Fs.readFileSync(
            Node.Path.resolve(grammarDir,'config.json'),'utf8'
        ));
    }
    private readHeader(){
        this.header = Node.Fs.readFileSync(
            Node.Path.resolve(grammarDir,'header.js'),'utf8'
        );
    }
    private readGrammar(){
        this.grammar = Node.Fs.readFileSync(
            Node.Path.resolve(grammarDir,'grammar.pegjs'),'utf8'
        );
    }
    private readWrapper(){
        this.wrapper = Node.Fs.readFileSync(
            Node.Path.resolve(grammarDir,'wrapper.js'),'utf8'
        );
    }
    private read(){
        this.readConfig();
        this.readHeader();
        this.readGrammar();
        this.readWrapper();
    }
    private get source():string{
        return [
            '// Header',
            '{',this.header,'}',
            '',
            '// Grammar ',
            this.grammar
        ].join('\n')
    }

    log(message,data?){
        console.info(message);
        if(typeof data!='undefined'){
            console.info(data);
        }
    }

    debug(message,data?){
        if(this.config.debug){
            this.log(message,data);
        }
    }
    getGrammarFor(location){
        var line = location.start.line;
        var startLine = line-2;
        var endLine = line+3;
        return this.source
            .split('\n')
            .slice(startLine,endLine)
            .map((l,i)=>{
                var num = (startLine+i);
                if(num==line){
                    return `  \033[91m${num} | ${l}\033[0m`
                }else{
                    return `  ${(num+' | ' +l)}`
                }

            }).join('\n');
    }
    compile(path:string):boolean{
        try {
            //this.debug('-- CONFIG  ',this.config);
            //this.debug('-- SOURCE  ',this.source);
            //this.debug('-- WRAPPER ',this.wrapper);
            var result = Node.Peg.buildParser(this.source, this.config).trim();
            //this.debug('-- RESULT  ',result);

            var [header,footer] = this.wrapper.split('GRAMMAR.PEG.TEMPLATE');
            var output = [header, result, footer].join('');
            //this.debug('-- OUTOUT  ',output);
            Node.Fs.writeFileSync(outputPath, output, 'utf8');
            this.log(`COMPILED : ${path}`);
            return true;
        }catch(err){
            this.log(`FAILED   : ${path}`);
            console.info(`\033[31m${err.message}\033[0m`);
            console.info(this.getGrammarFor(err.location));
            return false;
        }
    }
    watch(){
        this.log(`WATCHING : ${grammarDir}`);
        Node.Fs.watch(grammarDir,{persistent:true},(e,f)=>{
            var recompile = true;
            switch(f){
                case 'header.js'     : this.readHeader(); break;
                case 'wrapper.js'    : this.readWrapper(); break;
                case 'grammar.pegjs' : this.readGrammar(); break;
                case 'config.json'   : this.readConfig(); break;
                default              : recompile = false;
            }
            if(recompile){
                this.compile(Node.Path.resolve(grammarDir,f));
            }else{
                this.log(`IGNORED  : ${f}`);
            }
        });
    }
    run():Compiler{
        this.read();
        this.compile('file:'+grammarDir+'/grammar.pegjs');
        if(process.argv.indexOf('-w')){
            this.watch();
        }
        return this;
    }

}

Compiler.run();