$.on('twitchFollow', function(event) {
    var follower = event.getFollower().toLowerCase();
    var username = $.username.resolve(follower);
    var followed = $.inidb.get('followed', follower);
    
    if (followed == null || followed == undefined || followed.isEmpty()) {
        $.inidb.set('followed', follower, 1);
        
        if ($.announceFollows) {
            var s = $.inidb.get('settings', 'followmessage');
            var p = parseInt($.inidb.get('settings', 'followreward'));
            
            if (s == null || s == undefined || s.length() == 0) {
                if ($.moduleEnabled("./systems/pointSystem.js")) {
                    s = "Thanks for the follow (name)! +(reward) (pointname)!";
                } else {
                    s = "Thanks for the follow (name)!";
                }
            }
            
            if (isNaN(p)) {
                p = 100;
            }
            
            while (s.indexOf('(name)') != -1) {
                s = s.replace('(name)', username);
            }
            
            if ($.moduleEnabled("./systems/pointSystem.js")) {
                while (s.indexOf('(pointname)') != -1) {
                    s = s.replace('(pointname)', $.pointname);
                }
                
                while (s.indexOf('(reward)') != -1) {
                    s = s.replace('(reward)', p);
                }
            }

            $.say(s);
        }
        
        if ($.moduleEnabled("./systems/pointSystem.js") && p > 0) {
            $.inidb.incr('points', follower, p);
        }
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
    println(">>Enabling new follower announcements");
    
    $.announceFollows = true;
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
            
            var s = "To change it use '!followmessage <message>'. You can also add the string '(name)' to put the followers name";
            
            if ($.moduleEnabled("./systems/pointSystem.js")) {
                s += ", '(reward)' to put the number of points received for following, and '(pointname)' to put the name of your points";
            }
            
            $.say(s);
        } else {
            $.inidb.set('settings', 'followmessage', argsString);
            
            $.say("New follower message set!");
        }
    }
    
    if (command.equalsIgnoreCase("followreward")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command, " + username + "!");
            return;
        }
        
        if (argsString.length() == 0) {
            if ($.inidb.exists('settings', 'followreward')) {
                $.say("The current new follower reward is " + $.inidb.get('settings', 'followreward') + " points! To change it use '!followreward <reward>'");
            } else {
                $.say("The current new follower reward is 100 points! To change it use '!followreward <reward>'");
            }
        } else {
            if (!isNaN(argsString) || parseInt(argsString) < 0) {
                $.say("Please put a valid reward greater than or equal to 0!");
                return;
            }
            
            $.inidb.set('settings', 'followreward', argsString);
            
            $.say("New follower reward set!");
        }
    }
    
    if (command.equalsIgnoreCase("followcount")) {
        var keys = $.inidb.GetKeyList("followed", "");
        var count = 0;
        
        for (i = 0; i < keys.length; i++) {
            if ($.inidb.get("followed", keys[i]).equalsIgnoreCase("1")) {
                count++;
            }
        }
        
        $.say("There are currently " + count + " followers!");
    }
});

$.registerChatCommand("followmessage");
$.registerChatCommand("followreward");
$.registerChatCommand("followcount");