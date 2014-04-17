$.on('command', function(event) {
    var sender = event.getSender()
    var username = $.username.resolve(sender)
    var command = event.getCommand()
    var num_messages = $.inidb.get('events', 'num_messages')
    var argsString = event.getArguments().trim()
    var args
    
    if(argsString.isEmpty()) {
        args = []
    } else {
        args = argsString.split(" ")
    }

    if (command.equalsIgnoreCase("event")) {
        if(args.length >= 1) {
            if (!$.isAdmin(sender)) {
                $.say("You must be an Adminstrator to use this command " + username + ".")
                return
            }
            var action = args[0]
            var message = ""

            if (args.length >= 2) {
                message = argsString.substring(argsString.indexOf(action) + action.length() + 1)
            }

            if (action.equalsIgnoreCase("add")) {
                if (args.length == 1) {
                    $.say("Insert an event at the end of the rotation. !event add <message>")
                } else {
                    $.inidb.incr('events', 'num_messages', 1)

                    num_messages = $.inidb.get('events', 'num_messages')

                    $.inidb.set('events', 'message_' + (num_messages - 1), message)
                    $.say("event added! '" + message + "' There are now " + num_messages + " events!")
                }
            }

            if (action.equalsIgnoreCase("insert")) {
                if (args.length < 3) {
                    $.say("Insert an event into a specific slot, pushing the event currently in that slot and all others after it forward by one slot. !event insert <id> <message>")
                } else {
                    var id = args[1]
                    message = argsString.substring(argsString.indexOf(id) + id.length() + action.length() + 2)
                    
                    if (id < num_messages) {
                        for (var i = (num_messages - 1); i >= 0; i--) {
                            if (i > parseInt(id)) {
                                $.inidb.set('events', 'message_' + (i + 1), $.inidb.get('events', 'message_' + i))
                            }
                        }
                        $.inidb.set('events', 'message_' + parseInt(id), message)
                    } else {
                        $.inidb.set('events', 'message_' + num_messages, message)
                    }
                    
                    $.inidb.incr('events', 'num_messages', 1)

                    num_messages = $.inidb.get('events', 'num_messages')

                    $.say("event added! '" + message + "' There are now " + num_messages + " events!")
                }
            }

            if (action.equalsIgnoreCase("get")) {
                if (args.length < 2) {
                    $.say("There are " + num_messages + " events. Say '!event get <id>' to get a messages content. Message ids go from 0 to " + (num_messages - 1))
                } else {
                    $.say($.inidb.get('events', 'message_' + message))
                }
            }

            if (action.equalsIgnoreCase("del")) {
                if (args.length < 2) {
                    $.say("Delete the event at the specified slot. !event del <id>")
                } else {
                    if (isNaN(num_messages) || num_messages == 0) {
                        $.say("There are no events at this time");
                        return;
                    }
                    
                    if (num_messages > 1) {
                        for (i = 0; i < num_messages; i++) {
                            if (i > parseInt(message)) {
                                $.inidb.set('events', 'message_' + (i - 1), $.inidb.get('events', 'message_' + i))
                            }
                        }
                    }

                    $.inidb.del('events', 'message_' + (num_messages - 1))

                    $.inidb.decr('events', 'num_messages', 1)

                    num_messages = $.inidb.get('events', 'num_messages')

                    $.say("event removed! There are now " + num_messages + " events!")
                }
            }
        } else {
            $.say("usage: !event add <message>, !event insert <id> <message>, !event get [id], !event del <id>")
        }
    }
})

$.registerChatCommand("event");

var messageCount = 0
var messageTime = 0
var messageIndex = 0

function sendMessage() {
    var num_messages = $.inidb.get('events', 'num_messages')
    
    if (isNaN(parseInt(num_messages)) || parseInt(num_messages) == 0) {
        return
    }
    
    var message = $.inidb.get('events', 'message_' + messageIndex)
 
    messageIndex++
    if(messageIndex >= num_messages) {
        messageIndex = 0
    }
 
    $.say(message)
}

$.on('ircChannelMessage', function(event) {
    messageCount++
})

function runMessage() {
    if (messageCount >= 25 && messageTime + 550 * 1000 < System.currentTimeMillis()){
        messageCount = 0
        sendMessage()
        messageTime = System.currentTimeMillis()
    }
    
    setTimeout(runMessage, 1000)
}

runMessage()

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if (command.equalsIgnoreCase("pointsname")) {
        if(args.length >= 2) {
            if (!$.isAdmin(sender)) {
                $.say("You must be an Administrator to use this command " + username + ".");
                return;
            }
            
            var name = argsString;

            $.inidb.set('settings', 'pointname', name);
            $.say("done! points renamed to '" + name + "'");

            $.pointname = name;
        }
    }
});

$.registerChatCommand("pointsname");