$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }
 
    if(command.equalsIgnoreCase("raffle")) {
        if (args.length == 0) {
            if ($var.raffle_running) {
                $.say("/me Time for a Raffle! Type '!raffle ticket <amount>' to buy tickets." + " Each ticket costs " + $var.raffle_price + " " + $.pointname + " per ticket, doods!");
            } else {
                $.say("Doesn't seem to be any raffles going on at the moment, dood.");
            }
            return;
        }
        
        var subCommand = args[0];
 
        if (subCommand.equalsIgnoreCase("start")) {
            if (!$.hasGroupByName(sender, "Prinny")) {
                $.say("/me " + $.username.resolve(sender) + ", " + $.getUserGroupName(username) + "s aren't allowed to start raffles! Moderators only.");
                return;
            }
 
            if ($var.raffle_running) return;
            if (args.length < 3) return;
 
            if (isNaN(args[1])) {
                $.say("/me You typed the command arguments the wrong way it's 'raffle start < points > <reward>' " + username + "!");
                return;
            }
 
            $var.raffle_tickets = [];
            $var.raffle_price = args[1];
            $var.raffle_mode = 0;
            $var.raffle_times = {};
            if (isNaN(args[2])) {
                $var.raffle_mode = 1;
                $var.raffle_win = args[2];
                $.say("/me [Raffle] for -> [" + args[2] + "] <- closing in ONE minute, get your entries in by typing !enter if you have not already entered.");
            } else {
                $var.raffle_win = parseInt(args[2]);
                $.say("/me The [Raffle] for " + args[2] + " " + $.pointname + " has started, doods! Type '!raffle ticket <amount>' to buy tickets for " + args[1] + " " + $.pointname + " per ticket, doods!");

            }
                        $var.raffle_running = true;
        } else if (subCommand.equalsIgnoreCase("ticket")) {
            if (!$var.raffle_running) return;
            if (args.length < 2) return;
           
            var times = parseInt(args[1]);
 
            var atimes = $var.raffle_times[username];
                        println (atimes);
            if(atimes == undefined) {
                                atimes = 0;
                        } else {
                                atimes = int(atimes);
                        }
 
            if (atimes + times >= 6) {
                $.say(sender + ", you can only buy up to 5 tickets, dood!");
                return;
            }
 
            var price = parseInt($var.raffle_price) * times;
           
            var points = $.db.get('points', sender);
            if(points == null) points = 0;
            else points = int(points);
           
            if(price > points) {
                $.say("/me " + $.username.resolve(sender) + ", " + " you don't have enough " + $.pointname + " to buy that much, dood!");
                return;
            }
 
            if (price <= 0) {
                $.say("/me " +  $.username.resolve(sender) + ", " + " please use a positive amount of tickets, dood!");
                return;  
            }
 
            $.db.decr('points', sender, price);
 
            for (var i = 0; i < parseInt(args[1]); i++) {
                $var.raffle_tickets.push(username);
            }
           
            $var.raffle_tickets[username] = atimes + times;
 
            $.say($.username.resolve(sender) + " bought " + args[1] + " tickets!");
        } else if (subCommand.equalsIgnoreCase("end")) {
            if (!$.hasGroupByName(sender, "Prinny")) {
                $.say("/me " +  $.username.resolve(sender) + ", " + $.getUserGroupName(username) + "s aren't allowed to end raffles! Moderators only.");
                return;
            }
 
            if (!$var.raffle_running) return;
 
            if ($var.raffle_tickets == []) {
                $.say("/me Raffle has ended! No one entered the raffle.");
            }
 
            var winner = $.randElement($var.raffle_tickets);
            if (winner == null) {
                var winner = "None";
            }


            if ($var.raffle_mode == 0) {
                $.say("/me [Winner] -> " + winner + "! Congratulations! " + $var.raffle_win + " " + $.pointname + " have been credited to your account!");
                $.db.incr('points', winner.toLowerCase(), $var.raffle_win);
            } else {
                $.say("/me [Winner] for [" + $var.raffle_win + "] is " + winner + "! Congratulations!");
            }
            $var.raffle_running = false;
        }
    }
});