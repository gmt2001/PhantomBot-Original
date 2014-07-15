$var.pollID = 0;

function makeVote (option) {
    var current = $.pollResults.get (option);
    if (current != null) {
        var n = current.intValue() + 1;
        $.pollResults.put (option, n);
        $var.pollTotalVotes++;
        return true;
    }
    return false;
}

$.endPoll = function () {
    if (pollCallback != null) {
        $var.pollID += 1;
        var results = [];
        var high = 0;
        var options = $var.pollOptions;
        for (var i=0; i<options.length; ++i) {
            var count = $.pollResults.get (options[i].toLowerCase()).intValue();
            if (high < count) {
                high = count;
                results = [options[i]];
            } else if (high == count) {
                results [results.length] = options[i];
            }
        }
        $var.vote_running = false;
        pollCallback (results);
        $.pollResults.clear ();
        $.pollVoters.clear ();
        $var.pollMaster = null;
        pollCallback = null;
        return true;
    }
    return false;
};

$.runPoll = function (callback, options, time, pollMaster) {
    if ($var.vote_running) {
        return false;
    } else {
        $var.vote_running = true;
    }
        
    for (var i=0; i<options.length; ++i) {
        var option = options [i];
        $.pollResults.put (option.toLowerCase(), 0);
    }
    $var.pollOptions = options;
    $var.pollMaster = pollMaster;
    $var.pollTotalVotes = 0;
        
    if (time > 0) {
        pollCallback = callback;
        var oldID = $var.pollID;
        setTimeout (function () {
            if (oldID == $var.pollID) {
                $.endPoll ();
            } else {
                println ("Poll ended manually");
            }
        }, time);
        setTimeout (function () {
            if (oldID == $var.pollID) {
                $.say ("The poll will end in " + (time * 0.3)/1000 + " seconds, cast your vote soon.");
            } else {
                println ("Poll ended manually");
            }
        }, time*0.7);
    } else {
        pollCallback = callback;
    }
    return true;
};

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs ();
    var subCmd = "";
        
    if (command.equalsIgnoreCase ("vote")) {
        if (!$var.vote_running) {
            $.say ("No vote is running");
            return;
        }
        if ($.pollVoters.contains (sender)) {
            $.say (username + ", you have already voted");
        }
        if (!makeVote (args [0].toLowerCase())) {
            $.say ("'" + args [0] + "' is not a valid option");
        } else {
            $.pollVoters.add (sender);
            $.say (username + ", your vote has been recorded");
        }
                
    } else if (command.equalsIgnoreCase ("poll")) {
        if (!argsString.isEmpty()) {
            subCmd = args [0];
        }
        if (!$.isMod(sender)) {
            $.say ("You must be a Moderator to use that command");
            return;
        }
        
        if (subCmd.equalsIgnoreCase ("start")) {      
            var length = 0;
            var options = []
                        
            if (args.length < 2) {
                $.say ("Usage 'poll start [-t time] options...'\nexamples:\n - 'poll start yes no'\n - 'poll start -t 60 yes no maybe'");
                return;
            }
                        
            argStart = 1
            if (args [argStart] == '-t') {
                length = parseInt (args [argStart+1]);
                argStart += 2
            }
                        
            options = args.slice (argStart);
                        
            if (options.length < 2) {
                $.say ("Not enough options, polls must have at least two options");
                return;
            }
                        
            if ($var.vote_running) {
                $.say ("A vote is already running");
                return;
            }
                        
            if ($.runPoll (function (result) {
                if (result.length == 1) {
                    $.say ("Polls are closed! The winner is '" + result + "' with " + $.pollResults.get (result [0]).intValue() + " out of " + parseInt($var.pollTotalVotes) + " votes.")
                } else {
                    var optionsStr = "";
                var l = result.length-2;
                for (var i=0; i < l; ++i) {
                    optionsStr += result [i] + ", ";
                }
                
                    $.say ("The poll resulted in a " + result.length + " way tie '" + optionsStr + result [l] + " and " + result [l+1] + "', each received " + $.pollResults.get (result [0]).intValue() + " out of " + parseInt($var.pollTotalVotes) + " votes.")
                }
                                
            }, options, length * 1000, sender)) {
                var optionsStr = "";
                var l = options.length-2;
                for (var i=0; i < l; ++i) {
                    optionsStr += options [i] + ", ";
                }
                
                $.say ("Polls are open! Vote with '!vote <option>'. The options are: " + optionsStr + options [l] + " and " + options [l+1]);
            }
                        
                        
        } else if (subCmd.equalsIgnoreCase ("end")) {
            if ($var.pollMaster == null) {
                $.say ("There is no poll running");
            }
                        
            if (!$.isMod(sender)) {
                if ($var.pollMaster != sender) {
                    $.say ("Only a Moderator can end somebody else's poll");
                }
            }
                        
            if (!$.endPoll ()) {
                $.say ("There is no poll running");
            }
        } else {
            $.say("Usage: !poll start [-t time] <option 1>...<option n>, !poll end");
        }
    }
});

$.registerChatCommand("vote");
$.registerChatCommand("poll");