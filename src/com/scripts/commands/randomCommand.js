$.on('command', function(event) {
	var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var ar = new Array(0);
        ar[0] =  $.username.resolve(sender) + " was welcomed to the JAM so now it's time for " + $.username.resolve(sender) + " to get SLAMMED!"
        ar[1] = $.username.resolve(sender) + " was thrown into a large pit of PJSalt."
        ar[2] = "oh my " + $.username.resolve(sender) + " you make me just want to *SLURP SLURP SLURP*"
        ar[3] = $.username.resolve(sender) + " was thrown into a pit of tentacle pleasure."
        ar[4] = "I want you " + $.username.resolve(sender) + "."
        ar[5] = "/me threw " + $.username.resolve(sender) + " into a pit of PJSalt!" 
        ar[6] = $.username.resolve(sender) + " threw up in chat. GROSS!"
        ar[7] = "Dango, dango, dango, dango, big " + $.username.resolve(sender) + " family~♫"
        ar[8] = "What are we gonna do on the bed " + $.username.resolve(sender) + "?"
        ar[9] = "Your mother was a hamster and your father smelt of elderberries!"
        ar[10] = "I would rather not acknowledge that " + $.username.resolve(sender) + " typed '!random'"
        ar[11] = $.username.resolve(sender) + " was standing in the park wondering why frisbees got bigger as they get closer. Then it hit 'em."
        ar[12] = "There is no such thing as a stupid question, just stupid people who type '!random'. *Cough* " + $.username.resolve(sender) + "."
        ar[13] = "When life gives you lemons " + $.username.resolve(sender) + ", make orange juice and leave the world wondering how the hell you did it."
        ar[14] = $.username.resolve(sender) + " was violated by a tentacle monster on stream."
        ar[15] = $.username.resolve(sender) + " used Hadouken?"
        ar[16] = $.username.resolve(sender) + " was murdered by ninja birds in a cave."
        ar[17] = "/me licked " + $.username.resolve(sender) + ". . ."
        ar[18] = "Hat mode activated. . ."
        ar[19] = "THIS JUST IN! " + $.username.resolve(sender) + "'s waifu is actually in a ahegao doujin!"
        ar[20] = "For " + $.username.resolve(sender) + ", this is the first time he's noticed the scent of a woman."
        ar[21] = "DON'T LOSE YOUR WAAAAAY!!!!! in your mind! We have to be as one, Don’t be afraid my sweetheart, This is the way to be more strong, Harbour my deep secret, It makes me so blue, Run through this game before my body is dry"
        ar[22] = $.username.resolve(sender) +  " you're a beautiful strong black woman."
        ar[23] = "The East Burns Red."
        ar[24] = "/me licking intensifies!"
        ar[25] = "X GON GIVE IT TO YA!"
        ar[26] = "༼ つ ◕_◕ ༽=ε̵͇̿̿'̿'̿ ̿ ̿̿  " + " I has a gun, Gimme yo money " + $.username.resolve(sender) + "!"
        ar[27] = "I hope " + $.username.resolve(sender) + "-senpai notices me.."
       
    if(command.equalsIgnoreCase("random")) {
         $.say($.randElement(ar));
    }

        
});






