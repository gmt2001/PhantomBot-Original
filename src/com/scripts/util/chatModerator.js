var ircPrefix = ".";
var autoBanPhrases = new Array();
var permitList = new Array();
var sinbin = new Array();
var warningcountresettime = parseInt($.inidb.get("settings", "warningcountresettime")) * 1000;
var timeouttype = $.inidb.get("settings", "timeouttype");
var autopurgemessage = $.inidb.get("settings", "autopurgemessage");
var capsallowed = $.inidb.get("settings", "capsallowed").equalsIgnoreCase("1");
var capstriggerratio = parseFloat($.inidb.get("settings", "capstriggerratio"));
var capstriggerlength = parseInt($.inidb.get("settings", "capstriggerlength"));
var capsmessage = $.inidb.get("settings", "capsmessage");
var linksallowed = $.inidb.get("settings", "linksallowed").equalsIgnoreCase("1");
var permittime = parseInt($.inidb.get("settings", "permittime"));
var youtubeallowed = $.inidb.get("settings", "youtubeallowed").equalsIgnoreCase("1");
var linksmessage = $.inidb.get("settings", "linksmessage");
var warningtypes = new Array($.inidb.get("settings", "warning1type"), $.inidb.get("settings", "warning2type"), $.inidb.get("settings", "warning3type"));
var warningmessages = new Array($.inidb.get("settings", "warning1message"), $.inidb.get("settings", "warning2message"), $.inidb.get("settings", "warning3message"));
$.bancache.loadFromFile ("bannedUsers.bin");

var lines = $.readFile("sinbin");
var i;
var spl;

for (i = 0; i < lines.length; i++) {
    spl = lines[i].split("=");
    
    sinbin.push(new Array(spl[0], parseInt(spl[1]), parseInt(spl[2])));
}

function banUserFor (user, time) {
    $.bancache.addUser (user, time);
    $.bancache.syncToFile ("bannedUsers.bin");
    
    banUser(user);
}

function banUser (user) {
    $.say (ircPrefix + "ban " + user);
    timeoutUser(user, 1);
}

function unbanUser (user) {
    $.say (ircPrefix + "unban " + user);
    $.bancache.removeUser (user);
}
 
function clearChat () {
    $.say (ircPrefix + "clear");
}

function timeoutUserFor (user, fortime) {
    if (timeouttype.equalsIgnoreCase("ban")) {
        banUserFor(user, fortime);
    } else {
        timeoutUser(user, fortime);
    }
}

function timeoutUser (user, fortime) {
    $.say (ircPrefix + "timeout " + user + " " + fortime);
}

