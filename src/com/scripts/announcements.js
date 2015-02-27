$.announceinterval = parseInt($.inidb.get('announcements', 'interval'));
$.announcemessages = parseInt($.inidb.get('announcements', 'reqmessages'));

if ($.announceinterval == undefined || $.announceinterval == null || $.announceinterval < 1) {
    $.announceinterval = 10;
}

if ($.announcemessages == undefined || $.announcemessages == null || $.announcemessages < 0) {
    $.announcemessages = 25;
}

$.on('command', function(event) {
    var sender = event.getSender()
    var username = $.username.resolve(sender)
    var command = event.getCommand()
    var num_messages = $.inidb.get('announcements', 'num_messages')
    var argsString = event.getArguments().trim()
    var args = event.getArgs();

    if (command.equalsIgnoreCase("announcement")) {
        if(args.length >= 1) {
            if (!$.isAdmin(sender)) {
                $.say("You must be an Adminstrator to use this command " + username + ".");
                return;
            }
            
            var action = args[0]
            var message = ""

            if (args.length >= 2) {
                message = argsString.substring(argsString.indexOf(action) + $.strlen(action) + 1)
            }

            if (action.equalsIgnoreCase("add")) {
                if (args.length == 1) {
                    $.say("Insert an announcement at the end of the rotation. !announcement add <message>")
                } else {
                    $.logEvent("announcements.js", 38, username + " added a new announcement (id " + num_messages + "): " + message);
                    
                    $.inidb.incr('announcements', 'num_messages', 1)

                    num_messages = $.inidb.get('announcements', 'num_messages')

                    $.inidb.set('announcements', 'message_' + (num_messages - 1), message)
                    $.say("Announcement added! '" + message + "' There are now " + num_messages + " announcements!")
                }
            }

            if (action.equalsIgnoreCase("insert")) {
                if (args.length < 3) {
                    $.say("Insert an event into a specific slot, pushing the event currently in that slot and all others after it forward by one slot. !announcement insert <id> <message>")
                } else {
                    var id = args[1]
                    message = argsString.substring(argsString.indexOf(id) + $.strlen(id) + $.strlen(action) + 2)
                    
                    if (id < num_messages) {
                        for (var i = (num_messages - 1); i >= 0; i--) {
                            if (i > parseInt(id)) {
                                $.inidb.set('announcements', 'message_' + (i + 1), $.inidb.get('announcements', 'message_' + i))
                            }
                        }
                        $.inidb.set('announcements', 'message_' + parseInt(id), message)
                    } else {
                        $.inidb.set('announcements', 'message_' + num_messages, message)
                    }
                    
                    $.logEvent("announcements.js", 67, username + " inserted a new announcement at specified id (id " + id + "): " + message);
                    
                    $.inidb.incr('announcements', 'num_messages', 1)

                    num_messages = $.inidb.get('announcements', 'num_messages')

                    $.say("Announcement added! '" + message + "' There are now " + num_messages + " announcements!")
                }
            }

            if (action.equalsIgnoreCase("get")) {
                if (args.length < 2) {
                    $.say("There are " + num_messages + " announcements. Say '!announcement get <id>' to get a messages content. Message ids go from 0 to " + (num_messages - 1))
                } else {
                    $.say($.inidb.get('announcements', 'message_' + message))
                }
            }

            if (action.equalsIgnoreCase("del")) {
                if (args.length < 2) {
                    $.say("Delete the announcement at the specified slot. !announcement del <id>")
                } else {
                    if (isNaN(num_messages) || num_messages == 0) {
                        $.say("There are no announcements at this time");
                        return;
                    }
                    
                    if (num_messages > 1) {
                        $.logEvent("announcements.js", 95, username + " removed announcement (id " + message + "): " + $.inidb.get('announcements', 'message_' + message));
                        
                        for (i = 0; i < num_messages; i++) {
                            if (i > parseInt(message)) {
                                $.inidb.set('announcements', 'message_' + (i - 1), $.inidb.get('announcements', 'message_' + i))
                            }
                        }
                    }

                    $.inidb.del('announcements', 'message_' + (num_messages - 1))

                    $.inidb.decr('announcements', 'num_messages', 1)

                    num_messages = $.inidb.get('announcements', 'num_messages')

                    $.say("Announcement removed! There are now " + num_messages + " announcements!")
                }
            }
            
            if (action.equalsIgnoreCase("timer")) {
                if (args.length < 2) {
                    $.say("Sets the interval between announcements. The current interval is " + $.announceinterval + " minutes. Must be at least 1. Set it with !announcement timer <new time in minutes>")
                } else {
                    if (!isNaN(message) && parseInt(message) >= 1) {
                        $.logEvent("announcements.js", 119, username + " changed the interval between announcements to " + message + " minutes");
                        
                        $.inidb.set('announcements', 'interval', message);
                        $.announceinterval = parseInt(message);
                        
                        $.say("The interval between announcements is now " + $.announceinterval + " minutes!");
                    }
                }
            }
            
            if (action.equalsIgnoreCase("reqmessages")) {
                if (args.length < 2) {
                    $.say("Sets the minimum number of other chat messages required between announcements. Set to 0 to ignore required messages. The current amount is " + $.announcemessages + " messages. Set it with !announcement reqmessages <new amount>")
                } else {
                    if (!isNaN(message) && parseInt(message) >= 0) {
                        $.logEvent("announcements.js", 134, username + " changed the number of chat messages between announcements to " + message);
                        
                        $.inidb.set('announcements', 'reqmessages', message);
                        $.announcemessages = parseInt(message);
                        
                        $.say("The minumum number of other messages between announcements is now " + $.announcemessages + "!");
                    }
                }
            }
        } else {
            $.say("usage: !announcement add <message>, !announcement insert <id> <message>, !announcement get [id], !announcement del <id>, !announcement timer [new time in minutes], !announcement reqmessages [new amount]")
        }
    }
})

