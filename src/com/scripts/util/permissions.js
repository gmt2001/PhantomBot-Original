var usergonetime = 10 * 60 * 1000;
var usercheckinterval = 3 * 60 * 1000;

if ($.modeOUsers == null || $.modeOUsers == undefined) {
    $.modeOUsers = new Array();
}

if ($.users == null || $.users == undefined) {
    $.users = new Array();
}

if ($.lastjoinpart == null || $.lastjoinpart == undefined) {
    $.lastjoinpart = System.currentTimeMillis();
}

$.isBot = function (user) {
    return user.equalsIgnoreCase($.botname);
}

$.isOwner = function (user) {
    return user.equalsIgnoreCase($.botowner);
}

$.isAdmin = function (user) {
    return $.hasGroupByName(user, "Administrator") || $.isOwner(user) || $.isBot(user);
}

$.isMod = function (user) {
    return $.hasGroupByName(user, "Moderator") || $.hasModeO(user) || $.isAdmin(user);
}

$.hasModeO = function (user) {
    return $.array.contains($.modeOUsers, user.toLowerCase());
}

$.isCaster = function (user) {
    return $.hasGroupByName(user, "Caster") || $.isMod(user);
}

$.hasGroupById = function(user, id) {
    return $.getUserGroupId(user) >= id;
}
 
$.hasGroupByName = function(user, name) {
    return $.hasGroupById(user, $.getGroupIdByName(name));    
}
 
$.getUserGroupId = function(user) {
    user = $.username.resolve(user);
    var group = $.inidb.get('group', user.toLowerCase());
    if(group == null) group = 0;
    else group = int(group);
    return group;
}
 
$.getUserGroupName = function(user) {
    return $.getGroupNameById($.getUserGroupId(user));
}
 
$.setUserGroupById = function(user, id) {
    user = $.username.resolve(user);
    $.inidb.set('group', user.toLowerCase(), id);
}
 
$.setUserGroupByName = function(user, name) {
    $.setUserGroupById(user, $.getGroupIdByName(name));
}

var groups = new Array();
var keys = $.inidb.GetKeyList("groups", "");

for (var i = 0 ; i < keys.length; i++) {
    groups[parseInt(keys[i])] = $.inidb.get("groups", keys[i]);
}

if (groups[0] == undefined || groups[0] == null) {
    groups[0] = "Viewer";
}

if (groups[1] == undefined || groups[1] == null) {
    groups[1] = "Regular";
}

if (groups[2] == undefined || groups[2] == null) {
    groups[2] = "Prinny";
}

if (groups[3] == undefined || groups[3] == null) {
    groups[3] = "Golden";
}

if (groups[4] == undefined || groups[4] == null) {
    groups[4] = "Burning";
}

if (groups[5] == undefined || groups[5] == null) {
    groups[5] = "Awesome";
}

if (groups[6] == undefined || groups[6] == null) {
    groups[6] = "Caster";
}

if (groups[7] == undefined || groups[7] == null) {
    groups[7] = "Moderator";
}

if (groups[8] == undefined || groups[8] == null) {
    groups[8] = "Administrator";
}
 
$.getGroupNameById = function(id) {
    id = parseInt(id);
    
    if (id < groups.length) {
        return groups[id];
    }
    
    return groups[0];
}
 
