/* 
!bet >> Current Bet Session || Type '!bet option1 vs option2' to start
!bet option1 vs option2 >> starts a new bet
!bet 1 <amount> || !bet 2 <amount>
Timer 30 seconds
Bets are locked!
!bet end option
The winning bet is "option" reward points have been distributed!
*/




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

    if(command.equalsIgnoreCase("bet")) {
        if(args.length >= 2) {
            var action = args[0];	
			
            if(action.equalsIgnoreCase("open")) {
                if (!$.hasGroupByName(sender, "Viewer")) {
                    $.say("You must be a Viewer to use this command " + username + ".");
                    return;
                }
                if($var.bet_running) {
                    $.say("There's still a bet session open!");
                    return;
                }
                $var.bet_options = [];
                var optionString = '';
                for (var i = 1; i < args.length; i++) {
                    optionString += args[i] + ' ';
                }
                optionString.trim();
                var boptions = optionString.split(' & ');
                for (var i = 0; i < boptions.length; i++) {
                    $var.bet_options.push(boptions[i].trim().toLowerCase());
                }
                while (optionString.indexOf('&') != -1) {
                    optionString = optionString.replace('&', 'vs')
                }

                $var.bet_table = { };
                $var.bet_running = true;
                $.say(" Bets are open for " + optionString + ">> Awaiting players to wager thier points with :'!bet <option> <#>'");
                $var.bet_optionsString = optionString;

                $var.bet_id = System.currentTimeMillis();

                setTimeout(function() {
                    beginTime($var.bet_id)
                    }, 5)
            } else if(action.equalsIgnoreCase("close" || "end")) {
                if (!$.hasGroupByName(sender, "Viewer")) {
                    $.say("You must be a Regular to use this command " + username + ".");
                    return;
                }
				
                if(!$var.bet_running) return;
                var winning = args[1].toLowerCase();
				
                if(!$.array.contains($var.bet_options, winning)) {
                    $.say($.username.resolve(sender) + ", " + winning + " doesn't match any of the options.");
                    return;
                }

                var pot = 0;
                var totalwin = 0;
                for(var user in $var.bet_table) {
                    var bet = $var.bet_table[user];
                    if(bet.option.equalsIgnoreCase(winning)) {
                        totalwin += parseInt(bet.amount);
                    } else {
                        pot += parseInt(bet.amount);
                    }
                }
				
                $.say("Winnings >> " + totalwin + " " + $.pointname);
				
                var a = false;

                for(var user in $var.bet_table) {
                    var bet = $var.bet_table[user];
                    if(bet.option.equalsIgnoreCase(winning)) {
                        var moneyWon = int((bet.amount / totalwin) * pot);
                        $.db.incr('points', user, moneyWon);
                        if (moneyWon == 0) {
                            $.say("Sorry " + $.username.resolve(user) + "! You didn't win any points because everyone placed thier bets on the same option.");
                            a = true;
                        } else {
                            $.say("Congratulations to >> "+ $.username.resolve(user) + " for winning " + moneyWon + " " + $.pointname + "!");
                            a = true;
                        } 
                        if(moneyWon < 0) {
                            $.say($.username.resolve(user) + " lost " + bet.amount + " " + $.pointname + "! Maybe next time.");
                            a = true;
                        }
                    }
                }
                if (!a) {
                    $.say("[BET CLOSED] >> Not enough bets were placed.");

                }
                $var.bet_running = false;
            } else {
                if(!$var.bet_running) return;
                var option = args[0].toLowerCase();
                var amount = int(args[1]);
				
                if(!$.array.contains($var.bet_options, option)) {
                    $.say(option + " is not a valid option, " + $.username.resolve(sender) + "!");
                    return;
                }

                if (amount <= 0) {
                    $.say("Nice try, but I can't let you do that " + $.username.resolve(sender) + ".");
                    return;
                }
				
                var points = $.db.get('points', sender);
                if(points == null) points = 0;
                else points = int(points);
				
                if(amount > points) {
                    $.say($.username.resolve(sender) + ", " + " you don't have that amount of points to wager!");
                    return;
                }
				
                $.db.decr('points', sender, amount);
				
                if(sender in $var.bet_table) {
                    amount += $var.bet_table[sender].amount;
                }
				 
                $.say($.username.resolve(sender) + " wagers " + args[1] + " " + $.pointname + " as on " + option);
                $var.bet_table[sender] = {
                    amount: amount, 
                    option: option
                };
            }
        } else {
            if ($var.bet_running) {
                $.say("[BET IN PROGRESS] >> Type '!bet <option> <#>' to participate, Options are: " + $var.bet_optionsString);
            } else {
                $.say("Bet Commands >> '!bet open <option1> & <option2>'' -- '!bet close <option>'' -- '!bet <option> <#>'");
            }
        }
    }
});