$.commandList = new Array();
$.customCommandList = new Array();
$.commandsPerPage = 20;

$.registerChatCommand = function(command) {
    if (!$.array.contains($.commandList, command)) {
        $.commandList.push(command);
    }
}

$.unregisterChatCommand = function(command) {
    if ($.array.contains($.commandList, command)) {
        for (var i = 0; i < $.commandList.length; i++) {
            if ($.commandList[i].equalsIgnoreCase(command)) {
                commandList.splice(i, 1);
                break;
            }
        }
    }
}

$.registerCustomChatCommand = function(command) {
    if (!$.array.contains($.customCommandList, command)) {
        $.customCommandList.push(command);
    }
}

$.unregisterCustomChatCommand = function(command) {
    if ($.array.contains($.customCommandList, command)) {
        for (var i = 0; i < $.customCommandList.length; i++) {
            if ($.customCommandList[i].equalsIgnoreCase(command)) {
                customCommandList.splice(i, 1);
                break;
            }
        }
    }
}

$.on('command', function(event) {
    var command = event.getCommand();
    var args = event.getArgs();
    
    if (command.equalsIgnoreCase("commands")) {
        var cmdList = "";
        var length = $.commandList.length + $.customCommandList.length;
        var start = 0;
        var end = length;
        var page = "";
        var numPages = 1;
        var more = ""
        var commandsPerPage = $.commandsPerPage;
        
        if (length > commandsPerPage) {
            numPages = Math.ceil(length / commandsPerPage)
            
            if (args.length > 0 && !isNaN(parseInt(args[0]))) {
                start = commandsPerPage * parseInt(args[0]);
                
                page = " page " + args[0] + " of " + numPages + " ";
            } else {
                page = " page 1 of " + numPages + " ";
            }
            
            end = Math.min(start + commandsPerPage, length);
            
            more = " >> Type '!commands <page #>' for more"
        }
        
        for (var i = start; i < end; i++) {
            if (cmdList.length > 0) {
                cmdList = cmdList + " - ";
            }
            
            if (i < $.commandList.length) {
                cmdList = cmdList + "!" + $.commandList[i];
            } else {
                cmdList = cmdList + "!" + $.customCommandList[i - $.commandList.length];
            }
        }
        
        $.say("Commands" + page + ": " + cmdList + more);
    }
    
    if (command.equalsIgnoreCae("commandsperpage")) {
        if (args.length > 0 && !isNaN(parseInt(args[0])) && parseInt(args[0]) >= 10) {
            $.commandsPerPage = parseInt(args[0]);
            $.inidb.set("commands", "_commandsPerPage", args[0]);
            
            $.say("There will now be " + args[0] + " commands per page when using !commands");
        } else {
            $.say("Usage: !commandsperpage <number no less than 10>");
        }
    }
});

var commands = $.inidb.GetKeyList("command", "");
var commandsPerPage = $.inidb.get("command", "_commandsPerPage");

if (!isNaN(parseInt(commandsPerPage)) && parseInt(commandsPerPage) >= 10) {
    $.commandsPerPage = commandsPerPage;
}

if ($.array.contains(commands, "commands")) {
    $.inidb.del("command", "commands");
    commands = $.inidb.GetKeyList("command", "");
}

for (var i = 0; i < commands.length; i++) {
    $.registerCustomChatCommand(commands[i]);
}