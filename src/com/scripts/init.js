var Objects = java.util.Objects;
var System = java.lang.System;

$.tostring = Objects.toString;
$.println = function(o) { System.out.println(tostring(o)); };

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
//$.loadScript('./systems/betSystem.js');
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


// [ ----------------------(interval event messages)------------------------ ]
$.messages = [

function () {
        return ">> Like to help me out & improve the stream? Donate through here >> http://phantomindex.com/donate";
},

function () {
        return ">> Everyone earns +1 " + $.pointname + " for every 10 minutes they're in the channel! Type '!points' to view them.";
},

function () {
        return ">> Leveling system has been implemented into chat. Exchange points for exp using '!exp' and see your level and title using '!level' & '!title'. Please give me feedback and suggestions.";
},

function () {
        return ">> Follow @PhantomIndex on Twitter for the latest stream updates! >> https://twitter.com/phantomindex";
},

function () {
        return ">> Join our Steam group here! -> http://steamcommunity.com/groups/BurningRed and be notified when Phantom starts streaming.";
},

function () {
        return ">> Help expand the audience by tweeting this channel >> http://phantomindex.com/tweet";
}
    ];











