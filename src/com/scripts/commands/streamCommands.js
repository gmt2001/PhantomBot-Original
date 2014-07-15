$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var res;
    
    if (command.equalsIgnoreCase("game")) {
        if (!isCaster(sender)) {
            $.say("You must be a Caster to use that command!");
            return;
        }
        
        if (argsString.length() == 0) {
            $.say("Please specify a game!");
            return;
        }
        
        res = $.twitch.UpdateChannel($.channelName, "", argsString);
        
        if (res.getBoolean("_success")) {
            if (res.getInt("_http") == 200) {
                $.say("Changed the game to '" + res.getString("game") + "'!");
            } else {
                $.say("Failed to change the game. See bot console for details");
                println(res.getString("message"));
            }
        } else {
            $.say("Failed to change the game. See bot console for details");
            println(res.getString("_exception") + " " + res.getString("_exceptionMessage"));
        }
    }
    
    if (command.equalsIgnoreCase("title")) {
        if (!isCaster(sender)) {
            $.say("You must be a Caster to use that command!");
            return;
        }
        
        if (argsString.length() == 0) {
            $.say("Please specify a title!");
            return;
        }
        
        res = $.twitch.UpdateChannel($.channelName, argsString, "");
        
        if (res.getBoolean("_success")) {
            if (res.getInt("_http") == 200) {
                $.say("Changed the title to '" + res.getString("title") + "'!");
            } else {
                $.say("Failed to change the title. See bot console for details");
                println(res.getString("message"));
            }
        } else {
            $.say("Failed to change the title. See bot console for details");
            println(res.getString("_exception") + " " + res.getString("_exceptionMessage"));
        }
    }
    
    if (command.equalsIgnoreCase("commercial")) {
        if (!isCaster(sender)) {
            $.say("You must be a Caster to use that command!");
            return;
        }
        
        if (args.length > 0) {
            if (args[0].equalsIgnoreCase("disablecommand")) {
                if (!isAdmin(sender)) {
                    $.say("You must be a Administrator to use that command!");
                    return;
                }
            
                $.inidb.set("settings", "commercialcommandenabled", "0");
                
                $.say("Manual commercials disabled!");
                return;
            }
        
            if (args[0].equalsIgnoreCase("enablecommand")) {
                if (!isAdmin(sender)) {
                    $.say("You must be a Administrator to use that command!");
                    return;
                }
            
                $.inidb.set("settings", "commercialcommandenabled", "1");
                
                $.say("Manual commercials enabled!");
                return;
            }
        
            if (args[0].equalsIgnoreCase("autotimer")) {
                if (!isAdmin(sender)) {
                    $.say("You must be a Administrator to use that command!");
                    return;
                }
                
                if (args.length >= 2 && parseInt(args[1]) == 0) {
                    $.inidb.set("settings", "commercialtimer", args[1]);
                    
                    $.say("Automatic commercial timer disabled!");
                    return;
                }
                
                if (args.length < 3 || isNaN(args[1]) || parseInt(args[1]) < 0 || (!args[2].equalsIgnoreCase("30") && !args[2].equalsIgnoreCase("60") && !args[2].equalsIgnoreCase("90"))) {
                    $.say("Usage: !commercial autotimer <interval in minutes or 0 to disable> <commercial length 30, 60, or 90> [optional message]");
                    return;
                }
                
                if (parseInt(args[1]) < 9) {
                    args[1] = 9;
                }
            
                $.inidb.set("settings", "commercialtimer", args[1]);
                $.inidb.set("settings", "commercialtimerlength", args[2]);
                
                if (args.length > 2) {
                    $.inidb.set("settings", "commercialtimermessage", argsString.substring(argsString.indexOf(args[2], argsString.indexOf(args[1]) + 1) + args[2].length() + 1));
                } else {
                    $.inidb.set("settings", "commercialtimermessage", "");
                }
                
                $.say("Automatic commercial timer set!");
                return;
            }
        }
        
        if ($.inidb.exists("settings", "commercialcommandenabled")
            && $.inidb.get("settings", "commercialcommandenabled").equalsIgnoreCase("0") && !isAdmin(sender)) {
            $.say("Manual triggering of commercials is disabled!");
            return;
        }
        
        if (argsString.length() == 0) {
            argsString = "30";
        }
        
        res = $.twitch.RunCommercial($.channelName, parseInt(argsString));
        
        if (res.getBoolean("_success")) {
            if (res.getInt("_http") == 204) {
                $.say("Running a " + argsString + " second commercial!");
            } else if (res.getInt("_http") == 422) {
                $.say("You must enter a valid commercial length and must wait 8 minutes between commercials! Valid lengths are 30, 60, and 90 seconds");
            } else {
                $.say("Failed to run a commercial. See bot console for details");
                println(res.getString("_content"));
            }
        } else {
            $.say("Failed to run a commercial. See bot console for details");
            println(res.getString("_exception") + " " + res.getString("_exceptionMessage"));
        }
    }
});

$.registerChatCommand("game");
$.registerChatCommand("title");
$.registerChatCommand("commercial");

var lastCommercial = 0;

$.setInterval(function() {
    if (!$.moduleEnabled("./commands/streamCommands.js")) {
        return;
    }
    
    if (!$.inidb.exists("settings", "commercialtimer") || $.inidb.get("settings", "commercialtimer").equalsIgnoreCase("0")) {
        return;
    }
    
    var res;
    
    if (lastCommercial + (parseInt($.inidb.get("settings", "commercialtimer")) * 60 * 1000) < System.currentTimeMillis()){
        res = $.twitch.RunCommercial($.channelName, parseInt($.inidb.get("settings", "commercialtimerlength")));
        
        if (res.getBoolean("_success")) {
            if (res.getInt("_http") == 204) {
                if ($.inidb.get("settings", "commercialtimermessage").length() > 0) {
                    $.say($.inidb.get("settings", "commercialtimermessage"));
                }
            } else if (res.getInt("_http") == 422) {
                $.say("Failed to run a commercial. See bot console for details");
                println(res.getString("_content"));
            } else {
                $.say("Failed to run a commercial. See bot console for details");
                println(res.getString("_content"));
            }
        } else {
            $.say("Failed to run a commercial. See bot console for details");
            println(res.getString("_exception") + " " + res.getString("_exceptionMessage"));
        }
        
        lastCommercial = System.currentTimeMillis();
    }
}, 1000);