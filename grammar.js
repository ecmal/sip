require('./out/runtime/package');
system.import('sip/tools/grammar').catch(function(e){
    console.error(e.stack);
    process.exit(1);
});