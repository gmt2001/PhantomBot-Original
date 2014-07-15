$.on('twitchSubscribe', function(event) {
    var subscriber = event.getSubscriber().toLowerCase();
    var username = $.username.resolve(subscriber);
    var subscribed = $.inidb.get('subscribed', subscriber);
    
    if (subscribed == null || subscribed == undefined || subscribed.isEmpty()) {
        $.inidb.set('subscribed', subscriber, 1);
        
        if ($.announceSubscribes) {
            var s = $.inidb.get('settings', 'subscribemessage');
            var p = parseInt($.inidb.get('settings', 'subscribereward'));
            
            if (s == null || s == undefined || s.length() == 0) {
                if ($.moduleEnabled("./systems/pointSystem.js")) {
                    s = "Thanks for the subscription (name)! +(reward) (pointname)!";
                } else {
                    s = "Thanks for the subscription (name)!";
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
            $.inidb.incr('points', subscriber, p);
        }
    } else if (followed.equalsIgnoreCase("0")) {
        $.inidb.set('subscribed', subscriber, 1);
    }
});

$.on('twitchUnsubscribe', function(event) {
    var subscriber = event.getSubscriber().toLowerCase();
    var username = $.username.resolve(subscriber);

    var subscribed = $.inidb.get('subscribed', subscriber);
    
    if (subscribed == null || subscribed == undefined || subscribed.isEmpty()) {
        return;
    }
    
    if (subscribed.equalsIgnoreCase("1")) {
        $.inidb.set('subscribed', subscriber, 0);
    }
});

$.on('twitchSubscribesInitialized', function(event) {
    println(">>Enabling new subscriber announcements");
    
    $.announceSubscribes = true;
});

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    
    if (command.equalsIgnoreCase("subscribemessage")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command, " + username + "!");
            return;
        }
        
        if (argsString.length() == 0) {
            $.say("The current new subscriber message is: " + $.inidb.get('settings', 'subscribemessage'));
            
            var s = "To change it use '!subscribemessage <message>'. You can also add the string '(name)' to put the subscribers name";
            
            if ($.moduleEnabled("./systems/pointSystem.js")) {
                s += ", '(reward)' to put the number of points received for subscribing, and '(pointname)' to put the name of your points";
            }
            
            $.say(s);
        } else {
            $.inidb.set('settings', 'subscribemessage', argsString);
        }
    }
    
    if (command.equalsIgnoreCase("subscribereward")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command, " + username + "!");
            return;
        }
        
        if (argsString.length() == 0) {
            if ($.inidb.exists('settings', 'subscribereward')) {
                $.say("The current new subscriber reward is " + $.inidb.get('settings', 'subscribereward') + " points! To change it use '!subscribereward <reward>'");
            } else {
                $.say("The current new subscriber reward is 100 points! To change it use '!subscribereward <reward>'");
            }
        } else {
            if (!isNaN(argsString) || parseInt(argsString) < 0) {
                $.say("Please put a valid reward greater than or equal to 0!");
                return;
            }
            
            $.inidb.set('settings', 'subscribereward', argsString);
        }
    }
    
    if (command.equalsIgnoreCase("subscribecount")) {
        var keys = $.inidb.GetKeyList("subscribed", "");
        var count = 0;
        
        for (i = 0; i < keys.length; i++) {
            if ($.inidb.get("subscribed", keys[i]).equalsIgnoreCase("1")) {
                count++;
            }
        }
        
        $.say("There are currently " + count + " subscribers!");
    }
});

$.registerChatCommand("subscribemessage");
$.registerChatCommand("subscribereward");
$.registerChatCommand("subscribecount");

$.setInterval(function() {
    if (!$.moduleEnabled("./subscribeHandler.js")) {
        $.subscribers.doRun(false);
    } else {
        $.subscribers.doRun(true);
    }
}, 1000 * 60);