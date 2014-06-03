var arrRollLimiter = new Array();
$var.lastRandomWin = "";
$var.lastRandomLost = "";

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var s;

    if(command.equalsIgnoreCase("roll")) {
        var found = false;
        var i;
        
        for (i = 0; i < arrRollLimiter.length; i++) {
            if (arrRollLimiter[i][0].equalsIgnoreCase(username)) {
                if (arrRollLimiter[i][1] < System.currentTimeMillis()) {
                    arrRollLimiter[i][1] = System.currentTimeMillis() + (30 * 1000);
                    break;
                } else {
                    $.say(username + ", you can only use !roll once every 30 seconds!");
                    return;
                }
                
                found = true;
            }
        }
        
        if (found == false) {
            arrRollLimiter.push(new Array(username, System.currentTimeMillis() + (30 * 1000)));
        }
        
        if (args.length == 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            var d1 = $.randRange(1, 6);
            var d2 = $.randRange(1, 6);
            var die1 = d1;
            var die2 = d2;

            var lost = new Array (0)
            lost.push("Better luck next time!");
            lost.push("Man you suck at this!");
            lost.push("You had one job!");
            lost.push("Congra- oh wait.. that's a loss, pfft.");
            lost.push("This is sad.");
            lost.push("Can you like.. win? please?");
            lost.push("You're making me sad.");
            lost.push("Don't lose your way!");
            lost.push("You just weren't good enough.");
            lost.push("Will <sender> finally win? Find out on the next episode of DragonBall Z!");
            lost.push("Still losing!");
            lost.push("You're great at losing.");
    
            if (username.equalsIgnoreCase("gmt2001")) {
                lost.push("You re-programmed me and you still failed!");
                lost.push("You re-programmed me and you still failed!");
                lost.push("You re-programmed me and you still failed!");
            }
    
            if (username.equalsIgnoreCase("brutalmind1984")) {
                lost.push("That was a brutal beating you took!");
                lost.push("That was a brutal beating you took!");
                lost.push("That was a brutal beating you took!");
            }
    
            var win = new Array (0)
            win.push("Congratulations!");
            win.push("Damn you won..");
            win.push("Was hoping you'd lose there.");
            win.push("You got lucky.");
            win.push("This shit is rigged!");
            win.push("GOOOOOOOOOOOOAAAAAAAAAAAAAAL!");
            win.push("Oh my you did it! HNNG!");
            win.push("Your balls finally dropped!");
            win.push("X GON GIVE IT TO YA!");
    
            if (username.equalsIgnoreCase("gmt2001")) {
                win.push("HAX!");
                win.push("HAX!");
                win.push("HAX!");
                win.push("HAX!");
            }
    
            if (username.equalsIgnoreCase("theradicalninja")) {
                win.push("The ninja strikes!");
                win.push("The ninja strikes!");
                win.push("The ninja strikes!");
                win.push("The ninja strikes!");
            }
            
            if (username.equalsIgnoreCase("acavedo")) {
                username = "Avocado"
            }
            
            if(d1 == d2) {
                do {
                    s = $.randElement(win);
                } while (s.equalsIgnoreCase($var.lastRandomWin) && win.length > 1);
                
                $.say(username + " rolled Doubles >> " + die1 + " & " + die2 + "! " + "You won " + (die1 + (die2 * $.rollbonus)) + " " + $.pointname + "!" + " " + s.replace("<sender>", username));
                $.inidb.incr('points', sender, die1 + (die2 * $.rollbonus)); 
            } else {
                do {
                    s = $.randElement(lost);
                } while (s.equalsIgnoreCase($var.lastRandomLost) && lost.length > 1);
                
                $.say(username + " rolled a " + die1 + " & " + die2 + ". " + s.replace("<sender>", username));
            }
        } else if ((args.length  == 1 && args[0].equalsIgnoreCase("help")) || !$.moduleEnabled("./systems/pointSystem.js")) {
            $.say("To do a DnD roll, say '!roll <dice definition>[ + <dice definition or number>]. For example: '!roll 2d6 + d20 + 2'. Limit 7 dice definitions or numbers per !roll command. A dice definition is [# to roll]d<number of sides>. Valid number of sides: 4, 6, 8, 10, 12, 20, 100");
        } else if (args.length < 14) {
            var result = "";
            var die = 0;
            var dtotal = 0;
            var numd = 0;
            var dsides = 0;
            var dstr = new Array();
            var lookd = true;
            var Pattern = java.util.regex.Pattern;
            var p = Pattern.compile("[0-9]*d{1}(4|6|8|10|12|20|100){1}");
            var m;
            var pos;
            var valid = true;
            
            args = argsString.split("\\+");
            
            dstr[4] = "<n>";
            dstr[6] = "[n]";
            dstr[8] = "<<n>>";
            dstr[10] = "{n}";
            dstr[12] = "<{n}>";
            dstr[20] = "{(n)}";
            dstr[100] = "**n**";
            
            for (i = 0; i < args.length; i++) {
                args[i] = args[i].trim();
                lookd = true;
                
                m = p.matcher(args[i]);
                
                if (m.matches() == true && lookd) {
                    lookd = false;
                    
                    s = args[i].substring(m.start(), m.end());
                    
                    pos = s.indexOf("d");
                    
                    if (pos == 0) {
                        numd = 1;
                    } else {
                        numd = parseInt(s.substring(0, pos));
                    }
                    
                    dsides = parseInt(s.substring(pos + 1));
                    
                    for (var r = 0; r < numd; r++) {
                        die = $.randRange(1, dsides);
                        dtotal += die;
                        
                        if (!result.equals("")) {
                            result = result + " + ";
                        }
                        
                        result = result + dstr[dsides].replace("n", die);
                    }
                }
                
                if (!isNaN(parseInt(args[i])) && lookd) {
                    lookd = false;
                    
                    die = parseInt(args[i]);
                    dtotal += die;
                
                    if (!result.equals("")) {
                        result = result + " + ";
                    }
                        
                    result = result + die;
                }
                
                if (isNaN(parseInt(args[i])) && lookd) {
                    valid = false;
                }
            }
            
            if (valid) {
                $.say(username + " rolled " + result + " = " + dtotal);
            } else {
                $.say("Invalid roll definition, " + username + "! Say '!roll help' for help");
            }
        } else {
            $.say("Dont spam rolls, " + username + "!");
        }
    }
    
    if (command.equalsIgnoreCase("rollbonus")) {
        if (args.length > 0) {
            if (!$.isAdmin(sender)) {
                $.say("You must be an Administrator to use that command, " + username + "!");
                return;
            }
            
            if (!isNaN(args[0]) && parseInt(args[0]) >= 0) {
                $.inidb.set('settings', 'rollbonus', args[0]);
                $.rollbonus = parseInt(args[0]);
                
                $.say("The reward for rolling doubles has been set to <die value> + (<die value> * " + $.rollbonus + ")!");
            } else {
                $.say("Please select a valid amount, " + username + "!");
            }
        } else {
            $.say("The reward for rolling doubles is currently <die value> + (<die value> * " + $.rollbonus + "). You can change it with !rollbonus <newbonus>");
        }
    }
});

$.registerChatCommand("roll");
$.registerChatCommand("roll help");
$.registerChatCommand("rollbonus");