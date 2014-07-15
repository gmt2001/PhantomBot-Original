$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender).toLowerCase();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    var exp;
    var action;
    var exp_user;
    
    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if (command.equalsIgnoreCase("level")) {
        if (!$.moduleEnabled("./systems/pointSystem.js")) {
            $.say("You can not use !level becasue points are disabled!");
            return;
        }
        
        if (args.length == 3) {
            if (!$.isAdmin(sender)) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }

            action = args[0];
            username = args[1].toLowerCase();
            exp = int(args[2]);

        } else {
            exp_user = sender;
            if (args.length == 1) {
                exp_user = args[0].toLowerCase();
            }

            exp = $.inidb.get('exp', exp_user);
            var level = (25 + Math.sqrt(625 + 100 * exp)) / 50;


            if (exp == null) exp = 0;
            if (level == null) level = 1;


            $.say($.username.resolve(exp_user) + " is at level " + int(level) + " with a total of " + int(exp) + " exp." );
        }

    }

    if (command.equalsIgnoreCase("exp")) {
        if (!$.moduleEnabled("./systems/pointSystem.js")) {
            $.say("You can not use !exp becasue points are disabled!");
            return;
        }
        
        if (args.length == 3) {
            if (!$.isAdmin(sender)) {
                $.say("You must be a Administrator to use this command " + username + ".");
                return;
            }
            
            action = args[0];
            username = args[1].toLowerCase();
            exp = int(args[2]);

            if (action.equalsIgnoreCase("give")) {
                $.inidb.incr('exp', username, exp);
                $.say(exp + " exp was sent to " + $.username.resolve(username) + ".");
            } else if (action.equalsIgnoreCase("take")) {
                $.inidb.decr('exp', username, exp);
                $.say(exp + " exp was taken from " + $.username.resolve(username) + ".");
            } else if (action.equalsIgnoreCase("set")) {
                $.inidb.set('exp', username, exp);
                $.say($.username.resolve(username) + "'s exp was set to " + exp + ".");
            } else {
                $.say("Usage: !exp give <username> <amount>, !exp take <username> <amount>, !exp set <username> <amount>")
            }
        }

        if (args.length > 0 && args[0].equalsIgnoreCase("help")) {
            $.say("Usage: !exp give <username> <amount>, !exp take <username> <amount>, !exp set <username> <amount>");
            return;
        }

        if (args.length == 0) {
            $.say("Type >> '!exp buy <amount>' to exchange your " + $.pointname + " for EXP.")
            return;
        }

        if (args.length == 2) {
            action = args[0];
            exp = int(args[1]);
            var amount = Math.max(0, int(args[1]));
            var points = $.inidb.get('points', sender);

            if (action.equalsIgnoreCase("buy")) {
                if (points == null) points = 0;
                else points = int(points);
                
                if(amount > points) {
                    $.say($.username.resolve(sender) + ", " + " you don't have enough " + $.pointname + " to do that!");
                    return;
                }
                var exp2 = amount * 2;
                $.inidb.decr('points', sender, amount);
                $.inidb.incr('exp', sender, exp2);

                $.say($.username.resolve(username) + " exchanged " + amount + " " + $.pointname + " for " + exp2 + " EXP.");
            }
        } 
    }

    if (command.equalsIgnoreCase("mytitle")) {
        if (!$.moduleEnabled("./systems/pointSystem.js")) {
            $.say("You can not use !mytitle because points are disabled!");
            return;
        }
        
        if (args.length >= 1) {
            username = args[0];
            title = $.getTitle (username);

            $.say($.username.resolve(username) + "'s title is: " + title);

        } else {
            title = $.getTitle (username);
            $.say($.username.resolve(sender) + "'s title is: " + title);
        }
    }
});

$.registerChatCommand("level");
$.registerChatCommand("exp");
$.registerChatCommand("exp help");
$.registerChatCommand("mytitle");

$.getTitle = function (username) {
    var exp = $.inidb.get('exp', username);
    var level = (25 + Math.sqrt(625 + 100 * exp)) / 50;
    var title = "";
 
    if ( level >= 1) {
        title = "Fresh";
    }
    if ( level >= 5 ) {
        title = "F Tier";
    }
    if ( level >= 10 ) {
        title = "E Tier";
    }
    if ( level >= 15 ) {
        title = "D Tier";
    }
    if ( level >= 20 ) {
        title = "C Tier";
    }
    if ( level >= 25 ) {
        title = "A Tier";
        if (level == 25) {
            if ($.hasGroupById(username, 0)) {
                $.setUserGroupByName(username, "Regular");
                $.say($.username.resolve(username) + " hit level " + level + "! You earn the title and rank of Regular!");
            }
        }
    }
    if ( level >= 30 ) {
        title = "S Tier";
    }
    if ( level >= 35 ) {
        title = "SS Tier";
    }
    if ( level >= 40 ) {
        title = "SSS Tier";
    }
    if ( level >= 45 ) {
        title = "Waifu Tier";
    }
    if ( level >= 50 ) {
        title = "God Tier";
    }
    if ( level >= 55 ) {
        title = "Brokanoe Tier";
    }
    if ( level >= 60 ) {
        title = "Wielder of the Azure";
    }
    if ( level >= 65 ) {
        title = "Successor to the Azure";
    }
    if ( level >= 70 ) {
        title = "Gear"
    }
    if ( level >= 75 ) {
        title = "Murakumo Tier";
    }
    if ( level >= 80) {
        title = "Sword of Izanagi";
    }
    if ( level >= 100) {
        title = "Sword of Kusanagi";
    }
    return title;
};
