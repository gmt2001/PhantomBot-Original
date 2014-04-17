function co(a,b) {
    return a.equalsIgnoreCase(b.toLowerCase());
}
 
$.on('ircChannelJoin', function(event) {
    var u = $.username.resolve(event.getUser());
    var username = u.toLowerCase();

    println (u + " has joined the channel.")
    var pre = null;
    var suf = null;
 
    
    if ($.inidb.exists("bool", username + "_greeting_enabled")) {
        pre = $.inidb.get ("string", username + "_greeting_prefix");
        suf = $.inidb.get ("string", username + "_greeting_suffix");
    }

 
    if (!(pre === null || suf === null)) {
        $.say(pre + u + suf);
    }

	
    if (pre === null || suf === null) {
        $.inidb.set("string", u + "_greeting_prefix", "Welcoming ");
        $.inidb.set("string", u + "_greeting_suffix", " to the channel.");
    }
	
});

$.on('ircChannelLeave', function(event) {
    var u = $.username.resolve(event.getUser());
    println (u + " has left the channel.")
});


$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender).toLowerCase();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    
    if(command.equalsIgnoreCase("greeting")) {
        var subCommand = args[0];
        if (subCommand.equalsIgnoreCase("enable")) {
            $.inidb.set ("bool", username + "_greeting_enabled", "true");
            
            if (!$.inidb.exists("string", username + "_greeting_prefix")) {
                $.inidb.set("string", username + "_greeting_prefix", "Welcoming ");
                $.inidb.set("string", username + "_greeting_suffix", " to the channel.");
            }
            
            $.say ("Greeting enabled! " + $.botname + " will greet you from now on " + $.username.resolve(username) + ".");
        } else if (subCommand.equalsIgnoreCase("disable")) {
            $.inidb.del ("bool", username + "_greeting_enabled");
            $.say ("Greeting disabled for " + $.username.resolve(username));
        } else if (subCommand.equalsIgnoreCase("set")) {
            if (!$.getUserGroupId(sender) == 0) {
                $.say($.username.resolve(sender) + ", " + $.getUserGroupName(sender) + "s aren't allowed access to this command! Regulars only.");
                return;
            }
            
            var rawMsg = args[1];
            var msg = rawMsg.split("<name>");
            println(msg[0]);
            $.inidb.set("string", username + "_greeting_prefix", msg[0]);
            
            if (msg.length > 1) {
                println(msg[1]);
                $.inidb.set("string", username + "_greeting_suffix", msg[1]);
            } else {
                $.inidb.set("string", username + "_greeting_suffix", "");
            }
            
            $.say("Greeting changed");
        } else {
            println($.say('Usage: !greeting enable, !greeting disable, !greeting set <"prefix"> <"suffix">'));
        }
		
    }
    
    if (command.equalsIgnoreCase("greet")) {
        if (args.length >= 1) {
            username = args[0];
            pre = $.inidb.get ("string", username + "_greeting_prefix");
            suf = $.inidb.get ("string", username + "_greeting_suffix");
            
            if (pre == null) {
                $.say($.username.resolve(username) + " has no greeting set.");
            } else {
                $.say(pre + $.username.resolve(username) + suf);
            }
        } else {
            $.say(pre + $.username.resolve(sender) + suf);
        }
    } 
});

$.registerChatCommand("greeting");
$.registerChatCommand("greet");