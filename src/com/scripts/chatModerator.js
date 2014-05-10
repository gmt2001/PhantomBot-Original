var ircPrefix = ".";
var autoBanPhrases = new Array();

function banUserFor (user, time) {
    $.bancache.addUser (user, time);
    $.bancache.syncToFile ("bannedUsers.bin");
    
    banUser(user);
}

function banUser (user) {
    $.say (ircPrefix + "ban " + user);
    timeoutUser(user, 2);
}

function unbanUser (user) {
    $.say (ircPrefix + "unban " + user);
    $.bancache.removeUser (user);
}
 
function kickUser (user) {
    $.say (ircPrefix + "kick " + user);
}

function autoPurgeUser (user) {
    var ban = false;
    var count = $.sinbin.get (user);
    
    if (count != null) {
        count = count.intValue ();
        ban = count >= 2;
        $.sinbin.put (user, count + 1);
    } else {
        $.sinbin.put (user, 1);
    }
    
    if (ban) {
        $.sinbin.put (user, 0);
        banUserFor (user, 1);
    } else {
        timeoutUser (user, 2);
    }
}
 
function timeoutUser (user, fortime) {
    $.say (ircPrefix + "timeout " + user + " " + fortime);
}

//var linkson = $.inidb.exists("bool", "linkson");
$.bancache.loadFromFile ("bannedUsers.bin");

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs ();
	
    if (command.equalsIgnoreCase("chat") && username.equalsIgnoreCase($.botname)) {
        $.say (args [0]);
    } else if (command.equalsIgnoreCase("purge")) {
        if ($.isMod(sender)) {
            if (args.length == 1) {
                timeoutUser (args [0], 2);
            } else {
                $.say ("You must specify a user to purge")
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }
		
    } else if (command.equalsIgnoreCase("timeout")) {
        if ($.isMod(sender)) {
            if (args.length == 1) {
                timeoutUser (args [0], 600);
            } else {
                $.say ("You must specify a user to timeout")
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }
		
    } else if (command.equalsIgnoreCase("links")) {
		
        /*if ($.isMod(sender)) {
			
			if (args [0].equalsIgnoreCase("on")) {
				if (!linkson) {
					$.inidb.set("bool", "linkson", "true");
					linkson = true;
					$.say("Links enabled");
				} else {
					$.say("Links already enabled");
				}
			} else {
				if (linkson) {
					$.inidb.del("bool", "linkson");
					linkson = false;
					$.say("Links disabled");
				} else {
					$.say("Links already disabled");
				}
			}
			
		} else {
			$.say ("That is a mod only command")
		}*/
        $.say ("That command is currently disabled")
		
    } else if (command.equalsIgnoreCase("ban")) {
		
        if ($.isMod(sender)) {
            if (args.length == 2) {
                var time = parseInt (args [1]);
                if (time <= 0) {
                    $.say (time + " is not a valid amount of time");
                }
                banUserFor (args [0], time * 60 * 60);
                if (time != 1) {
                    $.say (args [0] + " banned for " + time + " hours");
                } else {
                    $.say (args [0] + " banned for 1 hour");
                }
            } else {
                banUser (args [0]);
                $.say (args [0] + " banned indefinitely");
            }
			
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }
		
    } else if (command.equalsIgnoreCase("unban")) {
		
        if ($.isMod(sender)) {
			
            unbanUser (args [0]);
            $.say (args [0] + " is no longer banned");
			
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }	
    } else if (command.equalsIgnoreCase("autoban")) {
        if ($.isMod(sender)) {
            if (argsString.length() > 0) {
                autoBanPhrases.push(argsString);
            
                var num_phrases = $.inidb.get("autobanphrases", "num_phrases");
                $.inidb.set("autobanphrases", "phrase_" + num_phrases, argsString);
                $.inidb.incr("autobanphrases", "num_phrases", 1);
            
                $.say("Added a phrase to the autoban list! This can only be undone manually!");
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }	
    }
});

$.on('ircChannelMessage', function(event) {
    var sender = event.getSender().toLowerCase();
    var chatName = $.username.resolve(sender);
    var username = chatName.toLowerCase();
    var message = event.getMessage().toLowerCase();
	
    var caps = event.getCapsCount ();
    var capsRatio = (caps*1.0)/message.length ();
	
    if (capsRatio > 0.30 && message.length () > 70) {
        autoPurgeUser (username);
        $.say(chatName + " -> that was way too many caps! [Warning]");
    } /*else if (linkson == false) {
		if (event.isLink () && $.getUserGroupId (sender) < $.getGroupIdByName ("mod")) {
			timeoutUser (username, 2);
			$.say("Woah there " + chatName + ", posting links is currently disabled");
		}
	}*/
    var i;

    for (i = 0; i < autoBanPhrases.length; i++) {
        if (message.indexOf(autoBanPhrases[i].toLowerCase()) != -1 && !$.isMod(sender)) {
            banUser(username);
            $.say (username + " auto-banned indefinitely for using banned phrase #" + i);
            return;
        }
    }
});

$.registerChatCommand("purge");
$.registerChatCommand("timeout");
$.registerChatCommand("links");
$.registerChatCommand("ban");
$.registerChatCommand("unban");
$.registerChatCommand("autoban");

$.setInterval(function() {
    var reformed = $.bancache.getReformedUsers ();
    var l = reformed.length;
    
    for (var i = 0; i < l; ++i) {
        unbanUser (reformed[i]);
    }
    
    $.bancache.syncToFile ("bannedUsers.bin");
}, 60);

var num_phrases = parseInt($.inidb.get("autobanphrases", "num_phrases"));
var i;

for (i = 0; i < num_phrases; i++) {
    autoBanPhrases.push($.inidb.get("autobanphrases", "phrase_" + i));
}
