$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender).toLowerCase();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    var action;
    var time;
        
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(command.equalsIgnoreCase("time")) {
        if(args.length == 3) {
            if (!$.isAdmin(sender)) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }
			
            action = args[0];
            username = args[1].toLowerCase();
            time = int(args[2]);

            if(action.equalsIgnoreCase("give")) {
                $.logEvent("timeSystem.js", 28, $.username.resolve(sender) + " gave " + time + " time to " + username);
                $.inidb.incr('time', username, time);
                $.say(time + " seconds was added towards " + $.username.resolve(username) + ".");
            } else if(action.equalsIgnoreCase("take")) {
                $.logEvent("timeSystem.js", 32, $.username.resolve(sender) + " took " + time + " time from " + username);
                $.inidb.decr('time', username, time);
                $.say($.username.resolve(username) + "'s time was deducted by " + time + " seconds.");
            } else if(action.equalsIgnoreCase("set")) {
                $.logEvent("timeSystem.js", 36, $.username.resolve(sender) + " set " + username + "'s time to " + time);
                $.inidb.set('time', username, time);
                $.say($.username.resolve(username) + "'s time was set to " + time + " seconds.");
            } else {
                $.say("Usage: !time give <username> <amount in seconds>, !time take <username> <amount in seconds>, !time set <username> <amount in seconds>");
            }	
        } else {
            if (!argsString.isEmpty() && args[0].equalsIgnoreCase("help")) {
                $.say("Usage: !time give <username> <amount in seconds>, !time take <username> <amount in seconds>, !time set <username> <amount in seconds>");
                return;
            }
            
            var points_user = sender;
            if(args.length == 1) {
                points_user = args[0].toLowerCase();
            }
			
            var points = $.inidb.get('points', points_user);
            time = $.inidb.get('time', points_user);
			
            if(points == null) points = 0;
            if(time == null) time = 0;
			
            var time2 = new Date; 
            var minutes = int((time / 60) % 60);
            var hours = int(time / 3600);

            var timeString = "";
            if(hours != 0) timeString += " " + hours + " Hrs";
            else if(minutes != 0) timeString += " " + minutes + " Mins";
            else timeString += " " + minutes + " Mins";
			
            $.say($.username.resolve(points_user) + " has been in this channel for a total of " + hours + " hours & " + minutes + " minutes.");
        }
    }
});

$.registerChatCommand("./systems/timeSystem.js", "time");
$.registerChatCommand("./systems/timeSystem.js", "time help");



$.timer.addTimer("./systems/timeSystem.js", "addtime", true, function() {
    if (!$.moduleEnabled("./systems/timeSystem.js")) {
        return;
    }
    
    for (var i = 0; i < $.users.length; i++) {
        var nick = $.users[i][0].toLowerCase();
        
        $.inidb.incr('time', nick, 60);
        
        if ($.getUserGroupId(nick) == 0 && parseInt($.inidb.get('time', nick)) >= 12600 * 10) {
            $.setUserGroupById(nick, 1);
            $.say($.username.resolve(nick) + " leveled up to a " + $.getGroupNameById(1) + "! Congratulations and thanks for staying with us!");
        }
    }
}, 60 * 1000);
