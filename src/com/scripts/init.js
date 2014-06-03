var Objects = java.util.Objects;
var System = java.lang.System;
var out = java.io.PrintStream(System.out, true, "UTF-8");

var enableRedis2IniConversion = false;

$.tostring = Objects.toString;
$.println = function(o) {
    
    out.println(tostring(o));
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

for(var name in $api) {
    if(isJavaProperty(name)) continue;
    if(typeof $api[name] == "function") {
        $[name] = generateTrampoline($api, name);
    } else {
        $[name] = $api[name];
    }
}

var connected = false;
var modeo = false;

$api.on($script, 'ircJoinComplete', function(event) {
    connected = true;
    $.channel = event.getChannel();
});

$api.on($script, 'ircChannelUserMode', function(event) {
    if (connected) {
        if (event.getChannel().getName().equalsIgnoreCase($.channel.getName())) {
            if (event.getUser().equalsIgnoreCase($.botname) && event.getMode().equalsIgnoreCase("o")) {
                if (event.getAdd() == true) {
                    if (!modeo) {
                        var connectedMessage = $.inidb.get('settings', 'connectedMessage');
    
                        if (connectedMessage != null && !connectedMessage.isEmpty()) {
                            $.say(connectedMessage);
                        } else {
                            println("ready");
                        }
                    }
                    
                    modeo = true;
                } else {
                    modeo = false;
                }
            }
        }
    }
});

var modules = new Array();
var hooks = new Array();

$.getModuleIndex = function(scriptFile) {
    for (var i = 0; i < modules.length; i++) {
        if (modules[i][0].equalsIgnoreCase(scriptFile)) {
            if (scriptFile.indexOf("./util/") != -1) {
                modules[i][1] = true;
            }
                
            return i;
        }
    }
    
    return -1;
}

$.isModuleLoaded = function(scriptFile) {
    return $.getModuleIndex(scriptFile) != -1;
}

$.moduleEnabled = function(scriptFile) {
    var i = $.getModuleIndex(scriptFile);
    
    if (i == -1) {
        return false;
    }
    
    return modules[i][1];
}

$.getModule = function(scriptFile) {
    var i = $.getModuleIndex(scriptFile);
    
    if (i != -1) {
        return modules[i];
    }
    
    return null;
}

$.loadScript = function(scriptFile) {
    if (!$.isModuleLoaded(scriptFile)) {
        var script = $api.loadScriptR($script, scriptFile);
        var senabled = $.inidb.get('modules', scriptFile + '_enabled');
        var enabled = true;
        
        if (senabled) {
            enabled = senabled.equalsIgnoreCase("1");
        }
        
        modules.push(new Array(scriptFile, enabled, script));
    }
}

$.hook = new Array();

$.hook.getHookIndex = function(scriptFile, hook) {
    for (var i = 0; i < hooks.length; i++) {
        if (hooks[i][0].equalsIgnoreCase(scriptFile) && hooks[i][1].equalsIgnoreCase(hook)) {
            return i;
        }
    }
    
    return -1;
}

$.hook.hasHook = function(scriptFile, hook) {
    return $.hook.getHookIndex(scriptFile, hook) != -1;
}

$.hook.add = function(hook, handler) {
    var scriptFile = $script.getPath().replace("\\", "/").replace("./scripts/", "");
    var i = $.hook.getHookIndex(scriptFile, hook);
    
    if (i == -1) {
        hooks.push(new Array(scriptFile, hook, null));
        i = $.hook.getHookIndex(scriptFile, hook);
    }
    
    hooks[i][2] = handler;
}

$.on = $.hook.add;

$.hook.remove = function(hook) {
    var scriptFile = $script.getPath().replace("\\", "/").replace("./scripts/", "");
    var i = $.hook.getHookIndex(scriptFile, hook);
    
    if (i != -1) {
        hooks.splice(i, 1);
    }
}

$.hook.call = function(hook, arg) {
    for (var i = 0; i < hooks.length; i++) {
        if (hooks[i][1].equalsIgnoreCase(hook) && $.moduleEnabled(hooks[i][0])) {
            hooks[i][2](arg);
        }
    }
}

$api.on($script, 'command', function(event) {
    $.hook.call('command', event);
});

$api.on($script, 'consoleInput', function(event) {
    $.hook.call('consoleInput', event);
});

$api.on($script, 'twitchFollow', function(event) {
    $.hook.call('twitchFollow', event);
});

$api.on($script, 'twitchUnfollow', function(event) {
    $.hook.call('twitchUnfollow', event);
});

$api.on($script, 'twitchFollowsInitialized', function(event) {
    $.hook.call('twitchFollowsInitialized', event);
});

$api.on($script, 'ircChannelJoin', function(event) {
    $.hook.call('ircChannelJoin', event);
});

$api.on($script, 'ircChannelLeave', function(event) {
    $.hook.call('ircChannelLeave', event);
});

$api.on($script, 'ircChannelUserMode', function(event) {
    $.hook.call('ircChannelUserMode', event);
});

$api.on($script, 'ircConnectComplete', function(event) {
    $.hook.call('ircConnectComplete', event);
});

$api.on($script, 'ircJoinComplete', function(event) {
    $.hook.call('ircJoinComplete', event);
});

$api.on($script, 'ircPrivateMessage', function(event) {
    $.hook.call('ircPrivateMessage', event);
});

$api.on($script, 'ircChannelMessage', function(event) {
    $.hook.call('ircChannelMessage', event);
});

$api.on($script, 'musicPlayerConnect', function(event) {
    $.hook.call('musicPlayerConnect', event);
});

$api.on($script, 'musicPlayerCurrentId', function(event) {
    $.hook.call('musicPlayerCurrentId', event);
});

$api.on($script, 'musicPlayerCurrentVolume', function(event) {
    $.hook.call('musicPlayerCurrentVolume', event);
});

$api.on($script, 'musicPlayerDisconnect', function(event) {
    $.hook.call('musicPlayerDisconnect', event);
});

$api.on($script, 'musicPlayerState', function(event) {
    $.hook.call('musicPlayerState', event);
});

$.botname = $.botName;
$.botowner = $.ownerName;
$.pointname = $.inidb.get('settings', 'pointname');
$.pointgain = parseInt($.inidb.get('settings', 'pointgain'));
$.pointbonus = parseInt($.inidb.get('settings', 'pointbonus'));
$.pointinterval = parseInt($.inidb.get('settings', 'pointinterval'));
$.rollbonus = parseInt($.inidb.get('settings', 'rollbonus'));
$.announceinterval = parseInt($.inidb.get('announcements', 'interval'));
$.announcemessages = parseInt($.inidb.get('announcements', 'reqmessages'));

if ($.pointname == undefined || $.pointname == null || $.pointname.isEmpty()) {
    $.pointname = "Points";
}

if ($.pointgain == undefined || $.pointgain == null || isNaN($.pointgain) || $.pointgain < 0) {
    $.pointgain = 1;
}

if ($.pointbonus == undefined || $.pointbonus == null || isNaN($.pointbonus) || $.pointbonus < 0) {
    $.pointbonus = 0.5;
}

if ($.pointinterval == undefined || $.pointinterval == null || isNaN($.pointinterval) || $.pointinterval < 0) {
    $.pointinterval = 10;
}

if ($.rollbonus == undefined || $.rollbonus == null || isNaN($.rollbonus) || $.rollbonus < 0) {
    $.rollbonus = 2;
}

if ($.announceinterval == undefined || $.announceinterval == null || $.announceinterval < 2) {
    $.announceinterval = 10;
}

if ($.announcemessages == undefined || $.announcemessages == null || $.announcemessages < 5) {
    $.announcemessages = 25;
}

$.loadScript('./util/misc.js');
$.loadScript('./util/commandList.js');
$.loadScript('./util/linkDetector.js');
$.loadScript('./util/fileSystem.js');

$.initialsettings_update = 1;
if ($.inidb.GetBoolean("init", "initialsettings", "loaded") == false
    || $.inidb.GetInteger("init", "initialsettings", "update") < $.initialsettings_update) {
    $.loadScript('./util/initialsettings.js');
}

$.upgrade_version = 1;
if ($.inidb.GetInteger("init", "upgrade", "version") < $.upgrade_version) {
    $.loadScript('./util/upgrade.js');
}

$.loadScript('./util/permissions.js');
$.loadScript('./util/chatModerator.js');

$.loadScript('./announcements.js');

$.loadScript('./followHandler.js');
$.loadScript('./kappaTrigger.js'); 
$.loadScript('./youtubePlayer.js');

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
    $.loadScript('./util/redis2inidb.js'); 
}

