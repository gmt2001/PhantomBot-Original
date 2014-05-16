var Objects = java.util.Objects;
var System = java.lang.System;

var enableRedis2IniConversion = false;

$.tostring = Objects.toString;
$.println = function(o) {
    System.out.println(tostring(o));
};

var blackList = ["getClass", "equals", "notify", "class", "hashCode", "toString", "wait", "notifyAll"];
function isJavaProperty(property) {
    for(var i in blackList) {
        if(blackList[i] == property) {
            return true;
        }
    }
    return false;
}

function generateTrampoline(obj, name) {
    return function() {
        var args = [$script];
        for(var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        obj[name].apply(obj, args);
    };
}

// register api methods
for(var name in $api) {
    if(isJavaProperty(name)) continue;
    if(typeof $api[name] == "function") {
        $[name] = generateTrampoline($api, name);
    } else {
        $[name] = $api[name];
    }
}

var connected = false;

$.on('ircJoinComplete', function(event) {
    connected = true;
    $.channel = event.getChannel();
});

$.on('ircChannelUserMode', function(event) {
    if (connected) {
        if (event.getChannel().getName().equalsIgnoreCase($.channel.getName())) {
            if (event.getUser().equalsIgnoreCase($.botname) && event.getMode().equalsIgnoreCase("o") && event.getAdd() == true) {
                var connectedMessage = $.inidb.get('settings', 'connectedMessage');
    
                if (connectedMessage != null && !connectedMessage.isEmpty()) {
                    $.say(connectedMessage);
                } else {
                    println("ready");
                }
            }
        }
    }
});

$.botname = $.botName;
$.botowner = $.ownerName;
$.pointname = $.inidb.get('settings','pointname');

if ($.pointname == undefined || $.pointname == null || $.pointname.isEmpty()) {
    $.pointname = "Points";
}

// [ ----------------------(Plugins enable/disable)------------------------ ]
$.loadScript('./util/misc.js');
$.loadScript('./util/commandList.js');
$.loadScript('./util/linkDetector.js');

$.loadScript('./systems/fileSystem.js');

$.initialsettings_update = 1;
if ($.inidb.GetBoolean("init", "initialsettings", "loaded") == false
    || $.inidb.GetInteger("init", "initialsettings", "update") < $.initialsettings_update) {
    $.loadScript('./initialsettings.js');
}

$.loadScript('./events.js');
$.loadScript('./permissions.js');

$.loadScript('./chatModerator.js');
$.loadScript('./followHandler.js');
$.loadScript('./kappaTrigger.js'); 
//$.loadScript('./youtubePlayer.js');

$.loadScript('./systems/pointSystem.js');
$.loadScript('./systems/timeSystem.js');
$.loadScript('./systems/betSystem.js');
$.loadScript('./systems/levelSystem.js');
$.loadScript('./systems/votingSystem.js');
$.loadScript('./systems/raffleSystem.js');
$.loadScript('./systems/greetingSystem.js');

$.loadScript('./commands/addCommand.js');
$.loadScript('./commands/quoteCommand.js');
$.loadScript('./commands/randomCommand.js');
$.loadScript('./commands/rollCommand.js');
$.loadScript('./commands/killCommand.js');
$.loadScript('./commands/top10Command.js');

if (enableRedis2IniConversion && $.inidb.GetBoolean("init", "redis2ini", "converted") == false) {
    $.loadScript('./redis2inidb.js'); 
}

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    
    if (command.equalsIgnoreCase("setconnectedmessage")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command.");
            return;
        }
        
        $.inidb.set('settings', 'connectedmessage', argsString);
        $.say("Connection message set!");
    }
    
    if (command.equalsIgnoreCase("reconnect")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command.");
            return;
        }
        
        $.connmgr.reconnectSession($.hostname);
        $.say("Reconnect scheduled!");
    }
});

$.registerChatCommand('setconnectedmessage');
$.registerChatCommand('reconnect');