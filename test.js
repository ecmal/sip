require('./out/runtime/package');
system.import('sip/test').catch(function(e){
    console.error(e.stack);
    process.exit(1);
});