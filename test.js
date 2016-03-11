require('./out/runtime/package');
System.import('sip/SipTest').catch(function(e){
    console.error(e.stack);
    process.exit(1);
});