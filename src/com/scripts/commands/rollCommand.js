$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var d1 = Math.floor(Math.random() * 6) + 1;
    var d2 = Math.floor(Math.random() * 6) + 1;
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

    if(command.equalsIgnoreCase("roll")) {
        if(d1 == d2) {
            $.say(username + " rolled Doubles >> " + die1 + " & " + die2 + "! " + "You won " + (die1+die2 * 2) + " " + $.pointname + "!" + " " +$.randElement(win));
            $.db.incr('points', sender, die1+die2 * 2); 
        } else {
            $.say(username + " rolled a " + die1 + " & " + die2 + ". " + $.randElement(lost));
        }
    }
}
)
