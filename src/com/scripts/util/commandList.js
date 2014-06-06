if ($.commandList == null || $.commandList == undefined) {
    $.commandList = new Array();
}

if ($.customCommandList == null || $.customCommandList == undefined) {
    $.customCommandList = new Array();
}

$.commandsPerPage = 20;

$.registerChatCommand = function(command) {
    var scriptFile = $script.getPath().replace("\\", "/").replace("./scripts/", "");
    var i;
    
    for (i = 0; i < $.commandList.length; i++)
    {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            if (!$.commandList[i][0].equalsIgnoreCase(scriptFile)) {
                throw "Command already registered";
            }
            
            return;
        }
    }
    
    for (i = 0; i < $.customCommandList.length; i++)
    {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            if (!$.customCommandList[i][0].equalsIgnoreCase(scriptFile)) {
                throw "Command already registered";
            }
            
            return;
        }
    }
        
    $.commandList.push(new Array(scriptFile, command));
}

$.unregisterChatCommand = function(command) {
    for (var i = 0; i < $.commandList.length; i++) {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            commandList.splice(i, 1);
            break;
        }
    }
}

$.registerCustomChatCommand = function(command) {
    var scriptFile = $script.getPath().replace("\\", "/").replace("./scripts/", "");
    var i;
    
    for (i = 0; i < $.commandList.length; i++)
    {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            if (!$.commandList[i][0].equalsIgnoreCase(scriptFile)) {
                throw "Command already registered";
            }
            
            return;
        }
    }
    
    for (i = 0; i < $.customCommandList.length; i++)
    {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            if (!$.customCommandList[i][0].equalsIgnoreCase(scriptFile)) {
                throw "Command already registered";
            }
            
            return;
        }
    }
        
    $.customCommandList.push(new Array(scriptFile, command));
}

$.unregisterCustomChatCommand = function(command) {
    for (var i = 0; i < $.customCommandList.length; i++) {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            customCommandList.splice(i, 1);
            break;
        }
    }
}

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var command = event.getCommand();
    var args = event.getArgs();
    
    if (command.equalsIgnoreCase("commands")) {
        var cmdList = "";
        var length = 0;
        var start = 0;
        var num = length;
        var page = "";
        var numPages = 1;
        var more = ""
        var commandsPerPage = $.commandsPerPage;
        var i;
        
        for (i = 0; i < $.commandList.length + $.customCommandList.length; i++) {
            if (i < $.commandList.length) {
                if ($.moduleEnabled($.commandList[i][0])) {
                    length++;
                }
            } else {
                if ($.moduleEnabled($.customCommandList[i - $.commandList.length][0])) {
                    length++;
                }
            }
        }
        
        if (commandsPerPage == null) {
            commandsPerPage = 20;
        }
        
        if (length > commandsPerPage) {
            numPages = Math.ceil(length / commandsPerPage);
            
            if (args.length > 0 && !isNaN(parseInt(args[0]))) {
                start = commandsPerPage * (parseInt(args[0]) - 1);
                
                page = " page " + args[0] + " of " + numPages + " ";
            } else {
                page = " page 1 of " + numPages + " ";
            }
            
            num = Math.min(commandsPerPage, length - start);
            
            more = " >> Type '!commands < page #>' for more"
        }
        
        if (parseInt(args[0]) > numPages) {
            return;
        }
        
        for (i = 0; i < $.commandList.length + $.customCommandList.length; i++) {
            if (i > start) {
                break;
            }
            
            if (i < $.commandList.length) {
                if (!$.moduleEnabled($.commandList[i][0])) {
                    start++;
                }
            } else {
                if (!$.moduleEnabled($.customCommandList[i - $.commandList.length][0])) {
                    start++;
                }
            }
        }
        
        for (i = start; num > 0; i++) {
            if (i < $.commandList.length) {
                if (!$.moduleEnabled($.commandList[i][0])) {
                    continue;
                }
            } else {
                if (!$.moduleEnabled($.customCommandList[i - $.commandList.length][0])) {
                    continue;
                }
            }
            
            if (cmdList.length > 0) {
                cmdList = cmdList + " - ";
            }
            
            if (i < $.commandList.length) {
                cmdList = cmdList + "!" + $.commandList[i][1];
            } else {
                cmdList = cmdList + "!" + $.customCommandList[i - $.commandList.length][1];
            }
            
            num--;
        }
        
        $.say("Commands" + page + ": " + cmdList + more);
    }
    
    if (command.equalsIgnoreCase("commandsperpage")) {
        if (args.length > 0 && !isNaN(parseInt(args[0])) && parseInt(args[0]) >= 10 && isAdmin(sender)) {
            $.commandsPerPage = parseInt(args[0]);
            $.inidb.set("commands", "_commandsPerPage", args[0]);
            
            $.say("There will now be " + args[0] + " commands per page when using !commands");
        } else {
            $.say("Usage: !commandsperpage <number no less than 10>");
        }
    }
});

var commandsPerPage = $.inidb.get("command", "_commandsPerPage");

if (commandsPerPage != null && !isNaN(parseInt(commandsPerPage)) && parseInt(commandsPerPage) >= 10) {
    $.commandsPerPage = commandsPerPage;
}