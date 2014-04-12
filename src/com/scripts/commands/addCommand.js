$.on('ircChannelMessage', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var message = event.getMessage();

    println(username + ": " + message);
});


$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(args.length >= 2) {
        if(command.equalsIgnoreCase("addcom")) {
            if (!$.hasGroupByName(sender, "Regular")) {
                var points = $.db.get('points', sender);
                if(points == null) points = 0;
                else points = int(points);
            
                if(points < 8000) {
                    $.say($.username.resolve(sender) + ", " + " you need 8,000 " + $.pointname + " to create that command, dood!");
                    return;
                }

                $.db.decr('points', sender, 8000);

                $.say(username + ", paid 8,000 " + $.pointname + " to add a new command, doods!");
            } 
            var commandString = args[0].toLowerCase();
            var message = argsString.substring(argsString.indexOf(commandString) + commandString.length() + 1);
            $.db.set('command', commandString, message);
            var cmd = $.db.get('command', "commands");
            if (!cmd.contains(commandString)) {
                $.db.set('command', "commands", cmd + " - !" + commandString);
            }
            $.say($.username.resolve(sender) + ", the command !" + commandString + " was successfully created, dood!");
            return;
        }

    }
    if(args.length >= 1) {
        if(command.equalsIgnoreCase("delcom")) {
            if (!$.hasGroupByName(sender, "Administrator")) {
                var points = $.db.get('points', sender);
                if(points == null) points = 0;
                else points = int(points);
            } 
            var commandString = args[0].toLowerCase();
            $.db.del('command', commandString);
            var cmd = $.db.del('command', commandString);
            $.say($.username.resolve(sender) + ", the command !" + commandString + " was successfully removed, dood!");
            return;
        }
    }
	
});
