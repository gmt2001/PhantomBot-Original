$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender).toLowerCase();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if (command.equalsIgnoreCase("points")) {
        if (args.length == 3) {
            if (!$.botaccount == $.username.resolve(sender) || !$.hasGroupByName(sender, "Administrator")) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }

            var action = args[0];
            var username = args[1].toLowerCase();
            var points = int(args[2]);

            if (action.equalsIgnoreCase("give") || action.equalsIgnoreCase("add")) {
                $.db.incr('points', username, points);
                $.say(points + " " + $.pointname + " was sent to " + $.username.resolve(username) + ".");
            }
            if (action.equalsIgnoreCase("withdraw")) {
                $.db.decr('points', username, points);
                $.say(points + " " + $.pointname + " was withdrawn from " + $.username.resolve(username) + ".");
            }
            if (action.equalsIgnoreCase("set")) {
                $.db.set('points', username, points);
                $.say($.username.resolve(username) + "'s " + $.pointname + " was set to " + points + " " + $.pointname + ".");
            }

        } else {
            var points_user = sender;
            if (args.length == 1) {
                points_user = args[0].toLowerCase();
            }

            var points = $.db.get('points', points_user);
            var time = $.db.get('time', points_user);

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

    var messageCommand = $.db.get('command', command.toLowerCase());
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

$.setInterval(function() {
    var nicks = $.channel.getNicks();
    $.list.forEach(nicks, function(i, nick) {
        nick = nick.toLowerCase();
        $.db.incr('time', nick, 60);
        if ($.hasGroupByName(nick, "Viewer") && $.db.get('time', nick) == 12600 * 10) {
            $.setUserGroupByName(nick, "Regular");
            $.say($.username.resolve(nick) + " leveled up to a Regular! Congratulations and thanks for staying with us!");
            $.db.set("bool", nick + "_greeting_enabled", "true");
            if (!$.db.exists("string", nick + "_greeting_prefix")) {
                $.db.set("string", nick + "_greeting_prefix", "I welcome ");
                $.db.set("string", nick + "_greeting_suffix", " to the channel!");
            }
        }
        // Timer needed and resets every 30 days. Don't know how to replace $.db.get('time' with this.
        /*if ($.db.get('time', nick) >= 2592000 * 1000 && $.hasGroupByName(nick, "DOOD")) {
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
            $.db.incr('points', nick, amount);
        });

    /* } else {
        $.list.forEach(nicks, function(i, nick) {
            $.db.incr('points', nick, 2);
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