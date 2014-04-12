
// NOTE: time is in seconds
function banUser (user, time) {
	$.bancache.addUser (user, time);
	$.bancache.syncToFile ("bannedUsers.bin");
	$.say ("/ban " + user);
}

function banUser (user) {
	$.say ("/ban " + user);
}

function unbanUser (user) {
	$.say ("/unban " + user);
	$.bancache.removeUser (user);
}
 
function kickUser (user) {
	$.say ("/kick " + user);
}

function autoPurgeUser (user) {
	var ban = false;
	var count = $.sinbin.get (user);
	if (count != null) {
		count = count.intValue ();
		ban = count >= 2;
		$.sinbin.put (user, count + 1);
	} else {
		$.sinbin.put (user, 1);
	}
	if (ban) {
		$.sinbin.put (user, 0);
		banUser (user, 1);
	} else {
		timeoutUser (user);
	}
}
 
function timeoutUser (user) {
	$.say ("/timeout " + user + " 2");
}

//var linkson = $.db.exists("bool", "linkson");
$.bancache.loadFromFile ("bannedUsers.bin");

$.on('command', function(event) {
	
	var sender = event.getSender();
	var username = $.username.resolve(sender);
	var command = event.getCommand();
	var args = event.getArgs ();
	
	if (command.equalsIgnoreCase("chat") && username.equalsIgnoreCase("phantombot")) {
		$.say (args [0]);
	} else if (command.equalsIgnoreCase("purge")) {
		
		if ($.getUserGroupId (sender) >= $.getGroupIdByName ("Moderator") || username.equalsIgnoreCase("phantombot")) {
			if (args.length == 1) {
				timeoutUser (args [0]);
			} else {
				$.say ("You must specify a user to purge")
			}
		} else {
			$.say ("Only a Moderator can use this command! " + $.username.resolve(sender));
		}
		
	} else if (command.equalsIgnoreCase("links")) {
		
		/*if ($.getUserGroupId (sender) >= $.getGroupIdByName ("mod") || username.equalsIgnoreCase("phantombot")) {
			
			if (args [0].equalsIgnoreCase("on")) {
				if (!linkson) {
					$.db.set("bool", "linkson", "true");
					linkson = true;
					$.say("Links enabled");
				} else {
					$.say("Links already enabled");
				}
			} else {
				if (linkson) {
					$.db.del("bool", "linkson");
					linkson = false;
					$.say("Links disabled");
				} else {
					$.say("Links already disabled");
				}
			}
			
		} else {
			$.say ("That is a mod only command")
		}*/
		$.say ("That command is currently disabled")
		
	} else if (command.equalsIgnoreCase("ban")) {
		
		if ($.getUserGroupId (sender) >= $.getGroupIdByName ("Moderator") || username.equalsIgnoreCase("phantombot")) {
			
			if (args.length == 2) {
				var time = parseInt (args [1]);
				if (time <= 0) {
					$.say (time + " is not a valid amount of time");
				}
				banUser (args [0], time * 60 * 60);
				if (time != 1) {
					$.say (args [0] + " banned for " + time + " hours");
				} else {
					$.say (args [0] + " banned for 1 hour");
				}
			} else {
				banUser (args [0]);
				$.say (args [0] + " banned indefinitely");
			}
			
		} else {
			$.say ("Only a Moderator can use this command! " + $.username.resolve(sender));
		}
		
	} else if (command.equalsIgnoreCase("unban")) {
		
		if ($.getUserGroupId (sender) >= $.getGroupIdByName ("Moderator") || username.equalsIgnoreCase("phantombot")) {
			
			unbanUser (args [0]);
			$.say (args [0] + " is no longer banned");
			
		} else {
			$.say ("Only a Moderator can use this command! " + $.username.resolve(sender));
		}
		
	}
	
});

$.on('ircChannelMessage', function(event) {
	
	var sender = event.getSender().toLowerCase();
	var chatName = $.username.resolve(sender);
	var username = chatName.toLowerCase();
	var message = event.getMessage().toLowerCase();
	
	var caps = event.getCapsCount ();
	var capsRatio = (caps*1.0)/message.length ();
	
	if (capsRatio > 0.30 && message.length () > 70) {
		autoPurgeUser (username);
		$.say(chatName + " -> that was way too many caps! [Warning]");
	} /*else if (linkson == false) {
		if (event.isLink () && $.getUserGroupId (sender) < $.getGroupIdByName ("mod")) {
			timeoutUser (username);
			$.say("Woah there " + chatName + ", posting links is currently disabled");
		}
	}*/

});

$.setInterval(function() {
	
	var reformed = $.bancache.getReformedUsers ();
	var l = reformed.length;
	for (var i=0; i<l; ++i) {
		unbanUser (reformed[i]);
	}
	$.bancache.syncToFile ("bannedUsers.bin");
	
}, 60);