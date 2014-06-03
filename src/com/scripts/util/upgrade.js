println("Start upgrade...");

var keys;
var i;
var s;

if ($.inidb.GetInteger("init", "upgrade", "version") < 1) {
    println("   Starting version 1 upgrades...");
    
    keys = $.inidb.GetKeyList("bool", "");
    
    println("     Moving greeting enabled booleans to new system...");
    for (i = 0; i < keys.length; i++) {
        if ($.inidb.get("bool", keys[i]) == "true") {
            s = keys[i].substring(0, keys[i].indexOf("_greeting_enabled")).toLowerCase();
            
            $.inidb.set("greeting", s + "_enabled", "1");
            $.inidb.del("bool", keys[i]);
        }
    }
    
    keys = $.inidb.GetKeyList("string", "");
    
    println("     Moving greeting prefix/suffix strings to new system...");
    for (i = 0; i < keys.length; i++) {
        if (keys[i].indexOf("_greeting_prefix") != -1) {
            s = keys[i].substring(0, keys[i].indexOf("_greeting_prefix")).toLowerCase();
            
            if ($.inidb.exists("greeting", s)) {
                $.inidb.set("greeting", s, $.inidb.get("string", keys[i]) + " <name> " + $.inidb.get("greeting", s));
            } else {
                $.inidb.set("greeting", s, $.inidb.get("string", keys[i]) + " <name>");
            }
            
            $.inidb.del("string", keys[i]);
        } else if (keys[i].indexOf("_greeting_suffix") != -1) {
            s = keys[i].substring(0, keys[i].indexOf("_greeting_suffix")).toLowerCase();
            
            if ($.inidb.exists("greeting", s)) {
                $.inidb.set("greeting", s, $.inidb.get("greeting", s) + " " + $.inidb.get("string", keys[i]));
            } else {
                $.inidb.set("greeting", s, $.inidb.get("string", keys[i]));
            }
            
            $.inidb.del("string", keys[i]);
        }
    }
    
    if ($.inidb.FileExists("greetings")) {
        keys = $.inidb.GetKeyList("greetings", "");
    
        println("     Moving phantomindex greetings to new system...");
        for (i = 0; i < keys.length; i++) {
            if (keys[i].equalsIgnoreCase("default_greeting")) {
                $.inidb.set("greeting", "_default", $.inidb.get("greetings", keys[i]));
                $.inidb.del("greetings", keys[i]);
            } else {
                s = keys[i].substring(9).toLowerCase();
            
                $.inidb.set("greeting", s, $.inidb.get("greetings", keys[i]));
            
                $.inidb.del("greetings", keys[i]);
            }
        }
    }
    
    keys = $.inidb.GetKeyList("events", "");
    
    println("     Moving events to new system...");
    for (i = 0; i < keys.length; i++) {
        $.inidb.set("announcements", keys[i], $.inidb.get("events", keys[i]));
        $.inidb.del("events", keys[i]);
    }
    
    println("     Cleaning up old files");
    $.inidb.RemoveFile("bool");
    $.inidb.RemoveFile("string");
    
    if ($.inidb.FileExists("greetings")) {
        $.inidb.RemoveFile("greetings");
    }
    
    $.inidb.RemoveFile("events");
    
    $.deleteFile("./scripts/events.js");
    
    println("   End version 1 upgrades...");
}

println("   Saving...");

$.inidb.SetInteger("init", "upgrade", "version", parseInt($.upgrade_version));
$.inidb.SaveAll(true);

println("End upgrade...");