$api.on($script, 'command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var index;
    
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
    
    if (command.equalsIgnoreCase("module")) {
        if (!$.isAdmin(sender)) {
            $.say("You must be an Administrator to use that command.");
            return;
        }
        
        if (args.length == 0) {
            $.say("Usage: !module list, !module enable <module name>, !module disable <module name>");
        } else {
            if (args[0].equalsIgnoreCase("list")) {
                var lstr = "Modules: ";
                var first = true;
                
                for (var i = 0; i < modules.length; i++) {
                    if (modules[i][0].indexOf("./util/") != -1) {
                        continue;
                    }
                    
                    if (!first) {
                        lstr += " - ";
                    }
                    
                    lstr += modules[i][0] + " (";
                    
                    if (modules[i][1]) {
                        lstr += "enabled";
                    } else {
                        lstr += "disabled";
                    }
                    
                    lstr += ")";
                    first = false;
                }
                
                $.say(lstr);
            }
            
            if (args[0].equalsIgnoreCase("enable")) {
                if (args[1].indexOf("./util/") != -1) {
                    return;
                }
                
                index = $.getModuleIndex(args[1]);
                
                if (index == -1) {
                    $.say("That module does not exist or is not loaded!");
                } else {
                    modules[index][1] = true;
                    
                    $.inidb.set('modules', modules[index][0] + '_enabled', "1");
                    
                    $.say("Module enabled!");
                }
            }
            
            if (args[0].equalsIgnoreCase("disable")) {
                if (args[1].indexOf("./util/") != -1) {
                    return;
                }
                
                index = $.getModuleIndex(args[1]);
                
                if (index == -1) {
                    $.say("That module does not exist or is not loaded!");
                } else {
                    modules[index][1] = false;
                    
                    $.inidb.set('modules', modules[index][0] + '_enabled', "0");
                    
                    $.say("Module disabled!");
                }
            }
        }
    }
});

$.registerChatCommand('setconnectedmessage');
$.registerChatCommand('reconnect');
$.registerChatCommand('module');