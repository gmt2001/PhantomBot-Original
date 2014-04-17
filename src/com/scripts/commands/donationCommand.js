$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var top = $.readFile ("donations/topDonator.txt");
    var recent = $.readFile ("donations/mostRecentDonator.txt");
    var list = $.readFile ("donations/donatorList.txt");

    if (command.equalsIgnoreCase("topd")) {
        $.say(top);
    }

    if (command.equalsIgnoreCase("recentd")) {
        $.say(recent);
    }

    if (command.equalsIgnoreCase("dlist")) {
        $.say(list);
    }
});

$.registerChatCommand("topd");
$.registerChatCommand("recentd");
$.registerChatCommand("dlist");