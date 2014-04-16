var Objects = java.util.Objects;
var System = java.lang.System;

$.tostring = Objects.toString;
$.println = function(o) {
    System.out.println(tostring(o));
};

var blackList = ["getClass", "equals", "notify", "class", "hashCode", "toString", "wait", "notifyAll"];
function isJavaProperty(property) {
    for(var i in blackList) {
        if(blackList[i] == property) {
            return true;
        }
    }
    return false;
}

function generateTrampoline(obj, name) {
    return function() {
        var args = [$script];
        for(var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        obj[name].apply(obj, args);
    };
}

// register api methods
for(var name in $api) {
    if(isJavaProperty(name)) continue;
    if(typeof $api[name] == "function") {
        $[name] = generateTrampoline($api, name);
    } else {
        $[name] = $api[name];
    }
}

$.on('ircJoinComplete', function(event) {
    $.channel = event.getChannel();
    println("rebooted");
});

// [ ----------------------(Plugins enable/disable)------------------------ ]
$.loadScript('./util/misc.js');
$.loadScript('./permissions.js');
$.loadScript('./systems/fileSystem.js');
$.loadScript('./systems/pointSystem.js');
$.loadScript('./systems/timeSystem.js');
$.loadScript('./systems/betSystem.js');
$.loadScript('./systems/levelSystem.js');
$.loadScript('./systems/votingSystem.js');
$.loadScript('./systems/raffleSystem.js');
$.loadScript('./systems/greetingSystem.js');
$.loadScript('./events.js');
$.loadScript('./youtubePlayer.js');
$.loadScript('./followHandler.js');
$.loadScript('./chatModerator.js');
$.loadScript('./commands/addCommand.js');
$.loadScript('./commands/quoteCommand.js');
$.loadScript('./commands/randomCommand.js');
$.loadScript('./commands/rollCommand.js');
$.loadScript('./commands/donationCommand.js');
$.loadScript('./commands/killCommand.js');
$.loadScript('./kappaTrigger.js'); 


// [ ----------------------(Name for Points/Currency)------------------------ ]
$.pointname = "Player Points"; 






