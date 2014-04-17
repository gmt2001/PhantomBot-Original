$.on('command', function(event) {
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var num_quotes = parseInt($.inidb.get("quotes", "num_quotes"));
    var quote;
    
    if(command.equalsIgnoreCase("quote")) {
        if (isNaN(num_quotes) || num_quotes == 0) {
            $.say("There are no quotes at this time");
            return;
        }
        
        var num = $.rand(num_quotes);
        
        $.say("#" + num + ": " + $.inidb.get("quotes", "quote_" + num));
    }
    
    if (command.equalsIgnoreCase("addquote")) {
        if (!$.isMod(sender)) {
            $.say("You must be a Moderator to use this command!");
            return;
        }
        
        $.inidb.incr("quotes", "num_quotes", 1);
        $.inidb.set("quotes", "quote_" + num_quotes, argsString);
        
        $.say("Quote added! There are now " + (num_quotes + 1) + " quotes!");
    }
    
    if (command.equalsIgnoreCase("delquote")) {
        if (!$.isMod(sender)) {
            $.say("You must be a Moderator to use this command!");
            return;
        }
        
        if (isNaN(num_quotes) || num_quotes == 0) {
            $.say("There are no quotes at this time");
            return;
        }
        
        if (!argsString.isEmpty()) {
            $.say("Usage: !delquote <id>");
            return;
        }
        
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

$.registerChatCommand("quote");
$.registerChatCommand("addquote");
$.registerChatCommand("delquote");