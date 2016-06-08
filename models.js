system.register("sip/models", ["./models/common/uri", "./models/common/contact", "./models/common/challenge", "./models/common/event", "./models/common/version", "./models/common/via", "./models/common/mime", "./models/common/agent", "./models/common/sequence", "./models/common/sdp", "./models/message/request", "./models/message/response", "./models/message"], function(system,module) {
    var uri_1, contact_1, challenge_1, event_1, version_1, via_1, mime_1, agent_1, sequence_1, sdp_1, request_1, response_1, message_1;
    return {
        setters:[
            function (uri_1_1) {
                uri_1 = uri_1_1;
            },
            function (contact_1_1) {
                contact_1 = contact_1_1;
            },
            function (challenge_1_1) {
                challenge_1 = challenge_1_1;
            },
            function (event_1_1) {
                event_1 = event_1_1;
            },
            function (version_1_1) {
                version_1 = version_1_1;
            },
            function (via_1_1) {
                via_1 = via_1_1;
            },
            function (mime_1_1) {
                mime_1 = mime_1_1;
            },
            function (agent_1_1) {
                agent_1 = agent_1_1;
            },
            function (sequence_1_1) {
                sequence_1 = sequence_1_1;
            },
            function (sdp_1_1) {
                sdp_1 = sdp_1_1;
            },
            function (request_1_1) {
                request_1 = request_1_1;
            },
            function (response_1_1) {
                response_1 = response_1_1;
            },
            function (message_1_1) {
                message_1 = message_1_1;
            }],
        execute: function() {
            module.export("Uri", uri_1.Uri);
            module.export("Contact", contact_1.Contact);
            module.export("Version", version_1.Version);
            module.export("Via", via_1.Via);
            module.export("Mime", mime_1.Mime);
            module.export("Agent", agent_1.Agent);
            module.export("Sdp", sdp_1.Sdp);
            module.export("Sequence", sequence_1.Sequence);
            module.export("Challenge", challenge_1.Challenge);
            module.export("Event", event_1.Event);
            module.export("Message", message_1.Message);
            module.export("Request", request_1.Request);
            module.export("Response", response_1.Response);
        }
    }
});
//# sourceMappingURL=models.js.map