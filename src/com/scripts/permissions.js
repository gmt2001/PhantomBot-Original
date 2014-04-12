$.hasGroupById = function(user, id) {
    return $.getUserGroupId(user) >= id;
}
 
$.hasGroupByName = function(user, name) {
    return $.hasGroupById(user, $.getGroupIdByName(name));    
}
 
$.getUserGroupId = function(user) {
    user = $.username.resolve(user);
    var group = $.db.get('group', user.toLowerCase());
    if(group == null) group = 0;
    else group = int(group);
    return group;
}
 
$.getUserGroupName = function(user) {
    return $.getGroupNameById($.getUserGroupId(user));
}
 
$.setUserGroupById = function(user, id) {
    user = $.username.resolve(user);
    $.db.set('group', user.toLowerCase(), id);
}
 
$.setUserGroupByName = function(user, name) {
    $.setUserGroupById(user, $.getGroupIdByName(name));
}
 
$.getGroupNameById = function(id) {
    id = parseInt(id);
    switch(id) {
    case 0: return "Viewer";
    case 1: return "Regular";
    case 2: return "Prinny";
    case 3: return "Golden";
    case 4: return "Burning";
    case 5: return "Moderator";
    case 7: return "Administrator";
    default: return "Viewer";
    }
}
 
$.getGroupIdByName = function(name) {
    name = name + "";
    switch(name) {
    case "Viewer": return 0;
    case "Regular": return 1;
    case "Prinny": return 2;
    case "Golden": return 3;
    case "Burning": return 4;
    case "Moderator": return 5;
    case "Administrator": return 7;
    default: return 0;
    }
}

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(args.length >= 3) {
        if(command.equalsIgnoreCase("perm")) {
            if (!sender == "phantomindex" || !$.hasGroupByName(sender, "Administrator")) {
                $.say($.username.resolve(sender) + ", " + $.getUserGroupName(username) + "s aren't allowed access to this command! Administrators only.");
                return;
                
            }
            var subCommand = args[0];
 
            if (subCommand.equalsIgnoreCase("set")) {
                $.setUserGroupByName(args[1], args[2]);
                $.say("Rank for " + $.username.resolve(args[1]) + " changed to " + args[2] + "!");
            }
        }
    }
            if (command.equalsIgnoreCase("rank")) {
             if (args.length >= 1) {
                var username = args[0];
                $.say($.username.resolve(username) + " is currently in the " + $.getUserGroupName(username) + " rank.");
                } else {
                $.say($.username.resolve(sender) + ", you're in the " + $.getUserGroupName(username) + " rank, dood.");
                }
            } 
});

$.on('consoleInput', function(event) {
    var command = event.getMsg().split(" ")[0];
    var argsString = event.getMsg().replace(command, "").trim();
    var args;
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(args.length >= 3) {
        if(command.equalsIgnoreCase("perm")) {
            var subCommand = args[0];
 
            if (subCommand.equalsIgnoreCase("set")) {
                $.setUserGroupByName(args[1], args[2]);

            } 

        }
    }
});