$.registerChatCommand("./announcements.js", "announcement", "admin");

var messageCount = parseInt($.inidb.get('announcements', 'messageCount'));
var messageTime = parseInt($.inidb.get('announcements', 'messageTime'));
var messageIndex = parseInt($.inidb.get('announcements', 'messageIndex'));

if (messageCount == undefined || messageCount == null || messageCount < 0) {
    messageCount = 0;
}

if (messageTime == undefined || messageTime == null || messageTime < 0) {
    messageTime = 0;
}

if (messageIndex == undefined || messageIndex == null || messageIndex < 0) {
    messageIndex = 0;
}

function sendMessage() {
    var num_messages = $.inidb.get('announcements', 'num_messages');
    
    if (isNaN(parseInt(num_messages)) || parseInt(num_messages) == 0) {
        return;
    }
    
    var message = $.inidb.get('announcements', 'message_' + messageIndex);
 
    messageIndex++;
    $.inidb.set('announcements', 'messageIndex', messageIndex);
    
    if (messageIndex >= num_messages) {
        messageIndex = 0;
    }
 
    $.say(message);
}

$.on('ircChannelMessage', function(event) {
    messageCount++;
    $.inidb.set('announcements', 'messageCount', messageCount);
})

$.timer.addTimer("./announcements.js", "announcement", true, function() {
    if (!$.moduleEnabled("./announcements.js")) {
        return;
    }
    
    if (messageCount >= $.announcemessages && messageTime + ($.announceinterval * 60 * 1000) < System.currentTimeMillis()){
        messageCount = 0;
        $.inidb.set('announcements', 'messageCount', messageCount);
        
        sendMessage();
        
        messageTime = System.currentTimeMillis();
        $.inidb.set('announcements', 'messageTime', messageTime);
    }
}, 60 * 1000);