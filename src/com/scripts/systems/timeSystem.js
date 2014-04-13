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

	    if(command.equalsIgnoreCase("time")) {
		if(args.length == 3) {
			if (!$.hasGroupByName(sender, "Administrator")) {
				$.say("You must be a Administrator to use this command " + username + ".");
				return;
			}
			
			var action = args[0];
			var username = args[1].toLowerCase();
			var time = int(args[2]);

			if(action.equalsIgnoreCase("give") || action.equalsIgnoreCase("add") ) {
				$.inidb.incr('time', username, time);
				$.say(time + " seconds was added towards " + $.username.resolve(username) + ".");
			}
			if(action.equalsIgnoreCase("withdraw")) {
				$.inidb.decr('time', username, time);
				$.say($.username.resolve(username) + "'s time was deducted by " + time + " seconds.");
			}
			if(action.equalsIgnoreCase("set")) {
				$.inidb.set('time', username, time);
				$.say($.username.resolve(username) + "'s time was set to " + time + " seconds.");
			}
			
		} else {
			var points_user = sender;
			if(args.length == 1) {
				points_user = args[0].toLowerCase();
			}
			
			var points = $.inidb.get('points', points_user);
			var time = $.inidb.get('time', points_user);
			
			if(points == null) points = 0;
			if(time == null) time = 0;
			
			var time2 = new Date; 
			var seconds = time2.getTime () / 1000;
			var minutes = int((time / 60) % 60);
			var hours = int(time / 3600);
			var fixedseconds = (seconds % 60).toFixed (0);

			var timeString = "";
			if(hours != 0) timeString += " " + hours + " Hrs";
			else if(minutes != 0) timeString += " " + minutes + " Mins";
			else timeString += " " + minutes + " Mins";
			
			$.say($.username.resolve(points_user) + " has been in this channel for a total of " + hours + " hours & " + minutes + " minutes.");
		}
    }

});


