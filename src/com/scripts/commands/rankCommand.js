$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(args.length >= 1) {
        if(command.equalsIgnoreCase("rank")) {
            if (!$.hasGroupByName(username, "Viewer")) {
                $.say($.username.resolve(sender) + ", " + $.getUserGroupName(username) + "s aren't allowed access to this command! Bleh only.");
                return;
                
            } else {
                $.say(username + ", your rank is currently " + $.getUserGroupName(username) + ", dood.");
            }
            var subCommand = args[0];
 
            if (subCommand.equalsIgnoreCase(user)) {
                $.say(username + ", your rank is currently " + $.getUserGroupName(username) + ", dood.");
            }
        }
    }
});