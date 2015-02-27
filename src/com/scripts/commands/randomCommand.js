$var.lastrandom = "";

$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var s;
    
    if(command.equalsIgnoreCase("random")) {
        var ar = new Array();
    
        ar.push("<sender> was welcomed to the JAM so now it's time for <sender> to get SLAMMED!");
        ar.push("<sender> was thrown into a large pit of PJSalt.");
        ar.push("oh my <sender> you make me just want to *SLURP SLURP SLURP*");
        ar.push("<sender> was thrown into a pit of tentacle pleasure.");
        ar.push("I want you <sender>.");
        ar.push("/me threw <sender> into a pit of PJSalt!" );
        ar.push("<sender> threw up in chat. GROSS!");
        ar.push("Dango, dango, dango, dango, big <sender> family~\u266B");
        ar.push("What are we gonna do on the bed <sender>?");
        ar.push("Your mother was a hamster and your father smelt of elderberries!");
        ar.push("I would rather not acknowledge that <sender> typed '!random'");
        ar.push("<sender> was standing in the park wondering why frisbees got bigger as they get closer. Then it hit 'em.");
        ar.push("There is no such thing as a stupid question, just stupid people who type '!random'. *Cough* <sender>.");
        ar.push("When life gives you lemons <sender>, make orange juice and leave the world wondering how the hell you did it.");
        ar.push("<sender> was violated by a tentacle monster on stream.");
        ar.push("/me licked <sender>. . .");
        ar.push("Hat mode activated. . .");
        ar.push("THIS JUST IN! <sender>'s waifu is actually in a ahegao doujin!");
        ar.push("For <sender>, this is the first time he's noticed the scent of a woman.");
        ar.push("DON'T LOSE YOUR WAAAAAY!!!!! in your mind! We have to be as one, Don’t be afraid my sweetheart, This is the way to be more strong, Harbour my deep secret, It makes me so blue, Run through this game before my body is dry");
        ar.push("<sender> you're a beautiful strong black woman.");
        ar.push("The East Burns Red.");
        ar.push("/me licking intensifies!");
        ar.push("X GON GIVE IT TO YA!");
        ar.push("༼ つ ◕_◕ ༽=ε̵͇̿̿'̿'̿ ̿ ̿̿  " + " I has a gun, Gimme yo money <sender>!");
        ar.push("I hope <sender>-senpai notices me..");
        ar.push("<sender> is so awesome because <sender> can trip over flat surfaces and fall up the stairs. Now that's a talented skill right there :D, <sender> can also fall up. Yep!");
        ar.push("<sender> looks good enough to dress like the grim reaper and go to a retirement home and tap on the windows!");
        ar.push("<sender>, the next time you're at the park, take a tennis ball, throw it at someone and shout \"I CHOOSE YOU! PIKACHU!\"..then you might have to run ;D");
        ar.push("<sender>, have you ever just wanted to grab a chicken leg from KFC and run around the streets yelling \"Do you want to pet my cock?\"");
        ar.push("ok everyone shhhhh. The rice crispies are telling me what to do next.");
        ar.push("<sender> made eye contact with <target> while eating a banana!");
        ar.push("It's weird, <sender> just doesn't have enough sax appeal.");
        ar.push("<target> mysteriously died.");

        do {
            s = $.randElement(ar);
        } while(s.equalsIgnoreCase($var.lastrandom) && ar.length > 1);
        
        while (s.indexOf("<sender>") != -1) {
        s = s.replace("<sender>", username);
        }
        
        var randomPerson = $.randElement($.users);
        
        while (s.indexOf("<target>") != -1) {
            s = s.replace("<target>", $.username.resolve(randomPerson[0]));
        }
        
        $.say(s);
    }
});

$.registerChatCommand("./commands/randomCommand.js", "random");