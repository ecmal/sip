require('./out/runtime/package');
System.import('sip/test').catch(function(e){
    console.error(e.stack);
    process.exit(1);
});