$.on('ircChannelMessage', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var message = event.getMessage();

    println(username + ": " + message);
});

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
    var args;
    var points;
    var commandString;
    var message;
    var cmd;
    
    
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(args.length >= 2) {
        if(command.equalsIgnoreCase("addcom")) {
            if (!$.allowNonModCommands && !$.isMod(sender)) {
                $.say("You must be a Moderator to use that command!");
                return;
            }
            
            if ($.getUserGroupId(sender) == 0) {
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
            
            $.registerChatCommand(commandString);
            
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
    
    if(command.equalsIgnoreCase("helpcom")) {
        $.say("Usage: !addcom <command name> <message to say>, !delcom <command name>, !modcom");
        $.say("When using !addcom, you can put the text '<sender>' to have the name of any user who says the new command inserted into it. ex. '!addcom hello Hello there <sender>!'");
    }
    
    var messageCommand = $.inidb.get('command', command.toLowerCase());
    if (messageCommand) {
        for (var i = 0; i < args.length; i++) {
            while (messageCommand.contains('<' + (i + 1) + '>')) {
                messageCommand = messageCommand.replace('<' + (i + 1) + '>', args[i]);
            }
        }
        while (messageCommand.contains('<sender>')) {
            messageCommand = messageCommand.replace('<sender>', sender);
        }
        $.say(messageCommand);
    }
});

$.registerChatCommand("addcom");
$.registerChatCommand("delcom");
$.registerChatCommand("modcom");
$.registerChatCommand("helpcom");