$.getGroupIdByName = function(name) {
    name = name + "";
    
    for (var i = 0; i < groups.length; i++){
        if (groups[i].equalsIgnoreCase(name)) {
            return i;
        }
    }
    
    return 0;
}

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    var name;
    var i;
    var s;
    var allowed = true;
    
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(args.length >= 3) {
        if(command.equalsIgnoreCase("perm")) {
            if (!$.isAdmin(sender)) {
                $.say(username + ", " + $.getUserGroupName(username) + "s aren't allowed access to this command! Administrators only.");
                return;
                
            }
            
            var subCommand = args[0];
 
            if (subCommand.equalsIgnoreCase("set")) {
                name = argsString.substring(argsString.indexOf(args[1]) + args[1].length() + 1);
                
                $.setUserGroupByName(args[1], name);
                $.say("Rank for " + $.username.resolve(args[1]) + " changed to " + name + "!");
            }
        }
    }
    
    if (command.equalsIgnoreCase("group")) {
        if (args.length >= 1) {
            username = args[0];
            $.say($.username.resolve(username) + " is currently in the " + $.getUserGroupName(username) + " group.");
        } else {
            $.say($.username.resolve(sender) + ", you're in the " + $.getUserGroupName(username) + " group.");
        }
    }
    
    if (command.equalsIgnoreCase("groupname")) {
        if (!$.isAdmin(sender)) {
            $.say(username + ", " + $.getUserGroupName(username) + "s aren't allowed access to this command! Administrators only.");
            return;
                
        }
        
        if (args.length < 2) {
            if (args.length == 1 && args[0].equalsIgnoreCase("list")) {
                var ranks = "";
                
                for (i = 0; i < groups.length; i++) {
                    if (ranks.length > 0) {
                        ranks = ranks + " - ";
                    }
                    
                    ranks = ranks + i + " = " + groups[i];
                }
                
                $.say("Groups: " + ranks);
            } else {
                $.say("Usage: !groupname <id> <new name>, !groupname list")
            }
        } else {
            if (parseInt(args[0]) >= groups.length || parseInt(args[0]) < 0) {
                args[0] = 0;
            }
            
            if ($.getGroupNameById(parseInt(args[0])).equals("Administrator")) {
                allowed = false;
                
                for (i = 0; i < groups.length; i++) {
                    if (groups[i].equals("Administrator") && i != parseInt(args[0])) {
                        allowed = true;
                    }
                }
                
                if (!allowed) {
                    $.say("You cant change the name of the 'Administrator' group without first changing another group to 'Administrator'!");
                }
            }
            
            if ($.getGroupNameById(parseInt(args[0])).equals("Moderator")) {
                allowed = false;
                
                for (i = 0; i < groups.length; i++) {
                    if (groups[i].equals("Moderator") && i != parseInt(args[0])) {
                        allowed = true;
                    }
                }
                
                if (!allowed) {
                    $.say("You cant change the name of the 'Moderator' group without first changing another group to 'Moderator'!");
                }
            }
            
            if ($.getGroupNameById(parseInt(args[0])).equals("Caster")) {
                allowed = false;
                
                for (i = 0; i < groups.length; i++) {
                    if (groups[i].equals("Caster") && i != parseInt(args[0])) {
                        allowed = true;
                    }
                }
                
                if (!allowed) {
                    $.say("You cant change the name of the 'Caster' group without first changing another group to 'Caster'!");
                }
            }
            
            name = argsString.substring(argsString.indexOf(args[0]) + args[0].length() + 1);
            
            if (name.length() > 0 && allowed) {
                $.inidb.set("groups", args[0], name);
                
                var oldname = groups[parseInt(args[0])];
                groups[parseInt(args[0])] = name;
                
                $.say("Changed group '" + oldname + "' to '" + name + "'!")
            }
        }
    }

    if (command.equalsIgnoreCase("users")) {
        s = "Users in channel: ";
        
        for (i = 0; i < $.users.length; i++) {
            name = users[i][0];
            
            if (s.length > 18) {
                s += ", ";
            }
                
            s += name.toLowerCase();
        }
        
        $.say(s);
    }
    
    if (command.equalsIgnoreCase("mods")) {
        s = "Mods in channel: ";
        
        for (i = 0; i < $.users.length; i++) {
            name = users[i][0];
            
            if ($.isMod(name.toLowerCase())) {
                if (s.length > 17) {
                    s += ", ";
                }
                
                s += name.toLowerCase();
            }
        }
        
        $.say(s);
    }
    
    if (command.equalsIgnoreCase("admins")) {
        s = "Admins in channel: ";
        
        for (i = 0; i < $.users.length; i++) {
            name = users[i][0];
            
            if ($.isAdmin(name.toLowerCase())) {
                if (s.length > 19) {
                    s += ", ";
                }
                
                s += name.toLowerCase();
            }
        }
        
        $.say(s);
    }
});

$.on('ircChannelMessage', function(event) {
    var sender = event.getSender().toLowerCase();
    var found = false;
    
    for (var i = 0; i < $.users.length; i++) {
        if ($.users[i][0].equalsIgnoreCase(sender)) {
            $.users[i][1] = System.currentTimeMillis();
            found = true;
            break;
        }
    }
        
    if (!found) {
        $.users.push(new Array(sender, System.currentTimeMillis()));
    }
});

$.on('ircJoinComplete', function(event) {
    var channel = event.getChannel();
    var it = channel.getNicks().iterator();
    var name;
    var found = false;
    
    $.lastjoinpart = System.currentTimeMillis();
    
    while(it.hasNext() == true) {
        name = it.next();
        
        for (var i = 0; i < $.users.length; i++) {
            if ($.users[i][0].equalsIgnoreCase(name)) {
                found = true;
                break;
            }
        }
        
        if (!found) {
            $.users.push(new Array(name, System.currentTimeMillis()));
        }
    }
});

$.on('ircChannelJoin', function(event) {
    var username = event.getUser().toLowerCase();
    var found = false;
    
    $.lastjoinpart = System.currentTimeMillis();
    
    for (var i = 0; i < $.users.length; i++) {
        if ($.users[i][0].equalsIgnoreCase(username)) {
            found = true;
            break;
        }
    }
        
    if (!found) {
        $.users.push(new Array(username, System.currentTimeMillis()));
    }
});

$.on('ircChannelLeave', function(event) {
    var username = event.getUser().toLowerCase();
    var i;
    var found = false;
    
    $.lastjoinpart = System.currentTimeMillis();
    
    for (i = 0; i < $.modeOUsers.length; i++) {
        if ($.modeOUsers[i].equalsIgnoreCase(username)) {
            $.modeOUsers.splice(i, 1);
            break;
        }
    }
    
    for (i = 0; i < $.users.length; i++) {
        if ($.users[i][0].equalsIgnoreCase(username)) {
            $.users.splice(i, 1);
            break;
        }
    }
});

$.on('ircChannelUserMode', function(event) {
    if (event.getMode().equalsIgnoreCase("o")) {
        if (event.getAdd()) {
            if (!$.array.contains($.modeOUsers, event.getUser().toLowerCase())) {
                $.modeOUsers.push(event.getUser().toLowerCase());
            }
        } else {
            for (var i = 0; i < $.modeOUsers.length; i++) {
                if ($.modeOUsers[i].equalsIgnoreCase(event.getUser().toLowerCase())) {
                    $.modeOUsers.splice(i, 1);
                    break;
                }
            }
        }
    }
});

$.setInterval(function() {
    var curtime = System.currentTimeMillis();
    
    if ($.lastjoinpart + usergonetime < curtime) {
        for (var i = 0; i < $.users.length; i++) {
            if ($.users[i][1] + usergonetime < curtime) {
                $.users.splice(i, 1);
                i--;
            }
        }
    }
}, usercheckinterval);

$.registerChatCommand("perm set");
$.registerChatCommand("group");
$.registerChatCommand("groupname");
$.registerChatCommand("users");
$.registerChatCommand("mods");
$.registerChatCommand("admins");