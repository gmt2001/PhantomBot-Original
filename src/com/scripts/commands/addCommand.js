var s = $.inidb.get("settings", "nonmodcommands");

$.allowNonModCommands = false;

if (s != null && s.equals("1")) {
    $.allowNonModCommands = true;
}

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var points;
    var commandString;
    var message;
    var cmd;

    if(args.length >= 2) {
        if(command.equalsIgnoreCase("addcom")) {
            if (!$.allowNonModCommands && !$.isMod(sender)) {
                $.say("You must be a Moderator to use that command!");
                return;
            }
            
            if (!$.isMod(sender) && $.moduleEnabled("./systems/pointSystem.js")) {
                points = $.inidb.get('points', sender);
                if(points == null) points = 0;
                else points = int(points);
            
                if(points < 8000) {
                    $.say($.username.resolve(sender) + ", " + " you need 8,000 " + $.pointname + " to create that command, dood!");
                    return;
                }

                $.inidb.decr('points', sender, 8000);

                $.say(username + ", paid 8,000 " + $.pointname + " to add a new command, doods!");
            } 
            
            commandString = args[0].toLowerCase();
            message = argsString.substring(argsString.indexOf(commandString) + commandString.length() + 1);
            $.inidb.set('command', commandString, message);
            
            $.registerCustomChatCommand(commandString);
            
            $.say($.username.resolve(sender) + ", the command !" + commandString + " was successfully created, dood!");
            return;
        }

    }
    
    if(args.length >= 1) {
        if(command.equalsIgnoreCase("delcom")) {
            if (!$.isMod(sender)) {
                $.say("You must be a Moderator to use that command!");
                return;
            }
            
            commandString = args[0].toLowerCase();
            $.inidb.del('command', commandString);
            
            $.unregisterCustomChatCommand(commandString);
            
            cmd = $.inidb.del('command', commandString);
            $.say($.username.resolve(sender) + ", the command !" + commandString + " was successfully removed, dood!");
            return;
        }
    }
	
    if (command.equalsIgnoreCase("modcom")) {
        if (!$.isMod(sender)) {
            $.say("You must be a Moderator to use that command!");
            return;
        }
        
        $.allowNonModCommands = !$.allowNonModCommands;
        
        if ($.allowNonModCommands) {
            $.inidb.set("settings", "nonmodcommands", "1");
            $.say("New chat commands from non-Moderators is allowed!");
        } else {
            $.inidb.set("settings", "nonmodcommands", "0");
            $.say("New chat commands from non-Moderators is no longer allowed!");
        }
    }
    
    if (command.equalsIgnoreCase("permcom")) {
        if (!isAdmin(sender)) {
            $.say("You must be an Administrator to use that command!");
            return;
        }
        
        if (args.length == 0) {
            $.say("Usage: !permcom <command name> [user, caster, mod, admin]. Restricts usage of a custom command to viewers with a certain permission level");
            return;
        }
        
        if (args.length == 1) {
            if (!$.inidb.exists("command", args[0].toLowerCase())) {
                $.say("The command " + args[0] + " does not exist!");
                return;
            }
            
            if (!$.inidb.exists("commandperm", args[0].toLowerCase())) {
                $.say("The command " + args[0] + " can be used by all viewers");
            } else if ($.inidb.get("commandperm", args[0].toLowerCase()).equalsIgnoreCase("caster")) {
                $.say("The command " + args[0] + " can only be used by Casters");
            } else if ($.inidb.get("commandperm", args[0].toLowerCase()).equalsIgnoreCase("mod")) {
                $.say("The command " + args[0] + " can only be used by Moderators");
            } else if ($.inidb.get("commandperm", args[0].toLowerCase()).equalsIgnoreCase("admin")) {
                $.say("The command " + args[0] + " can only be used by Administrators");
            }
        }
        
        if (args.length >= 2) {
            if (!$.inidb.exists("command", args[0].toLowerCase())) {
                $.say("The command " + args[0] + " does not exist!");
                return;
            }
            
            if (args[1].equalsIgnoreCase("caster") || args[1].equalsIgnoreCase("casters")) {
                $.inidb.set("commandperm", args[0].toLowerCase(), "caster");
                $.say("The command " + args[0] + " can now only be used by Casters");
            } else if (args[1].equalsIgnoreCase("mod") || args[1].equalsIgnoreCase("mods")
                || args[1].equalsIgnoreCase("moderator") || args[1].equalsIgnoreCase("moderators")) {
                $.inidb.set("commandperm", args[0].toLowerCase(), "mod");
                $.say("The command " + args[0] + " can now only be used by Moderators");
            } else if (args[1].equalsIgnoreCase("admin") || args[1].equalsIgnoreCase("admins")
                || args[1].equalsIgnoreCase("administrator") || args[1].equalsIgnoreCase("administrators")) {
                $.inidb.set("commandperm", args[0].toLowerCase(), "admin");
                $.say("The command " + args[0] + " can now only be used by Administrators");
            } else {
                $.inidb.del("commandperm", args[0].toLowerCase());
                $.say("The command " + args[0] + " can now be used by all viewers");
            }
        }
    }
    
    if (command.equalsIgnoreCase("helpcom")) {
        $.say("Usage: !addcom <command name> <message to say>, !delcom <command name>, !modcom, !permcom <command name> [user, caster, mod, admin]");
        
        $.say("When using !addcom, you can put the text '(sender)' to have the name of any user who says the new command inserted into it. ex. '!addcom hello Hello there (sender)!'");
        
        $.say("When using !addcom, you can also put '(1)', '(2)', and so on to allow arguments. ex. '!addcom kill (sender) just killed (1) with a (2)!'");
        
        $.say("Additional special tags: '(count)' will add the number of times the command was used (including the current usage)");
    }
    
    if ($.inidb.exists('command', command.toLowerCase())) {
        if ($.inidb.exists("commandperm", command.toLowerCase())) {
            if ($.inidb.get("commandperm", command.toLowerCase()).equalsIgnoreCase("caster") && !isCaster(sender)) {
                $.say("You must be a Caster to use that command!");
                return;
            } else if ($.inidb.get("commandperm", command.toLowerCase()).equalsIgnoreCase("mod") && !isMod(sender)) {
                $.say("You must be a Moderator to use that command!");
                return;
            } else if ($.inidb.get("commandperm", command.toLowerCase()).equalsIgnoreCase("admin") && !isAdmin(sender)) {
                $.say("You must be an Administrator to use that command!");
                return;
            }
        }
        
        var messageCommand = $.inidb.get('command', command.toLowerCase());
        
        for (var i = 0; i < args.length; i++) {
            while (messageCommand.contains('(' + (i + 1) + ')')) {
                messageCommand = messageCommand.replace('(' + (i + 1) + ')', args[i]);
            }
        }
        
        while (messageCommand.contains('(sender)')) {
            messageCommand = messageCommand.replace('(sender)', sender);
        }
        
        if (messageCommand.contains('(count)')) {
            $.inidb.incr('commandcount', command.toLowerCase(), 1);
        }
        
        while (messageCommand.contains('(count)')) {
            messageCommand = messageCommand.replace('(count)', $.inidb.get('commandcount', command.toLowerCase()));
        }
        
        $.say(messageCommand);
    }
});

$.registerChatCommand("addcom");
$.registerChatCommand("delcom");
$.registerChatCommand("modcom");
$.registerChatCommand("permcom");
$.registerChatCommand("helpcom");

var commands = $.inidb.GetKeyList("command", "");

if ($.array.contains(commands, "commands")) {
    $.inidb.del("command", "commands");
    commands = $.inidb.GetKeyList("command", "");
}

for (var i = 0; i < commands.length; i++) {
    $.registerCustomChatCommand(commands[i]);
}