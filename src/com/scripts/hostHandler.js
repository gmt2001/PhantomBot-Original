if ($.hostlist == null || $.hostlist == undefined) {
    $.hostlist = new Array();
}

if ($.hosttimeout == null || $.hosttimeout == undefined) {
    $.hosttimeout = {};
}

var hosttimeout = 60 * 60 * 1000;

$.on('twitchHosted', function(event) {
    var username = $.username.resolve(event.getHoster());
    
    if ($.announceHosts && $.moduleEnabled("./hostHandler.js")
        && ($.hosttimeout[event.getHoster()] == null || $.hosttimeout[event.getHoster()] == undefined
            || $.hosttimeout[event.getHoster()] < System.currentTimeMillis())) {
        var s = $.inidb.get('settings', 'hostmessage');
            
        if (s == null || s == undefined || $.strlen(s) == 0) {
            s = "Thanks for the host (name)!";
        }
            
        while (s.indexOf('(name)') != -1) {
            s = s.replace('(name)', username);
        }

        $.say(s);
    }
    
    $.hosttimeout[event.getHoster()] = System.currentTimeMillis() + hosttimeout;
    
    $.hostlist.push(username);
});

$.on('twitchUnhosted', function(event) {
    var username = $.username.resolve(event.getHoster());
    
    $.hosttimeout[event.getHoster()] = System.currentTimeMillis() + hosttimeout;
    
    for (var i = 0; i < $.hostlist.length; i++) {
        if ($.hostlist[i].equalsIgnoreCase(username)) {
            $.hostlist.splice(i, 1);
            break;
        }
    }
});

$.on('twitchHostsInitialized', function(event) {
    println(">>Enabling new hoster announcements");
    
    $.announceHosts = true;
});

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    
    if (command.equalsIgnoreCase("hostmessage")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command, " + username + "!");
            return;
        }
        
        if ($.strlen(argsString) == 0) {
            $.say("The current new hoster message is: " + $.inidb.get('settings', 'hostmessage'));
            
            var s = "To change it use '!hostmessage <message>'. You can also add the string '(name)' to put the hosters name";
            
            $.say(s);
        } else {
            $.logEvent("hostHandler.js", 73, username + " changed the new hoster message to: " + argsString);
            
            $.inidb.set('settings', 'hostmessage', argsString);
            
            $.say("New hoster message set!");
        }
    }
    
    if (command.equalsIgnoreCase("hostcount")) {
        $.say("This channel is currently being hosted by " + $.hostlist.length + " channels!");
    }
    
    if (command.equalsIgnoreCase("hostlist")) {
        var m = "";
        
        for (var b = 0; b < Math.ceil($.hostlist.length / 30); b++) {
            m = "";
            
            for (var i = (b * 30); i < Math.min($.hostlist.length, ((b + 1) * 30)); i++) {
                if ($.strlen(m) > 0) {
                    m += ", ";
                }
            
                m += $.hostlist[i];
            }
        
            if (b == 0) {
                $.say("This channel is currently being hosted by the following " + $.hostlist.length + " channels: " + m);
            } else {
                $.say(">>" + m);
            }
        }
    }
});

$.registerChatCommand("./hostHandler.js", "hostmessage", "admin");
$.registerChatCommand("./hostHandler.js", "hostcount");
$.registerChatCommand("./hostHandler.js", "hostlist");
