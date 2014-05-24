var announceFollows = false;

$.on('twitchFollow', function(event) {
    var follower = event.getFollower().toLowerCase();
    var username = $.username.resolve(follower);

    var followed = $.inidb.get('followed', follower);
    
    if (followed == null || followed == undefined || followed.isEmpty()) {
        $.inidb.set('followed', follower, 1);
        
        if (announceFollows) {
            var s = $.inidb.get('settings', 'followmessage');
            
            if (s == null || s == undefined || s.length() == 0) {
                if ($.moduleEnabled("./systems/pointSystem.js")) {
                    s = "Thanks for the follow <name>! +100 <pointname>!";
                } else {
                    s = "Thanks for the follow <name>!";
                }
            }
            
            while (s.indexOf("<name>") != -1) {
                s.replace("<name>", username);
            }
            
            if ($.moduleEnabled("./systems/pointSystem.js")) {
                while (s.indexOf("<pointname>") != -1) {
                    s.replace("<pointname>", username);
                }
            }
            
            $.say("Thanks for the follow " + username + "! +100 " + $.pointname + "!");
        }
        
        $.inidb.incr('points', follower, 100);
    } else if (followed.equalsIgnoreCase("0")) {
        $.inidb.set('followed', follower, 1);
    }
});

$.on('twitchUnfollow', function(event) {
    var follower = event.getFollower().toLowerCase();
    var username = $.username.resolve(follower);

    var followed = $.inidb.get('followed', follower);
    
    if (followed == null || followed == undefined || followed.isEmpty()) {
        return;
    }
    
    if (followed.equalsIgnoreCase("1")) {
        $.inidb.set('followed', follower, 0);
    }
});

$.on('twitchFollowsInitialized', function(event) {
    announceFollows = true;
});

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    
    if (command.equalsIgnoreCase("followmessage")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command, " + username + "!");
            return;
        }
        
        if (argsString.length() == 0) {
            $.say("The current new follower message is: " + $.inidb.get('settings', 'followmessage'));
            
            var s = "To change it use '!followmessage <message>'. You can also add the string '<name>' to put the followers name";
            
            if ($.moduleEnabled("./systems/pointSystem.js")) {
                s += " and '<pointname>' to put the name of your points";
            }
            
            $.say(s);
        } else {
            $.inidb.set('settings', 'followmessage', argsString);
        }
    }
});

$.registerChatCommand("followmessage");