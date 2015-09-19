$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
 
    if(command.equalsIgnoreCase("raffle")) {
        var followers;
        var prices;
        var winner;
        var followed;
        var i;
        var prize;
        var str;
        
        if (args.length == 0) {
            if ($.raffle_running) {
                followers = "";
                prices = "";
                prize = $.raffle_win;
                
                if ($.raffle_followers) {
                    followers = " You must be following the channel to win!";
                }
                
                if ($.moduleEnabled("./systems/pointSystem.js") && $.raffle_price > 0) {
                    prices = " Entering costs " + $.raffle_price + " " + $.pointname + "!";
                    prize = $.raffle_win + " " + $.pointname;
                }
                
                $.say("/me Time for a Raffle! Type '" + $.raffle_keyword + "' to enter for a chance to win '" + prize + "'!." + followers + prices + " Type '!raffle end' to choose a winner");
            } else {
                prices = "";
                followers = "";
                
                if ($.moduleEnabled("./systems/pointSystem.js")) {
                    prices = "< price> ";
                    followers = "!raffle start [-followers] " + prices + "<keyword> < points reward>, ";
                }
                
                $.say("Usage: " + followers + "!raffle start [-followers] " + prices + "<keyword> <custom reward (for game keys etc)>, !raffle end, !raffle repick");
            }
            return;
        }
        
        var subCommand = args[0];
 
        if (subCommand.equalsIgnoreCase("start")) {
            if (!$.isMod(sender)) {
                $.say(username + ", " + $.getUserGroupName(sender) + "s aren't allowed to start raffles! Moderators only.");
                return;
            }
 
            if ($.raffle_running || (($.moduleEnabled("./systems/pointSystem.js") && args.length < 4)
                || (!$.moduleEnabled("./systems/pointSystem.js") && args.length < 3))) {
                return;
            }
            
            var followers_only = false;
            var truerandom = false;
            var price = -1;
            var keyword = "";
            var reward = "";
            i = 1;
            
            if (args[i] != null && args[i] != undefined && args[i].equalsIgnoreCase("-followers")) {
                followers_only = true;
                i++;
            }
            
            if (args[i] != null && args[i] != undefined && args[i].equalsIgnoreCase("-truerandom")) {
                truerandom = true;
                i++;
            }
            
            if ($.moduleEnabled("./systems/pointSystem.js") && args[i] != null && args[i] != undefined && !isNaN(args[i])) {
                price = parseInt(args[i]);
                i++;
            }
            
            if (args[i] != null && args[i] != undefined && !args[i].isEmpty()) {
                keyword = args[i];
                i++;
            }
            
            if (args[i] != null && args[i] != undefined && !args[i].isEmpty()) {
                reward = argsString.substring(argsString.indexOf(keyword) + $.strlen(keyword) + 1);
            }
            
            if (($.moduleEnabled("./systems/pointSystem.js") && price <= -1) || keyword.isEmpty() || reward.isEmpty()) {
                prices = "";
                
                if ($.moduleEnabled("./systems/pointSystem.js")) {
                    prices = "< price> ";
                }
                
                $.say("Invalid format. Usage: !raffle start [-followers] " + prices + "<keyword> <reward>");
                return;
            }
 
            $.raffle_entrants = [];
            $.raffle_price = Math.max(price, 0);
            $.raffle_mode = 0;
            $.raffle_keyword = keyword;
            $.raffle_followers = followers_only;
            $.raffle_truerandom = truerandom;
            
            followers = "";
            prices = "";
            
            if (followers_only) {
                followers = " You must be following the channel to win!";
            }
                
            if (price > 0) {
                prices = " Entering costs " + $.raffle_price + " " + $.pointname + "!";
            }
            
            str = ", keyword '" + keyword + "'";
            
            if (followers_only) {
                str += ", followers only";
            }
            
            if (price > 0) {
                str += ", costing " + price + " points to enter";
            }
            
            if (!$.moduleEnabled("./systems/pointSystem.js") || isNaN(reward)) {
                $.logEvent("raffleSystem.js", 131, username + " opened up a raffle with prize '" + reward + "'" + str);
                
                $.raffle_mode = 1;
                $.raffle_win = reward;
                
                $.say("/me [Raffle] for -> [" + reward + "] <-" + followers + prices + " Enter to win by saying the keyword: " + keyword);
            } else {
                $.logEvent("raffleSystem.js", 138, username + " opened up a points raffle with prize '" + reward + " " + $.pointname + "'" + str);
                
                $.raffle_win = Math.max(parseInt(reward), 0);
                
                $.say("/me [Raffle] for -> [" + reward + " " + $.pointname + "] <-" + followers + prices + " Enter to win by saying the keyword: " + keyword);
            }
            
            if ($.raffle_truerandom) {
                $.logEvent("raffleSystem.js", 146, ">> This raffle is in true random mode");
            }
            
            $.raffle_running = true;
        } else if (subCommand.equalsIgnoreCase("setprize")) {
            if (!$.isMod(sender)) {
                $.say("/me " +  username + ", " + $.getUserGroupName(username) + "s aren't allowed to use setprize! Moderators only.");
                return;
            }
 
            if (!$.raffle_running) {
                return;
            }
            
            argsString = argsString.substring(argsString.indexOf(args[0]) + $.strlen(args[0]) + 1);
            
            if ($.raffle_mode == 0) {
                $.logEvent("raffleSystem.js", 163, username + " changed the raffle prize to '" + argsString + " " + $.pointname + "'");
                
                $.raffle_win = Math.max(parseInt(argsString), 0);
            } else {
                $.logEvent("raffleSystem.js", 167, username + " changed the raffle prize to '" + argsString + "'");
                
                $.raffle_win = argsString;
            }
            
            $.say("Raffle prize set!");
        } else if (subCommand.equalsIgnoreCase("end")) {
            if (!$.isMod(sender)) {
                $.say("/me " +  username + ", " + $.getUserGroupName(username) + "s aren't allowed to end raffles! Moderators only.");
                return;
            }
 
            if (!$.raffle_running) {
                return;
            }
            
            $.raffle_running = false;
 
            if ($.raffle_entrants.length == 0) {
                $.say("/me The raffle has ended! No one entered the raffle.");
                return;
            }
 
            i = 0;
 
            do {
                if (i > ($.raffle_entrants.length * 2)) {
                    winner = null;
                    break;
                }
                
                if ($.raffle_truerandom) {
                    winner = $.trueRandElement($.raffle_entrants);
                } else {
                    winner = $.randElement($.raffle_entrants);
                }
                
                if (winner == null) {
                    followed = null;
                } else {
                    followed = $.inidb.get('followed', winner.toLowerCase());
                }
                
                i++;
            } while ($.raffle_followers && (followed == null || followed == undefined || !followed.equalsIgnoreCase("1")));
            
            if (winner == null) {
                $.say("/me There is no winner!");
                return;
            }
            
            for (i = 0; i < $.raffle_entrants.length; i++) {
                if ($.raffle_entrants[i].equalsIgnoreCase(winner)) {
                    $.raffle_entrants.splice(i, 1);
                }
            }

            $.logEvent("raffleSystem.js", 222, username + " ended the raffle and the winner was " + winner);

            if ($.raffle_mode == 0) {
                $.say("/me [Winner] -> " + winner + "! Congratulations! " + $.raffle_win + " " + $.pointname + " have been credited to your account!");
                
                $.inidb.incr('points', winner.toLowerCase(), $.raffle_win);
            } else {
                $.say("/me [Winner] for [" + $.raffle_win + "] is " + winner + "! Congratulations!");
            }
        } else if (subCommand.equalsIgnoreCase("repick")) {
            if (!$.isMod(sender)) {
                $.say("/me " +  username + ", " + $.getUserGroupName(username) + "s aren't allowed to end raffles! Moderators only.");
                return;
            }
 
            if ($.raffle_running) {
                return;
            }
            
            if ($.raffle_mode == 0) {
                $.say("You can not use repick on a points raffle!");
                return;
            }
 
            i = 0;
 
            do {
                if (i > ($.raffle_entrants.length * 2)) {
                    winner = null;
                    break;
                }
                
                if ($.raffle_truerandom) {
                    winner = $.trueRandElement($.raffle_entrants);
                } else {
                    winner = $.randElement($.raffle_entrants);
                }
                
                if (winner == null) {
                    followed = null;
                } else {
                    followed = $.inidb.get('followed', winner.toLowerCase());
                }
                
                i++;
            } while ($.raffle_followers && (followed == null || followed == undefined || !followed.equalsIgnoreCase("1")));
            
            $.logEvent("raffleSystem.js", 265, username + " repicked the raffle winner and the new winner was " + winner);
            
            if (winner == null) {
                $.say("/me There is no winner!");
            } else {
                for (i = 0; i < $.raffle_entrants.length; i++) {
                    if ($.raffle_entrants[i].equalsIgnoreCase(winner)) {
                        $.raffle_entrants.splice(i, 1);
                    }
                }
            
                $.say("/me [Winner] for [" + $.raffle_win + "] is " + winner + "! Congratulations!");
            }
        } else if (subCommand.equalsIgnoreCase("truerandom")) {
            if (!$.isMod(sender)) {
                $.say("/me " +  username + ", " + $.getUserGroupName(username) + "s aren't allowed to use truerandom! Moderators only.");
                return;
            }
 
            if (!$.raffle_running) {
                return;
            }
            
            $.raffle_truerandom = !$.raffle_truerandom;
            
            if ($.raffle_truerandom) {
                $.say("+done!");
            } else {
                $.say("-done!");
            }
        } else if (subCommand.equalsIgnoreCase("count")) {
            if (!$.raffle_running) {
                return;
            }
            
            $.say("There are currently " + $.raffle_entrants.length + " entries in the raffle!");
        }
    }
});

$.on('ircChannelMessage', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var message = event.getMessage();
    
    if ($.raffle_running) {
        if (message.toLowerCase().indexOf($.raffle_keyword.toLowerCase()) == -1 || $.array.contains($.raffle_entrants, username)) {
            return;
        }
        
        if ($.raffle_price > 0) {
            var points = $.inidb.get('points', sender);
            
            if (points == null) {
                points = 0;
            } else {
                points = parseInt(points);
            }
           
            if ($.raffle_price > points) {
                $.say("/me " + username + ", " + " you don't have enough " + $.pointname + " to enter!");
                return;
            }
 
            $.inidb.decr('points', sender, $.raffle_price);
        }
 
        $.raffle_entrants.push(username);
        $.say(username + " has entered the raffle!");
    }
});

$.registerChatCommand("./systems/raffleSystem.js", "raffle");