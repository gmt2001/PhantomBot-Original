/* 
!bet >> Current Bet Session || Type '!bet option1 vs option2' to start
!bet option1 vs option2 >> starts a new bet
!bet 1 <amount> || !bet 2 <amount>
Timer 30 seconds
Bets are locked!
!bet end option
The winning bet is "option" reward points have been distributed!
*/


var betstart = 0;
var betlength = 1 * 60 * 1000;
var minbets = 2;

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
			
            if(action.equalsIgnoreCase("open") && !$var.bet_running) {
                if (!$.hasGroupByName(sender, "Viewer")) {
                    $.say("You must be a Viewer to use this command " + username + ".");
                    return;
                }
               
                $var.bet_options = [];
                var optionString = '';
                for (var i = 1; i < args.length; i++) {
                    optionString += args[i] + ' ';
                }
                optionString.trim();
                var boptions = optionString.split(' & ');
                for (i = 0; i < boptions.length; i++) {
                    $var.bet_options.push(boptions[i].trim().toLowerCase());
                }
                while (optionString.indexOf('&') != -1) {
                    optionString = optionString.replace(" & ", "' vs '")
                }

                $var.bet_table = { };
                $var.bet_running = true;
                $.say(" Bets are open for '" + optionString + "' >> Awaiting players to wager their points with :'!bet <option> <#>'");
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
                if (!$.hasGroupByName(sender, "Viewer")) {
                    $.say("You must be a Regular to use this command " + username + ".");
                    return;
                }
                
                if (parseInt(args[1]) >= 60) {
                    betlength = parseInt(args[1]) * 1000;
                    
                    $.say("The betting time is now set to " + args[1] + " seconds!")
                } else if (args[1] == "0") {
                    $.say("The betting time is set to " + betlength + " seconds!")
                } else {
                    $.say("The minimum time is 60 seconds!")
                }
            } else if(action.equalsIgnoreCase("close")) {
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
				
                var a = 0;
                var winners = ""
                var moneyWon = 0

                for(user in $var.bet_table) {
                    a++;
                    bet = $var.bet_table[user];
                    if(bet.option.equalsIgnoreCase(winning)) {
                        moneyWon = int((bet.amount / totalwin) * pot);
                        
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
                    for(user in $var.bet_table) {
                        bet = $var.bet_table[user];
                        if(bet.option.equalsIgnoreCase(winning)) {
                            moneyWon = int((bet.amount / totalwin) * pot);
                            $.inidb.incr('points', user, moneyWon);
                            $.inidb.incr('points', user, bet.amount);
                        }
                    }
                    
                    $.say("Congratulations to the following viewers for each winning their fair share of the winnings! " + winners)
                }
                $var.bet_running = false;
            } else {
                if(!$var.bet_running) return;
                var option = args[0].toLowerCase();
                var amount = int(args[1]);
                
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
                else points = int(points);
				
                if(amount > points) {
                    $.say($.username.resolve(sender) + ", " + " you don't have that amount of points to wager!");
                    return;
                }
				
                $.inidb.decr('points', sender, amount);
				
                if(sender in $var.bet_table) {
                    amount += $var.bet_table[sender].amount;
                }
				 
                $.say($.username.resolve(sender) + " wagers " + args[1] + " " + $.pointname + " on " + option);
                $var.bet_table[sender] = {
                    amount: amount, 
                    option: option
                };
            }
        } else {
            if ($var.bet_running) {
                $.say("[BET IN PROGRESS] >> Type '!bet <option> <#>' to participate, Options are: '" + $var.bet_optionsString + "'");
            } else {
                $.say("Bet Commands >> '!bet open <option1> & <option2>' -- '!bet time <time in seconds>' -- '!bet close <option>' -- '!bet <option> <#>'");
            }
        }
    }
});