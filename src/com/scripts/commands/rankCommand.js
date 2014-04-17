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
            if (!argsString.isEmpty()) {
                $.say(argsString + "'s rank is currently " + $.getUserGroupName(argsString) + ", dood.");
            } else {
                $.say(username + ", your rank is currently " + $.getUserGroupName(username) + ", dood.");
            }
        }
    }
});

$.registerChatCommand("rank");