function autoPurgeUser(user, warnmessage) {
    var ban = false;
    var idx = -1;
    var count;
    var lastincrease;
    var warning;
    
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
        
        if (warningcountresettime >= 0 && lastincrease + warningcountresettime < System.currentTimeMillis()) {
            count = 0;
        }
        
        lastincrease = System.currentTimeMillis();
    }
    
    count++;
    
    warning = user + " -> " + warnmessage;
    
    if (count == 1) {
        if (warningmessages[0].length() > 0) {
            warning += " >> " + warningmessages[0];
        }
        
        if (warningtypes[0].equalsIgnoreCase("purge")) {
            timeoutUser(user, 1);
            
            warning += " [Purged]";
        } else if (warningtypes[0].equalsIgnoreCase("ban")) {
            banUser(user);
            
            warning += " [Banned]";
        } else {
            timeoutUserFor(user, parseInt(warningtypes[0]));
            
            warning += " [Timed Out (" + warningtypes[0] + ")]";
        }
    } else if (count == 2) {
        if (warningmessages[1].length() > 0) {
            warning += " >> " + warningmessages[1];
        }
        
        if (warningtypes[1].equalsIgnoreCase("purge")) {
            timeoutUser(user, 1);
            
            warning += " [Purged]";
        } else if (warningtypes[1].equalsIgnoreCase("ban")) {
            banUser(user);
            
            warning += " [Banned]";
        } else {
            timeoutUserFor(user, parseInt(warningtypes[1]));
            
            warning += " [Timed Out (" + warningtypes[1] + ")]";
        }
    } else {
        if (warningmessages[2].length() > 0) {
            warning += " >> " + warningmessages[2];
        }
        
        if (warningtypes[2].equalsIgnoreCase("purge")) {
            timeoutUser(user, 1);
            
            warning += " [Purged]";
        } else if (warningtypes[2].equalsIgnoreCase("ban")) {
            banUser(user);
            
            warning += " [Banned]";
        } else {
            timeoutUserFor(user, parseInt(warningtypes[2]));
            
            warning += " [Timed Out (" + warningtypes[2] + ")]";
        }
    }
    
    $.say(warning);
    
    if (idx == -1) {
        sinbin.push(new Array(user.toLowerCase(), count, lastincrease));
    } else {
        sinbin[idx][1] = count;
        sinbin[idx][2] = lastincrease;
    }
    
    var lines = new Array();
    
    for (i = 0; i < sinbin.length; i++) {
        lines.push(sinbin[i][0] + "=" + sinbin[i][1] + "=" + sinbin[i][2]);
    }
    
    $.saveArray(lines, "sinbin", false);
}

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs ();
    var i;
    var lines;
    var found;
	
    if (command.equalsIgnoreCase("chat") && username.equalsIgnoreCase($.botname)) {
        $.say (argsString);
    } else if (command.equalsIgnoreCase("purge")) {
        if ($.isMod(sender)) {
            if (args.length == 1) {
                timeoutUser (args[0], 1);
            } else {
                $.say ("You must specify a user to purge")
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }		
    } else if (command.equalsIgnoreCase("forgive")) {
        if ($.isAdmin(sender)) {
            if (args.length == 1) {
                for (i = 0; i < sinbin.length; i++) {
                    if (args[0].equalsIgnoreCase(sinbin[i][0])) {

                        sinbin[i][1]--;
                        
                        $.say("Reduced " + args[0] + " to " + sinbin[i][1] + " strike(s)!");
                    }
                }
     
                lines = new Array();
    
                for (i = 0; i < sinbin.length; i++) {
                    if (i < sinbin.length && sinbin[i][1] <= 0) {
                        sinbin.splice(i, 1);
                        i--;
                    }
                }
                
                for (i = 0; i < sinbin.length; i++) {
                    if (sinbin[i][1] > 0) {
                        lines.push(sinbin[i][0] + "=" + sinbin[i][1] + "=" + sinbin[i][2]);
                    }
                }
    
                $.saveArray(lines, "sinbin", false);
            } else {
                $.say ("You must specify a user to forgive");
            }
        } else {
            $.say ("Only an Administrator can use this command! " + username);
        }
    } else if (command.equalsIgnoreCase("increase")) {
        if ($.isAdmin(sender)) {
            if (args.length == 1) {
                found = false;
                
                for (i = 0; i < sinbin.length; i++) {
                    if (args[0].equalsIgnoreCase(sinbin[i][0])) {

                        sinbin[i][1]++;
                        
                        $.say("Increased " + args[0] + " to " + sinbin[i][1] + " strike(s)!");
                        
                        found = true;
                    }
                }
                
                if (found == false) {
                    sinbin.push(new Array(args[0].toLowerCase(), 1, System.currentTimeMillis()));
                    
                    $.say("Increased " + args[0] + " to 1 strike(s)!");
                }
     
                lines = new Array();
                
                for (i = 0; i < sinbin.length; i++) {
                    if (sinbin[i][1] > 0) {
                        lines.push(sinbin[i][0] + "=" + sinbin[i][1] + "=" + sinbin[i][2]);
                    }
                }
    
                $.saveArray(lines, "sinbin", false);
            } else {
                $.say ("You must specify a user to increase");
            }
        } else {
            $.say ("Only an Administrator can use this command! " + username);
        }
    } else if (command.equalsIgnoreCase("autopurge")) {
        if ($.isMod(sender)) {
            if (args.length == 1) {
                autoPurgeUser(args[0], autopurgemessage);
            } else {
                $.say ("You must specify a user to autopurge");
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }
    } else if (command.equalsIgnoreCase("timeout")) {
        if ($.isMod(sender)) {
            if (args.length == 1) {
                timeoutUserFor (args [0], 600);
            } else if (args.length == 2 && !isNaN(args[1])) {
                timeoutUserFor (args [0], args[1]);
            } else {
                $.say ("You must specify a user to timeout")
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }
    } else if (command.equalsIgnoreCase("permit")) {
        if ($.isMod(sender)) {
            if (argsString.length() > 0 && linksallowed == false) {
                permitList.push(new Array(argsString, System.currentTimeMillis() + (permittime * 1000)));
                
                $.say (argsString + " is permitted to post a link during the next " + permittime + " seconds!");
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
    } else if (command.equalsIgnoreCase("clear")) {
        if ($.isMod(sender)) {
            clearChat();
            
            setTimeout(function() {
                $.say(username + " cleared chat!");
            }, 1000);
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }	
    } else if (command.equalsIgnoreCase("autoban")) {
        if ($.isMod(sender)) {
            if (argsString.length() > 0) {
                autoBanPhrases.push(argsString);
            
                var num_phrases = $.inidb.get("autobanphrases", "num_phrases");
                
                if (num_phrases == null || num_phrades == undefined || num_phrases.length() == 0) {
                    num_phrases = 0;
                }
                
                $.inidb.set("autobanphrases", "phrase_" + num_phrases, argsString);
                $.inidb.incr("autobanphrases", "num_phrases", 1);
            
                $.say("Added a phrase to the autoban list! This can only be undone manually!");
            }
        } else {
            $.say ("Only a Moderator can use this command! " + username);
        }	
    } else if (command.equalsIgnoreCase("chatmod")) {
        if ($.isMod(sender)) {
            if (args.length < 1 || args[0].equalsIgnoreCase("help")) {
                $.say("Usage: !chatmod <option> <new value>");
                $.say("-Options: ");
                $.say("-- warningcountresettime <-1 for never, time>  The amount of time, in seconds, after which a users link/caps warning count is reset");
                $.say("-- timeouttype <'ban' or 'timeout'>  The method used to issue timeouts. Either ban then unban, or regular twitch timeout");
                $.say("-- autopurgemessage <any text>  The message sent, along with a warning#message, when a moderator manually issues an auto warning");
                $.say("-- capsallowed <'true' or 'false'>  If 'false' is chosen, caps warnings will be issued");
                $.say("-- capstriggerratio <number between 0.2 and 1.0>  The percentage of caps required to trigger a caps warning, if the minimum length is met");
                $.say("-- capstriggerlength <number greater than 0>  The minimum message length required before anti-caps is enforced on the message");
                $.say("-- capsmessage <any text>  The message sent, along with a warning#message, when a caps warning is issued");
                $.say("-- linksallowed <'true' or 'false'>  If 'false' is chosen, link warnings will be issued");
                $.say("-- permittime <number that is at least 60>  The number of seconds that !permit gives a user to post a link");
                $.say("-- youtubeallowed <'true' or 'false'>  If 'true' is chosen, youtube links will not be moderated even if other links are");
                $.say("-- linksmessage <any text>  The message sent, along with a warning#message, when a link warning is issued");
                $.say("-- warning1type <'purge', 'ban', or the number of seconds to timeout for>  The action taken when a user receives their first warning");
                $.say("-- warning2type <'purge', 'ban', or the number of seconds to timeout for>  The action taken when a user receives their second warning");
                $.say("-- warning3type <'purge', 'ban', or the number of seconds to timeout for>  The action taken when a user receives their third/final warning");
                $.say("-- warning1message <any text>  The message sent when a user receives their first warning");
                $.say("-- warning2message <any text>  The message sent when a user receives their second warning");
                $.say("-- warning3message <any text>  The message sent when a user receives their third/final warning");
            } else {
                var val;
                
                if (args.length > 1) {
                    argsString = argsString.substring(argsString.indexOf(args[0]) + args[0].length() + 1);
                }
                
                if (args[0].equalsIgnoreCase("warningcountresettime")) {
                    val = parseInt(argsString);
                    
                    if (args.length == 1 || isNaN(val)) {
                        $.say("The current amount of time, in seconds, after which a users link/caps warning count is reset is " + warningcountresettime + " seconds. To change it use: !chatmod warningcountresettime <-1 for never, time>");
                    } else {
                        if (val < 0) {
                            val = -1;
                        }
                        
                        $.inidb.set("settings", "warningcountresettime", argsString);
                        
                        warningcountresettime = val;
                        
                        if (val < 0) {
                            $.say("Changed warning count reset time to never!");
                        } else {
                            $.say("Changed warning count reset time to " + val + " seconds!");
                        }
                    }
                } else if (args[0].equalsIgnoreCase("timeouttype")) {
                    val = argsString;
                    
                    if (args.length == 1 || (!val.equalsIgnoreCase("ban") && !val.equalsIgnoreCase("timeout"))) {
                        $.say("Timeouts are currently issued using " + timeouttype + "s. To change it use: !chatmod timeouttype <'ban' or 'timeout'>");
                    } else {
                        $.inidb.set("settings", "timeouttype", val);
                        
                        timeouttype = val;
                        
                        $.say("Timeouts are now issues using " + val + "s!");
                    }
                } else if (args[0].equalsIgnoreCase("autopurgemessage")) {
                    val = argsString;
                    
                    if (args.length == 1) {
                        $.say("The current manual autopurge message is '" + autopurgemessage + "'. To change it use: !chatmod autopurgemessage <any text>");
                    } else {
                        
                        $.inidb.set("settings", "autopurgemessage", val);
                        
                        autopurgemessage = val;
                        
                        $.say("Changed manual autopurge message to '" + val + "'!");
                    }
                } else if (args[0].equalsIgnoreCase("capsallowed")) {
                    val = argsString;
                    
                    if (args.length == 1 || (!val.equalsIgnoreCase("false") && !val.equalsIgnoreCase("true"))) {
                        if (capsallowed) {
                            val = "allowed";
                        } else {
                            val = "moderated";
                        }
                        
                        $.say("Caps are currently " + val + ". To change it use: !chatmod capsallowed <'true' or 'false'>");
                    } else {
                        if (val.equalsIgnoreCase("true")) {
                            val = "1";
                        } else {
                            val = "0";
                        }
                        
                        $.inidb.set("settings", "capsallowed", val);
                        
                        capsallowed = val.equalsIgnoreCase("1");
                        
                        if (capsallowed) {
                            $.say("Caps are now allowed!");
                        } else {
                            $.say("Caps are now moderated!");
                        }
                    }
                } else if (args[0].equalsIgnoreCase("capstriggerratio")) {
                    val = parseFloat(argsString);
                    
                    if (args.length == 1 || isNaN(val)) {
                        $.say("The current percentage of caps required to trigger a caps warning is " + capstriggerratio + ". To change it use: !chatmod capstriggerratio <number between 0.2 and 1.0>");
                    } else {
                        if (val > 1.0) {
                            val = val / 100;
                        }
                        
                        if (val > 1.0) {
                            val = 1.0;
                        }
                        
                        if (val < 0.2) {
                            val = 0.2;
                        }
                        
                        $.inidb.set("settings", "capstriggerratio", val);
                        
                        capstriggerratio = val;
                        
                        $.say("Changed caps warning trigger percentage to " + val + "!");
                    }
                } else if (args[0].equalsIgnoreCase("capstriggerlength")) {
                    val = parseInt(argsString);
                    
                    if (args.length == 1 || isNaN(val)) {
                        $.say("The current message length required to check for caps is " + capstriggerlength + ". To change it use: !chatmod capstriggerlength <number greater than 0>");
                    } else {
                        if (val < 1) {
                            val = 1;
                        }
                        
                        $.inidb.set("settings", "capstriggerlength", val);
                        
                        capstriggerlength = val;
                        
                        $.say("Changed caps warning minimum message length to " + val + "!");
                    }
                } else if (args[0].equalsIgnoreCase("capsmessage")) {
                    val = argsString;
                    
                    if (args.length == 1) {
                        $.say("The current caps warning message is '" + capsmessage + "'. To change it use: !chatmod capsmessage <any text>");
                    } else {
                        
                        $.inidb.set("settings", "capsmessage", val);
                        
                        capsmessage = val;
                        
                        $.say("Changed caps warning message to '" + val + "'!");
                    }
                } else if (args[0].equalsIgnoreCase("linksallowed")) {
                    val = argsString;
                    
                    if (args.length == 1 || (!val.equalsIgnoreCase("false") && !val.equalsIgnoreCase("true"))) {
                        if (linksallowed) {
                            val = "allowed";
                        } else {
                            val = "moderated";
                        }
                        
                        $.say("Links are currently " + val + ". To change it use: !chatmod linksallowed <'true' or 'false'>");
                    } else {
                        if (val.equalsIgnoreCase("true")) {
                            val = "1";
                        } else {
                            val = "0";
                        }
                        
                        $.inidb.set("settings", "linksallowed", val);
                        
                        linksallowed = val.equalsIgnoreCase("1");
                        
                        if (linksallowed) {
                            $.say("Links are now allowed!");
                        } else {
                            $.say("Links are now moderated!");
                        }
                    }
                } else if (args[0].equalsIgnoreCase("permittime")) {
                    val = parseInt(argsString);
                    
                    if (args.length == 1 || isNaN(val)) {
                        $.say("The current permit time is " + permittime + " seconds. To change it use: !chatmod permittime <number that is at least 60>");
                    } else {
                        if (val < 60) {
                            val = 60;
                        }
                        
                        $.inidb.set("settings", "permittime", val);
                        
                        permittime = val;
                        
                        $.say("Changed permit time to " + val + " seconds!");
                    }
                } else if (args[0].equalsIgnoreCase("youtubeallowed")) {
                    val = argsString;
                    
                    if (args.length == 1 || (!val.equalsIgnoreCase("false") && !val.equalsIgnoreCase("true"))) {
                        if (linksallowed) {
                            val = "allowed";
                        } else {
                            val = "moderated";
                        }
                        
                        $.say("Youtube links are currently " + val + ". To change it use: !chatmod youtubeallowed <'true' or 'false'>");
                    } else {
                        if (val.equalsIgnoreCase("true")) {
                            val = "1";
                        } else {
                            val = "0";
                        }
                        
                        $.inidb.set("settings", "youtubeallowed", val);
                        
                        youtubeallowed = val.equalsIgnoreCase("1");
                        
                        if (youtubesallowed) {
                            $.say("Youtube links are now allowed!");
                        } else {
                            $.say("Youtube links are now moderated!");
                        }
                    }
                } else if (args[0].equalsIgnoreCase("linksmessage")) {
                    val = argsString;
                    
                    if (args.length == 1) {
                        $.say("The current link warning message is '" + linksmessage + "'. To change it use: !chatmod linksmessage <any text>");
                    } else {
                        
                        $.inidb.set("settings", "linksmessage", val);
                        
                        linksmessage = val;
                        
                        $.say("Changed link warning message to '" + val + "'!");
                    }
                } else if (args[0].equalsIgnoreCase("warning1type")) {
                    val = argsString;
                    
                    if (args.length == 1 || (!val.equalsIgnoreCase("purge") && !val.equalsIgnoreCase("ban") && !isNaN(val))) {
                        if (warningtypes[0].equalsIgnoreCase("purge")) {
                            val = "purge";
                        } else if (warningtypes[0].equalsIgnoreCase("ban")) {
                            val = "permanent ban";
                        } else {
                            val = "timeout for " + warningtypes[0] + " seconds";
                        }
                        
                        $.say("The current action taken upon first warning is " + val + ". To change it use: !chatmod warning1type <'purge', 'ban', or the number of seconds to timeout for>");
                    } else {
                        
                        $.inidb.set("settings", "warning1type", val);
                        
                        warningtypes[0] = val;
                        
                        if (warningtypes[0].equalsIgnoreCase("purge")) {
                            val = "purge";
                        } else if (warningtypes[0].equalsIgnoreCase("ban")) {
                            val = "permanent ban";
                        } else {
                            val = "timeout for " + warningtypes[0] + " seconds";
                        }
                        
                        $.say("Changed first warning action to " + val + "!");
                    }
                } else if (args[0].equalsIgnoreCase("warning2type")) {
                    val = argsString;
                    
                    if (args.length == 1 || (!val.equalsIgnoreCase("purge") && !val.equalsIgnoreCase("ban") && !isNaN(val))) {
                        if (warningtypes[1].equalsIgnoreCase("purge")) {
                            val = "purge";
                        } else if (warningtypes[1].equalsIgnoreCase("ban")) {
                            val = "permanent ban";
                        } else {
                            val = "timeout for " + warningtypes[1] + " seconds";
                        }
                        
                        $.say("The current action taken upon second warning is " + val + ". To change it use: !chatmod warning2type <'purge', 'ban', or the number of seconds to timeout for>");
                    } else {
                        
                        $.inidb.set("settings", "warning2type", val);
                        
                        warningtypes[1] = val;
                        
                        if (warningtypes[1].equalsIgnoreCase("purge")) {
                            val = "purge";
                        } else if (warningtypes[1].equalsIgnoreCase("ban")) {
                            val = "permanent ban";
                        } else {
                            val = "timeout for " + warningtypes[1] + " seconds";
                        }
                        
                        $.say("Changed second warning action to " + val + "!");
                    }
                } else if (args[0].equalsIgnoreCase("warning3type")) {
                    val = argsString;
                    
                    if (args.length == 1 || (!val.equalsIgnoreCase("purge") && !val.equalsIgnoreCase("ban") && !isNaN(val))) {
                        if (warningtypes[2].equalsIgnoreCase("purge")) {
                            val = "purge";
                        } else if (warningtypes[2].equalsIgnoreCase("ban")) {
                            val = "permanent ban";
                        } else {
                            val = "timeout for " + warningtypes[2] + " seconds";
                        }
                        
                        $.say("The current action taken upon third/final warning is " + val + ". To change it use: !chatmod warning3type <'purge', 'ban', or the number of seconds to timeout for>");
                    } else {
                        
                        $.inidb.set("settings", "warning3type", val);
                        
                        warningtypes[2] = val;
                        
                        if (warningtypes[2].equalsIgnoreCase("purge")) {
                            val = "purge";
                        } else if (warningtypes[2].equalsIgnoreCase("ban")) {
                            val = "permanent ban";
                        } else {
                            val = "timeout for " + warningtypes[2] + " seconds";
                        }
                        
                        $.say("Changed third/final warning action to " + val + "!");
                    }
                } else if (args[0].equalsIgnoreCase("warning1message")) {
                    val = argsString;
                    
                    if (args.length == 1) {
                        $.say("The current first warning message is '" + warningmessages[0] + "'. To change it use: !chatmod warning1message <any text>");
                    } else {
                        
                        $.inidb.set("settings", "warning1message", val);
                        
                        warningmessages[0] = val;
                        
                        $.say("Changed first warning message to '" + val + "'!");
                    }
                } else if (args[0].equalsIgnoreCase("warning2message")) {
                    val = argsString;
                    
                    if (args.length == 1) {
                        $.say("The current second warning message is '" + warningmessages[1] + "'. To change it use: !chatmod warning2message <any text>");
                    } else {
                        
                        $.inidb.set("settings", "warning2message", val);
                        
                        warningmessages[1] = val;
                        
                        $.say("Changed second warning message to '" + val + "'!");
                    }
                } else if (args[0].equalsIgnoreCase("warning3message")) {
                    val = argsString;
                    
                    if (args.length == 1) {
                        $.say("The current third/final warning message is '" + warningmessages[2] + "'. To change it use: !chatmod warning3message <any text>");
                    } else {
                        
                        $.inidb.set("settings", "warning3message", val);
                        
                        warningmessages[2] = val;
                        
                        $.say("Changed third/final warning message to '" + val + "'!");
                    }
                }
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
	
    if (capsallowed == false && capsRatio > capstriggerratio && message.length () > capstriggerlength && !$.isMod(sender)) {
        autoPurgeUser(username, capsmessage);
    } else if (linksallowed == false) {
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
            
            if (youtubeallowed == true && (message.indexOf("youtube.com") != -1 || message.indexOf("youtu.be") != -1)) {
                permitted = true;
            }
            
            if (permitted == false) {
                autoPurgeUser(username, linksmessage);
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
$.registerChatCommand("clear");
$.registerChatCommand("autopurge");
$.registerChatCommand("autoban");
$.registerChatCommand("permit");
$.registerChatCommand("chatmod");

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

for (i = 0; i < num_phrases; i++) {
    autoBanPhrases.push($.inidb.get("autobanphrases", "phrase_" + i));
}
