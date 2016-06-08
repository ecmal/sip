system.register("sip/dialogs/invitation", ["./invitation/manager"], function(system,module) {
    var manager_1;
    return {
        setters:[
            function (manager_1_1) {
                manager_1 = manager_1_1;
            }],
        execute: function() {
            module.export("InviteManager", manager_1.InviteManager);
        }
    }
});
//# sourceMappingURL=invitation.js.map