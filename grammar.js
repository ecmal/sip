require('./out/runtime/package');
System.import('sip/tools/grammar').catch(function(e){
    console.error(e.stack);
    process.exit(1);
});