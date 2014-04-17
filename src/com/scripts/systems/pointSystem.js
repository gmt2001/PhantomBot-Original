$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender).toLowerCase();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    var action;
    var points;
    
    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if (command.equalsIgnoreCase("points")) {
        if (args.length == 3) {
            if (!$.isAdmin(sender)) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }

            action = args[0];
            username = args[1].toLowerCase();
            points = int(args[2]);

            if (action.equalsIgnoreCase("give")) {
                $.inidb.incr('points', username, points);
                $.say(points + " " + $.pointname + " was sent to " + $.username.resolve(username) + ".");
            } else if (action.equalsIgnoreCase("take")) {
                $.inidb.decr('points', username, points);
                $.say(points + " " + $.pointname + " was withdrawn from " + $.username.resolve(username) + ".");
            } else if (action.equalsIgnoreCase("set")) {
                $.inidb.set('points', username, points);
                $.say($.username.resolve(username) + "'s " + $.pointname + " was set to " + points + " " + $.pointname + ".");
            } else {
                $.say("Usage: !points give <username> <amount>, !points take <username> <amount>, !points set <username> <amount>");
            }
        } else {
            if (!argsString.isEmpty() && args[0].equalsIgnoreCase("help")) {
                $.say("Usage: !points give <username> <amount>, !points take <username> <amount>, !points set <username> <amount>");
                return;
            }
            
            var points_user = sender;
            if (args.length == 1) {
                points_user = args[0].toLowerCase();
            }

            points = $.inidb.get('points', points_user);
            var time = $.inidb.get('time', points_user);

            if (points == null) points = 0;
            if (time == null) time = 0;

            var seconds = int(time % 60);
            var minutes = int((time / 60) % 60);
            var hours = int(time / 3600);

            var timeString = "";
            if (hours != 0) timeString += " " + hours + " Hrs";
            else if (minutes != 0) timeString += " " + minutes + " Mins";
            else timeString += " " + minutes + " Mins";

            $.say($.username.resolve(points_user) + " has " + int(points) + " " + $.pointname + " -- [" + timeString + " ]");
        }
    }

    if (command.equalsIgnoreCase("users")) {
        $.say($.channel.getNicks());
    }
});

$.registerChatCommand("points");
$.registerChatCommand("points help");
$.registerChatCommand("users");

$.setInterval(function() {
    var nicks = $.channel.getNicks();
    $.list.forEach(nicks, function(i, nick) {
        nick = nick.toLowerCase();
        $.inidb.incr('time', nick, 60);
        if ($.hasGroupByName(nick, "Viewer") && $.inidb.get('time', nick) == 12600 * 10) {
            $.setUserGroupByName(nick, "Regular");
            $.say($.username.resolve(nick) + " leveled up to a Regular! Congratulations and thanks for staying with us!");
            $.inidb.set("bool", nick + "_greeting_enabled", "true");
            if (!$.inidb.exists("string", nick + "_greeting_prefix")) {
                $.inidb.set("string", nick + "_greeting_prefix", "I welcome ");
                $.inidb.set("string", nick + "_greeting_suffix", " to the channel!");
            }
        }
    // Timer needed and resets every 30 days. Don't know how to replace $.inidb.get('time' with this.
    /*if ($.inidb.get('time', nick) >= 2592000 * 1000 && $.hasGroupByName(nick, "DOOD")) {
            $.setUserGroupByName(nick, "Prinny"); 
        } */
    });

}, 1000 * 60);

$.setInterval(function() {
    var nicks = $.channel.getNicks();
    // if ($.channelStatus.equals("online")) {
    $.list.forEach(nicks, function(i, nick) {
        var amount = 1;
        if ($.hasGroupByName(nick, "Regular")) amount = 2;
        if ($.hasGroupByName(nick, "Prinny")) amount = 3;
        if ($.hasGroupByName(nick, "Golden")) amount = 4;
        if ($.hasGroupByName(nick, "Burning")) amount = 5;
        $.inidb.incr('points', nick, amount);
    });

/* } else {
        $.list.forEach(nicks, function(i, nick) {
            $.inidb.incr('points', nick, 2);
        });
    }  */
}, 600000);

/* $.setInterval(function() {
    var status = $.twitch.getStream("phantomindex");
    if (status.isNull("stream")) {
        $.channelStatus = "offline";
    } else {
        $.channelStatus = "online";
    }
}, 3600000); */