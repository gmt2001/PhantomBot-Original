var arrRollLimiter = new Array();

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

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
            lost[0] = "Better luck next time!"
            lost[1] = "Man you suck at this!"
            lost[2] = "You had one job!"
            lost[3] = "Congra- oh wait.. that's a loss, pfft."
            lost[4] = "This is sad."
            lost[5] = "Can you like.. win? please?"
            lost[6] = "You're making me sad."
            lost[7] = "Don't lose your way!"
            lost[8] = "You just weren't good enough."
            lost[9] = "Will " + username + " finally win? Find out on the next episode of DragonBall Z!"
            lost[10] = "Still losing!"
            lost[11] = "You're great at losing."
    
            if (username.equalsIgnoreCase("gmt2001")) {
                lost[12] = "You re-programmed me and you still failed!"
                lost[13] = "You re-programmed me and you still failed!"
                lost[14] = "You re-programmed me and you still failed!"
            }
    
            if (username.equalsIgnoreCase("brutalmind1984")) {
                lost[12] = "That was a brutal beating you took!"
                lost[13] = "That was a brutal beating you took!"
                lost[14] = "That was a brutal beating you took!"
            }
    
            var win = new Array (0)
            win[0] = "Congratulations!"
            win[1] = "Damn you won.."
            win[2] = "Was hoping you'd lose there."
            win[3] = "You got lucky."
            win[4] = "This shit is rigged!"
            win[5] = "GOOOOOOOOOOOOAAAAAAAAAAAAAAL!"
            win[6] = "Oh my you did it! HNNG!"
            win[7] = "Your balls finally dropped!"
            win[8] = "X GON GIVE IT TO YA!"
    
            if (username.equalsIgnoreCase("gmt2001")) {
                win[9] = "HAX!"
                win[10] = "HAX!"
                win[11] = "HAX!"
                win[12] = "HAX!"
            }
    
            if (username.equalsIgnoreCase("theradicalninja")) {
                win[9] = "The ninja strikes!"
                win[10] = "The ninja strikes!"
                win[11] = "The ninja strikes!"
                win[12] = "The ninja strikes!"
            }
            
            if (username.equalsIgnoreCase("acavedo")) {
                username = "Avocado"
            }
            
            if(d1 == d2) {
                $.say(username + " rolled Doubles >> " + die1 + " & " + die2 + "! " + "You won " + (die1+die2 * 2) + " " + $.pointname + "!" + " " +$.randElement(win));
                $.inidb.incr('points', sender, die1+die2 * 2); 
            } else {
                $.say(username + " rolled a " + die1 + " & " + die2 + ". " + $.randElement(lost));
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
            var Matcher = java.util.regex.Matcher;
            var p = Pattern.compile("[0-9]*d{1}(4|6|8|10|12|20|100){1}");
            var m;
            var s;
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
});
