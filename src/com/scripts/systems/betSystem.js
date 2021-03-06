var betstart = 0;
var betlength = 1 * 60 * 1000;
var minbets = 2;

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

    if(command.equalsIgnoreCase("bet")) {
        if (!$.moduleEnabled("./systems/pointSystem.js")) {
            $.say("You can not use !bet because points are disabled!");
            return;
        }
        
        if(args.length >= 2) {
            var action = args[0];	
			
            if(action.equalsIgnoreCase("open") && !$var.bet_running) {
                if (!$.isMod(sender)) {
                    $.say("You must be a Moderator to use this command " + username + ".");
                    return;
                }
               
                $var.bet_options = [];
                
                var boptions = args.slice(1);
                var optionString = "";
                
                for (i = 0; i < boptions.length; i++) {
                    $var.bet_options.push(boptions[i].trim().toLowerCase());
                    
                    if (!optionString.equals("")) {
                        optionString = optionString + " vs ";
                    }
                    
                    optionString = optionString + "'" + boptions[i].trim().toLowerCase() + "'";
                }
                
                $.logEvent("betSystem.js", 42, username + " opened a betting session with options " + optionString);

                $var.bet_table = { };
                $var.bet_running = true;
                $.say(" Bets are open for " + optionString + " >> Awaiting players to wager their points with '!bet <wager> <option>'");
                $var.bet_optionsString = optionString;

                $var.bet_id = System.currentTimeMillis();

                betstart = System.currentTimeMillis();
                
                var betid = $var.bet_id
                
                setTimeout(function() {
                    if(!$var.bet_running) return;
                    if($var.bet_id != betid) return;
                    
                    $.say("[BET CLOSED] >> Time is up!")
                }, betlength)
            } else if(action.equalsIgnoreCase("time") && !$var.bet_running) {
                if (!$.isMod(sender)) {
                    $.say("You must be a Moderator to use this command " + username + ".");
                    return;
                }
                
                if (parseInt(args[1]) >= 60) {
                    $.logEvent("betSystem.js", 68, username + " set the betting session timer to " + args[1] + " seconds");
                    
                    betlength = parseInt(args[1]) * 1000;
                    
                    $.say("The betting time is now set to " + args[1] + " seconds!")
                } else if (args[1] == "0") {
                    $.say("The betting time is set to " + betlength + " seconds!")
                } else {
                    $.say("The minimum time is 60 seconds!")
                }
            } else if(action.equalsIgnoreCase("close")) {
                if (!$.isMod(sender)) {
                    $.say("You must be a Moderator to use this command " + username + ".");
                    return;
                }
				
                if(!$var.bet_running) return;
                var winning = args.slice(1).join(" ").trim().toLowerCase();
				
                if(!$.array.contains($var.bet_options, winning)) {
                    $.say($.username.resolve(sender) + ", " + winning + " doesn't match any of the options.");
                    return;
                }
                
                $.logEvent("betSystem.js", 92, username + " closed the betting session and declared the winning option to be " + winning);

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
				
                var a = 0;
                var winners = ""
                var moneyWon = 0

                for(user in $var.bet_table) {
                    a++;
                    bet = $var.bet_table[user];
                    if(bet.option.equalsIgnoreCase(winning)) {
                        moneyWon = parseInt((bet.amount / totalwin) * pot);
                        
                        if (moneyWon > 0) {
                            if (winners.length > 0) {
                                winners = winners + ", "
                            }
                            
                            winners = winners + $.username.resolve(user)
                        }
                    }
                }
                
                if (a < minbets) {
                    $.say("[BET CLOSED] >> Not enough bets were placed.");
                    
                    for(user in $var.bet_table) {
                        bet = $var.bet_table[user];
                        $.inidb.incr('points', user, bet.amount);
                    }
                } else {
                    if (pot == 0) {
                        $.say("Everyone chose the winning option and got their " + $.pointname + " back!");
                        
                        for(user in $var.bet_table) {
                            bet = $var.bet_table[user];
                            $.inidb.incr('points', user, bet.amount);
                        }
                    } else if(totalwin == 0) {
                        $.say("Everyone lost!");
                    } else {
                        for(user in $var.bet_table) {
                            bet = $var.bet_table[user];
                            if(bet.option.equalsIgnoreCase(winning)) {
                                moneyWon = parseInt((bet.amount / totalwin) * pot);
                                $.inidb.incr('points', user, moneyWon);
                                $.inidb.incr('points', user, bet.amount);
                            }
                        }
                    
                        $.say("Congratulations to the following viewers for each winning their fair share of the " + pot + " " + $.pointname + " pot! " + winners)
                    }
                }
                $var.bet_running = false;
            } else {
                if(!$var.bet_running) return;
                var amount = parseInt(args[0]);
                var option = args.slice(1).join(" ").trim().toLowerCase();
                
                if (betstart + betlength < System.currentTimeMillis()) {
                    $.say("Sorry, betting is closed, " + $.username.resolve(sender) + "!")
                    return;
                }
				
                if(!$.array.contains($var.bet_options, option)) {
                    $.say(option + " is not a valid option, " + $.username.resolve(sender) + "!");
                    return;
                }

                if (amount <= 0) {
                    $.say("Nice try, but I can't let you do that " + $.username.resolve(sender) + ".");
                    return;
                }
				
                var points = $.inidb.get('points', sender);
                if(points == null) points = 0;
                else points = parseInt(points);
				
                if(amount > points) {
                    $.say($.username.resolve(sender) + ", " + " you don't have that amount of points to wager!");
                    return;
                }
				
                $.inidb.decr('points', sender, amount);
				
                if(sender in $var.bet_table) {
                    amount += parseInt($var.bet_table[sender].amount);
                }
				 
                $.say($.username.resolve(sender) + " wagers " + args[0] + " " + $.pointname + " on " + option);
                $var.bet_table[sender] = {
                    amount: parseInt(amount),
                    option: option
                };
            }
        } else {
            if ($var.bet_running) {
                if (betstart + betlength < System.currentTimeMillis()) {
                    $.say("[BET CLOSED] >> Type '!bet close <option>' to declare a winner! Options are: " + $var.bet_optionsString + "");
                } else {
                    $.say("[BET IN PROGRESS] >> Type '!bet <wager> <option>' to participate, Options are: " + $var.bet_optionsString + "");
                }
            } else {
                $.say("Bet Commands >> '!bet open <option1...> <...optionN>' -- '!bet time <time in seconds>' -- '!bet close <option>' -- '!bet <wager> <option>'");
            }
        }
    }
});

$.registerChatCommand("./systems/betSystem.js", "bet");