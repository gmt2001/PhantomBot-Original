$.on('command', function(event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var num_quotes = parseInt($.inidb.get("quotes", "num_quotes"));
    var num;
    
    if(command.equalsIgnoreCase("quote")) {
         if ($.strlen(argsString) > 0) {
                num = parseInt(argsString);
        } else {
                num = $.rand(num_quotes);
        }

        if (isNaN(num_quotes) || num_quotes == 0) {
            $.say("There are no quotes at this time");
            return;
        }

        if ($.inidb.get("quotes", "quote_" + num) == null) {
            $.say("There are only " + num_quotes + " quotes right now! Remember that quotes are numbered from 0 to " + (num_quotes - 1) + "!");

        } else {
            $.say("#" + num + ": " + $.inidb.get("quotes", "quote_" + num));
        }
    }
    
    if (command.equalsIgnoreCase("addquote")) {
        if (!$.isMod(sender)) {
            $.say("You must be a Moderator to use this command!");
            return;
        }
        
        if (num_quotes == null || isNaN(num_quotes)) {
            num_quotes = 0;
        }
        
        $.logEvent("quoteCommand.js", 39, username + " added a quote (#" + num_quotes + "): " + argsString);
        
        $.inidb.incr("quotes", "num_quotes", 1);
        $.inidb.set("quotes", "quote_" + num_quotes, argsString);
        
        $.say("Quote added! There are now " + (num_quotes + 1) + " quotes!");
    }
    
    if (command.equalsIgnoreCase("delquote")) {
        if (!$.isMod(sender)) {
            $.say("You must be a Moderator to use this command!");
            return;
        }
        
        if (num_quotes == null || isNaN(num_quotes) || num_quotes == 0) {
            $.say("There are no quotes at this time");
            return;
        }
        
        if (isNaN(argsString)) {
            $.say("There are currently " + num_quotes + " quotes. Usage: !delquote <id>");
            return;
        }
        
        $.logEvent("quoteCommand.js", 63, username + " deleted quote (#" + argsString + "): " + $.inidb.get('quotes', 'quote_' + argsString));
        
        if (num_quotes > 1) {
            for (i = 0; i < num_quotes; i++) {
                if (i > parseInt(argsString)) {
                    $.inidb.set('quotes', 'quote_' + (i - 1), $.inidb.get('quotes', 'quote_' + i))
                }
            }
        }

        $.inidb.del('quotes', 'quote_' + (num_quotes - 1));
        
        $.inidb.decr("quotes", "num_quotes", 1);
        
        $.say("Quote removed! There are now " + (num_quotes - 1) + " quotes!");
    }
});

$.registerChatCommand("./commands/quoteCommand.js", "quote");
$.registerChatCommand("./commands/quoteCommand.js", "addquote", "mod");
$.registerChatCommand("./commands/quoteCommand.js", "delquote", "mod");