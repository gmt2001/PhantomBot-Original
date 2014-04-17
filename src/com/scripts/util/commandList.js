$.commandList = new Array();

$.registerChatCommand = function(command) {
    if (!$.array.contains($.commandList, command)) {
        $.commandList.push(command);
    }
}

$.on('command', function(event) {
    var command = event.getCommand();
    
    if (command.equalsIgnoreCase("commands")) {
        var cmdList = "";
        
        for (var i = 0; i < $.commandList.length; i++) {
            if (cmdList.length > 0) {
                cmdList = cmdList + " - ";
            }
            
            cmdList = cmdList + "!" + $.commandList[i];
        }
        
        $.say("Commands: " + cmdList);
    }
});

var commands = $.inidb.GetKeyList("command", "");

if ($.array.contains(commands, "commands")) {
    $.inidb.del("command", "commands");
    commands = $.inidb.GetKeyList("command", "");
}

for (var i = 0; i < commands.length; i++) {
    $.registerChatCommand(commands[i]);
}