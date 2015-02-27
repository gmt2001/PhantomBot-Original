$var.lastrandom = "";

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var s;

    if(command.equalsIgnoreCase("kill")) {
        var killmessages = new Array();
        
        if($.strlen(argsString) > 0) {
            if (argsString.equalsIgnoreCase($.botname)) {
                killmessages.push("<target> counters <sender>'s attempt to kill it with a flamethrower");
                killmessages.push("<target> kicked <sender> in the balls in self defense");
                killmessages.push("<target> throws a shuriken at <sender>");
            } else {
                killmessages.push("<sender> murdered <target> with a unicorn's horn!");
                killmessages.push("<sender> covered <target> in meat sauce and threw them in a cage with a starved tiger.");
                killmessages.push("<sender> genetically modified a Venus fly trap so it grows really big and trapped <target> in a room with it.");
                killmessages.push("<sender> shanked <target>'s butt, over and over again.");
                killmessages.push("<sender> just wrote <target>'s name in his DeathNote.");
                killmessages.push("<sender> attacked <target> with a rusty spoon as the weapon...and managed to kill him.");
            }
        } else {
            killmessages.push("<sender> has somehow managed to kill himself.");
            killmessages.push("<sender> exploded.");
            killmessages.push("<sender> imploded.");
        }
        
        do {
            s = $.randElement(killmessages);
        } while(s.equalsIgnoreCase($var.lastrandom) && killmessages.length > 1);
        
        s = s.replace("<sender>", username);
        
        if (argsString.length > 0) {
            s = s.replace("<target>", $.username.resolve(argsString));
        }
        
        $.say(s);
    }
});

$.registerChatCommand("./commands/killCommand.js", "kill");