$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender).toLowerCase();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;


    if(argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if(command.equalsIgnoreCase("kill")) {
        if(args.length == 1) {
            username = args[0].toLowerCase();

            var killuser = new Array(0)

            killuser[0] = $.username.resolve(sender) + " murdered " + $.username.resolve(username) + " with a unicorn's horn!"
            killuser[1] = $.username.resolve(sender) + " covered " + $.username.resolve(username) + " in meat sauce and threw them in a cage with a starved tiger."
            killuser[2] = $.username.resolve(sender) + " genetically modified a Venus fly trap so it grows really big and trapped " + $.username.resolve(username) + " in a room with it." 
            killuser[3] = $.username.resolve(sender) + " shanked " + $.username.resolve(username) + "'s butt, over and over again."
            killuser[4] = $.username.resolve(sender) + " just wrote " + $.username.resolve(username) + "'s name in his DeathNote."
            killuser[5] = $.username.resolve(sender) + " attacked " + $.username.resolve(username) + " with a rusty spoon as the weapon...and managed to kill him."
         
            $.say($.randElement(killuser));
        } else {
            var killself = new Array(0)

            killself[0] = $.username.resolve(sender) + " has somehow managed to kill himself."  
            killself[1] = $.username.resolve(sender) + " exploded."
            killself[2] = $.username.resolve(sender) + " imploded."

            $.say($.randElement(killself));
        }
    }
});

$.registerChatCommand("kill");