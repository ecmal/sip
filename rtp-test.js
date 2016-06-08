require('./out/runtime/package');
system.import('sip/rtp-test').catch(function(e){
    console.error(e.stack);
    process.exit(1);
});