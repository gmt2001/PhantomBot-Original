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
        
        if (args.length == 0) {
            if ($var.raffle_running) {
                followers = "";
                prices = "";
                
                if ($var.raffle_followers) {
                    followers = " You must be following the channel to win!";
                }
                
                if ($var.raffle_price > 0) {
                    prices = " Entering costs " + $var.raffle_price + " " + $.pointname + "!";
                }
                
                $.say("/me Time for a Raffle! Type '" + $var.raffle_keyword + "' to enter!." + followers + prices + " Type '!raffle end' to choose a winner");
            } else {
                $.say("Usage: !raffle start [-followers] <price> <keyword> <points reward>, !raffle start [-followers] <price> <keyword> <custom reward (for game keys etc)>, !raffle end, !raffle repick");
            }
            return;
        }
        
        var subCommand = args[0];
 
        if (subCommand.equalsIgnoreCase("start")) {
            if (!$.isMod(sender)) {
                $.say(username + ", " + $.getUserGroupName(sender) + "s aren't allowed to start raffles! Moderators only.");
                return;
            }
 
            if ($var.raffle_running || args.length < 4) {
                return;
            }
            
            var followers_only = false;
            var price = -1;
            var keyword = "";
            var reward = "";
            i = 1;
            
            if (args[i] != null && args[i] != undefined && args[i].equalsIgnoreCase("-followers")) {
                followers_only = true;
                i++;
            }
            
            if (args[i] != null && args[i] != undefined && !isNaN(args[i])) {
                price = parseInt(args[i]);
                i++;
            }
            
            if (args[i] != null && args[i] != undefined && !args[i].isEmpty()) {
                keyword = args[i];
                i++;
            }
            
            if (args[i] != null && args[i] != undefined && !args[i].isEmpty()) {
                reward = args[i];
                i++;
            }
            
            if (price <= -1 || keyword.isEmpty() || reward.isEmpty()) {
                $.say("Invalid format. Usage: !raffle start [-followers] <price> <keyword> <reward>");
                return;
            }
 
            $var.raffle_entrants = [];
            $var.raffle_price = Math.max(price, 0);
            $var.raffle_mode = 0;
            $var.raffle_keyword = keyword;
            $var.raffle_followers = followers_only;
            
            followers = "";
            prices = "";
            
            if (followers_only) {
                followers = " You must be following the channel to win!";
            }
                
            if (price > 0) {
                prices = " Entering costs " + $var.raffle_price + " " + $.pointname + "!";
            }
            
            if (isNaN(reward)) {
                $var.raffle_mode = 1;
                $var.raffle_win = reward;
                
                $.say("/me [Raffle] for -> [" + reward + "] <-" + followers + prices + " Enter to win by saying the keyword: " + keyword);
            } else {
                $var.raffle_win = Math.max(parseInt(reward), 0);
                
                $.say("/me [Raffle] for -> [" + reward + " " + $.pointname + "] <-" + followers + prices + " Enter to win by saying the keyword: " + keyword);

            }
            
            $var.raffle_running = true;
        } else if (subCommand.equalsIgnoreCase("end")) {
            if (!$.isMod(sender)) {
                $.say("/me " +  username + ", " + $.getUserGroupName(username) + "s aren't allowed to end raffles! Moderators only.");
                return;
            }
 
            if (!$var.raffle_running) {
                return;
            }
            
            $var.raffle_running = false;
 
            if ($var.raffle_entrants.length == 0) {
                $.say("/me The raffle has ended! No one entered the raffle.");
                return;
            }
 
            i = 0;
 
            do {
                if (i > ($var.raffle_entrants.length * 2)) {
                    winner = null;
                    break;
                }
                
                winner = $.randElement($var.raffle_entrants);
                followed = $.inidb.get('followed', winner.toLowerCase());
                
                i++;
            } while ($var.raffle_followers && (followed == null || followed == undefined || !followed.equalsIgnoreCase("1")));
            
            if (winner == null) {
                $.say("/me There is no winner!");
                return;
            }


            if ($var.raffle_mode == 0) {
                $.say("/me [Winner] -> " + winner + "! Congratulations! " + $var.raffle_win + " " + $.pointname + " have been credited to your account!");
                
                $.inidb.incr('points', winner.toLowerCase(), $var.raffle_win);
            } else {
                $.say("/me [Winner] for [" + $var.raffle_win + "] is " + winner + "! Congratulations!");
            }
        } else if (subCommand.equalsIgnoreCase("repick")) {
            if (!$.isMod(sender)) {
                $.say("/me " +  username + ", " + $.getUserGroupName(username) + "s aren't allowed to end raffles! Moderators only.");
                return;
            }
 
            if ($var.raffle_running || $var.raffle_entrants.length == 0 || $var.raffle_mode == 0) {
                return;
            }
 
            i = 0;
 
            do {
                if (i > ($var.raffle_entrants.length * 2)) {
                    winner = null;
                    break;
                }
                
                winner = $.randElement($var.raffle_entrants);
                followed = $.inidb.get('followed', winner.toLowerCase());
                
                i++;
            } while ($var.raffle_followers && (followed == null || followed == undefined || !followed.equalsIgnoreCase("1")));
            
            if (winner == null) {
                $.say("/me There is no winner!");
            } else {
                $.say("/me [Winner] for [" + $var.raffle_win + "] is " + winner + "! Congratulations!");
            }
        }
    }
});

$.on('ircChannelMessage', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var message = event.getMessage();
    
    if ($var.raffle_running) {
        if (!message.toLowerCase().contains($var.raffle_keyword.toLowerCase()) || $.array.contains($var.raffle_entrants, sender)) {
            return;
        }
            
        var points = $.inidb.get('points', sender);
            
        if(points == null) {
            points = 0;
        } else {
            points = int(points);
        }
           
        if ($var.raffle_price > points) {
            $.say("/me " + username + ", " + " you don't have enough " + $.pointname + " to enter!");
            return;
        }
 
        $.inidb.decr('points', sender, price);
 
        $var.raffle_entrants.push(username);
    }
});

$.registerChatCommand("raffle");