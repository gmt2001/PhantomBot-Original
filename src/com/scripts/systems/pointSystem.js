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
            
            var timeString = "";
            
            var time = $.inidb.get('time', points_user);

            if (points == null) points = 0;
            if (time == null) time = 0;

            var minutes = int((time / 60) % 60);
            var hours = int(time / 3600);

            timeString = " -- [";
            if (hours != 0) timeString += " " + hours + " Hrs";
            else if (minutes != 0) timeString += " " + minutes + " Mins";
            else timeString += " " + minutes + " Mins";
            timeString += " ]";

            $.say($.username.resolve(points_user) + " has " + int(points) + " " + $.pointname + timeString);
        }
    }
    
    if (command.equalsIgnoreCase("pointgain")) {
        if (args.length >= 2) {
            if (!$.isAdmin(sender)) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }
            
            action = args[0];
            if (action.equalsIgnoreCase("set")) {
                $.inidb.set('settings', 'pointgain', args[1]);
                $.pointgain = parseInt(args[1]);
                
                $.say("Set! Everyone will now earn " + $.pointgain + " " + $.pointname + " every 10 minutes.");
            } 

        } else {
            $.say("Current point gain for everyone is  " + $.pointgain + " " + $.pointname + " for every 10 minutes. Change it with !pointgain set <amount>");
        }
    }
    
    if (command.equalsIgnoreCase("pointbonus")) {
        if (args.length >= 2) {
            if (!$.isAdmin(sender)) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }
            
            action = args[0];
            if (action.equalsIgnoreCase("set")) {
                $.inidb.set('settings', 'pointbonus', args[1]);
                $.pointbonus = parseInt(args[1]);
                
                $.say("Set! Everyone will now earn " + $.pointbonus + " " + $.pointname + " per group level.");
            } 

        } else {
            $.say("Current point bonus per group level is  " + $.pointbonus + " " + $.pointname + ". Change it with !pointbonus set <amount>");
        }
    }
    
    if (command.equalsIgnoreCase("pointinterval")) {
        if (args.length >= 2) {
            if (!$.isAdmin(sender)) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }
            
            action = args[0];
            if (action.equalsIgnoreCase("set")) {
                $.inidb.set('settings', 'pointinterval', args[1]);
                $.pointinterval = parseInt(args[1]);
                
                $.say("Set! Interval for points gain is now " + $.pointinterval + " minutes.");
            } 

        } else {
            $.say("Current interval for points gain is  " + $.pointinterval + " minutes. Change it with !pointinterval set <minutes>");
        }
    }
    
    if (command.equalsIgnoreCase("pointsname")) {
        if(args.length >= 1) {
            if (!$.isAdmin(sender)) {
                $.say("You must be an Administrator to use this command " + username + ".");
                return;
            }
            
            var name = argsString;

            $.inidb.set('settings', 'pointname', name);
            $.say("Points renamed to '" + name + "'!");

            $.pointname = name;
        } else {
            $.say("The current name for points is '" + $.pointname + "'!");
        } 
    }
});

$.registerChatCommand("points");
$.registerChatCommand("points help");
$.registerChatCommand("pointgain");
$.registerChatCommand("pointbonus");
$.registerChatCommand("pointinterval");
$.registerChatCommand("pointsname");

$.setInterval(function() {
    if (!$.moduleEnabled("./systems/pointSystem.js")) {
        return;
    }
    
    if ($.lastpointinterval == null || $.lastpointinterval == undefined) {
        $.lastpointinterval = System.currentTimeMillis();
        return;
    }
    
    if ($.lastpointinterval + ($.pointinterval * 60 * 1000) >= System.currentTimeMillis()) {
        return;
    }
    
    for (var i = 0; i < $.users.length; i++) {
        var nick = $.users[i][0].toLowerCase();
        var amount = $.pointgain;
        
        amount = amount + ($.pointbonus * $.getUserGroupId(nick));
        
        $.inidb.incr('points', nick, amount);
    }
    
    $.lastpointinterval = System.currentTimeMillis();
}, 1000);