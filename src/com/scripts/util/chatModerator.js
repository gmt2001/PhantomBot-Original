var ircPrefix = ".";
var autoBanPhrases = new Array();
var permitList = new Array();
var sinbin = new Array();
var sinresettime = 10 * 60 * 1000;
var maxsin = 2;
var sinban = 10 * 60;

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
    var idx = -1;
    var count;
    var lastincrease;
    
    for (var i = 0; i < sinbin.length; i++) {
        if (user.equalsIgnoreCase(sinbin[i][0])) {
            idx = i;
        }
    }
    
    if (idx == -1) {
        count = 0;
        lastincrease = System.currentTimeMillis();
    } else {
        count = sinbin[idx][1];
        lastincrease = sinbin[idx][2];
        
        if (lastincrease + sinresettime < System.currentTimeMillis()) {
            count = 0;
        }
        
        lastincrease = System.currentTimeMillis();
    }
    
    count++;
    
    if (count > maxsin) {
        ban = true;
    }
    
    if (ban) {
        banUserFor (user, sinban);
        $.say(user + " was banned for 10 minutes for failing to heed auto-moderation warnings.");
    } else {
        timeoutUser (user, 2);
    }
    
    if (idx == -1) {
        sinbin.push(new Array(user.toLowerCase(), count, lastincrease));
    } else {
        sinbin[idx][1] = count;
        sinbin[idx][2] = lastincrease;
    }
}
 
function timeoutUser (user, fortime) {
    $.say (ircPrefix + "timeout " + user + " " + fortime);
}

var linkson = $.inidb.get("settings", "linkson") == "1";
$.bancache.loadFromFile ("bannedUsers.bin");

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs ();
	
    if (command.equalsIgnoreCase("chat") && username.equalsIgnoreCase($.botname)) {
        $.say (argsString);
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
    } else if (command.equalsIgnoreCase("permit")) {
        if ($.isMod(sender)) {
            if (argsString.length() > 0 && linkson == false) {
                permitList.push(new Array(argsString, System.currentTimeMillis() + (60 * 1000)));
                
                $.say (argsString + " is permitted to post a link during the next 60 seconds!");
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }
    } else if (command.equalsIgnoreCase("links")) {
        if ($.isMod(sender) || args.length == 0) {
            if (args.length == 0) {
                var endis = "allowed";
                
                if (!linkson) {
                    endis = "moderated";
                }
                
                $.say("Links are " + endis + "! Say '!links <allow|moderate>' to change this");
            } else if (args[0].equalsIgnoreCase("allow")) {
                if (!linkson) {
                    $.inidb.set("settings", "linkson", "1");
                    
                    linkson = true;
                    $.say("Links allowed");
                } else {
                    $.say("Links already allowed");
                }
            } else {
                if (linkson) {
                    $.inidb.set("settings", "linkson", "0");
                    
                    linkson = false;
                    $.say("Links moderated");
                } else {
                    $.say("Links already moderated");
                }
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }	
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
    var i;
	
    if (capsRatio > 0.30 && message.length () > 70 && !$.isMod(sender)) {
        autoPurgeUser (username);
        $.say(chatName + " -> that was way too many caps! [Warning]");
    } else if (linkson == false) {
        //Change the second parameter to true to fallback to the Java version instead
        if ($.hasLinks(event, false) && !$.isMod(sender)) {
            var permitted = false;
            
            for (i = 0; i < permitList.length; i++) {
                if (i < permitList.length) {
                    if (permitList[i][0].toLowerCase() == sender) {
                        if (permitList[i][1] >= System.currentTimeMillis()) {
                            permitted = true;
                        }
                    
                        permitList.splice(i, 1);
                        i--;
                    }
                }
            }
            
            if (permitted == false) {
                autoPurgeUser(username);
                $.say("Dont post links without permission, " + username + "!");
            }
        }
    }

    for (i = 0; i < autoBanPhrases.length; i++) {
        if (message.indexOf(autoBanPhrases[i].toLowerCase()) != -1 && !$.isMod(sender) && autoBanPhrases[i].length() > 0) {
            banUser(username);
            $.say (username + " auto-banned indefinitely for using banned phrase #" + i);
            return;
        }
    }
});

$.registerChatCommand("purge");
$.registerChatCommand("timeout");
$.registerChatCommand("ban");
$.registerChatCommand("unban");
$.registerChatCommand("autoban");
$.registerChatCommand("links");
$.registerChatCommand("permit");

$.setInterval(function() {
    var reformed = $.bancache.getReformedUsers ();
    var l = reformed.length;
    var i;
    
    for (i = 0; i < l; ++i) {
        unbanUser (reformed[i]);
    }
    
    $.bancache.syncToFile ("bannedUsers.bin");
    
    for (i = 0; i < permitList.length; i++) {
        if (i < permitList.length) {
            if (permitList[i][1] < System.currentTimeMillis()) {
                permitList.splice(i, 1);
                i--;
            }
        }
    }
}, 60);

var num_phrases = parseInt($.inidb.get("autobanphrases", "num_phrases"));
var i;

for (i = 0; i < num_phrases; i++) {
    autoBanPhrases.push($.inidb.get("autobanphrases", "phrase_" + i));
}
