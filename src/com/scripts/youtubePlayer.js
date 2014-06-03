$var.defaultplaylist = $.readFile("./playlist.txt");
$var.defaultplaylistpos = 0;
$var.songqueue = [];
$var.requestusers = {};

var musicplayer = $.musicplayer;

function Song(name) {
    var data = $.youtube.getVideoInfo(name, "none");
    if (data != null) {
        this.id = data.id;
        this.name = data.name;
        this.length = data.length;
    } else {
        this.id = null;
        this.name = "";
        this.length = 0;
    }
    
    this.getid = function () {
        return this.id;
    }

    this.cue = function () {
        musicplayer.cue(this.id);
    }

    this.getName = function () {
        return $.youtube.getVideoTitle(this.id);
    }
}

function RequestedSong(song, user) {
    this.song = song;
    this.user = user;

    this.request = function () {
        if (!this.canRequest()) return;

        $var.songqueue.push(this);

        if ($var.requestusers[user] != null) {
            $var.requestusers[user]++;
        } else {
            $var.requestusers[user] = 0;
        }
    }

    this.canRequest = function () {
        if ($var.requestusers[user] == null) return true;
        
        var requestlimit = 2;
        
        return $var.requestusers[user] < requestlimit;
    }

    this.canRequest2 = function () {
        if ($var.requestusers[user] == null) return true;
        
        for (var i in $var.songqueue) {
            if (this.song.id + "" === $var.songqueue[i].song.id + "") return false;
        }
        return true;
    }

    this.play = function () {
        song.cue();
        $var.requestusers[user]--;
    }
}

function nextDefault() {
    var name = "";
    var user = "";
    var s = new Song(null);
    if ($var.defaultplaylist.length > 0) {
        s = new Song($var.defaultplaylist[$var.defaultplaylistpos]);
        s = new RequestedSong(s, "DJ " + $.username.resolve($.botname));
        $var.defaultplaylistpos++;
        
        if ($var.defaultplaylistpos >= $var.defaultplaylist.length) {
            $var.defaultplaylistpos = 0;
        }
        
        s.play();
        name = s.song.getName();
        user = s.user;

        $var.prevSong = $.currSong;
        $var.currSong = s;
    } else {
        $var.currSong = null;
    }

    if ($var.currSong == null) {
        return;
    }
    
    $.say("Now Playing >> \u266B~" + name + "~\u266B requested by " + user);
}

function next() {
    var name = "";
    var user = "";
    var s = new Song(null);
    if ($var.songqueue.length > 0) {
        s = $var.songqueue.shift();
        s.play();
        name = s.song.getName();
        user = s.user;

        $var.prevSong = $.currSong;
        $var.currSong = s;
    } else {
        $var.currSong = null;
    }

    if ($var.currSong == null) {
        $.say("The song request queue is empty! Request a new song with !addsong <youtube link>");
        nextDefault();
        return;
    }
    
    $.say("Now Playing >> \u266B~" + name + "~\u266B requested by " + user);
    
    var nextMsg = "The song request queue is empty! Request a new song with !addsong <youtube link>";
    if ($var.songqueue.length > 0) {
        nextMsg = "Next song >> \u266B~" + $var.songqueue[0].song.getName() + "~\u266B requested by " + $var.songqueue[0].user;
    }
    
    $.say(nextMsg);
}

$.on('musicPlayerState', function (event) {
    if (event.getStateId() == -2) {
        $var.songqueue = [];
        $var.requestusers = {};
        
        next();
    }
    
    if (event.getStateId() == 0) {
        next();
    }
    
    if (event.getStateId() == 5) {
        $.musicplayer.play();
        $.musicplayer.currentId();
    }
});

var musicPlayerConnected = false;

$.on('musicPlayerConnect', function (event) {
    println("MusicClient connected!");
    musicPlayerConnected = true;
});

$.on('musicPlayerDisconnect', function (event) {
    println("MusicClient disconnected!");
    $.say("Songrequests has been disabled.")
    musicPlayerConnected = false;
});

$.on('command', function (event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    var videoL;
    var song;
    var id;
    var i;

    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

    if (command.equalsIgnoreCase("addsong")) {
        if (args.length == 0) {
            $.say("Type >> '!addsong <youtube link>' to add a song to the playlist.")
            return;
        }
        
        if (args.length >= 1) {
            if (!musicPlayerConnected) {
                $.say("Songrequests is currently disabled!");
                return;
            }
            
            var video = new Song(argsString);

            if (video.id == null) {
                $.say("Song doesn't exist or you typed something wrong.");
                return;
            }
            
            if (video.length < 10) {
                videoL = video.length.toString().substr(0, 1);

            } else if (video.length < 100) {
                videoL = video.length.toString().substr(0, 3);
            } else {
                videoL = video.length.toString().substr(0, 2);
            }
            
            if (video.length > 8.0) {
                $.say("Song >> " + video.name + " is " + videoL + " minutes long, maximum length is 7 minutes.");
                return;
            }

            song = new RequestedSong(video, username);

            if (!song.canRequest()) {
                $.say("You've hit your song request limit, " + username + "!");
                return;
            }
            
            if (!song.canRequest2()) {
                $.say("That song is already in the queue or the default playlist, " + username + "!");
                return;
            }

            $.say("Song >> " + video.name + " was added to the queue by " + username + ".");
            song.request();
            
            if ($var.currSong == null) {
                next();
            }
        }
        
        if (command.equalsIgnoreCase("removesong")) {
            if (!musicPlayerConnected) {
                $.say("Songrequests is currently disabled!");
                return;
            }
            
            id = $.youtube.searchVideo(argsString, "none");
            if (id == null) {
                $.say("Song doesn't exist or you typed something wrong.");
                return;
            }

            for (i in $var.songqueue) {
                if (id + "" === $var.songqueue[i].song.id + "") {
                    if ($var.songqueue[i].user === username || $.isMod(sender)) {
                        $.say("Song >> " + $var.songqueue[i].song.getName() + " has been removed from the queue!");
                        $var.songqueue.splice(i, 1);
                        return;
                    } else {
                        $.say(username + ", only Moderators or the user who requested a song can remove it.");
                        return;
                    }
                }
            }

            $.say(sender + ", that song isn't in the list.");
        }
    }
    
    if (command.equalsIgnoreCase("volume")) {
        if (!$.isMod(sender)) {
            $.say($.username.resolve(sender) + ", " + $.getUserGroupName(username) + "s aren't allowed to use this command! Moderators only.");
            return;
        }
        
        if (args.length > 0) {
            $.musicplayer.setVolume(parseInt(args[0]));
            $.say("Music volume set to: " + args[0] + "%");
        } else {
            $.musicplayer.currentVolume();
        }
    }
    
    if (command.equalsIgnoreCase("skipsong")) {
        song = $.musicplayer.currentId();
        
        if (isMod(sender)) {
            next();
            return;
        }

        if ($var.skipSong) {
            if ($.pollVoters.contains(sender)) {
                $.say(username + ", you have already voted!");
            } else if (makeVote('yes')) {
                $.pollVoters.add(sender);
            }
            return;
        }

        if ($.runPoll(function (result) {
            $var.skipSong = false;
            $.pollResults.get ('yes').intValue();

            if (song != $.musicplayer.currentId()) {
                $.say("The poll failed due to the song ending.");
            }
            if ($.pollResults.get ('yes').intValue() == 1) {
                $.say("Skipping song!");
                next();
            } else {
                $.say("Failed to skip the song.");
            }

        }, ['yes', 'nope'], 35 * 3000, $.botname)) {
            $.say("2 more votes are required to skip this song, to vote use '!vote yes'");
            
            if (makeVote('yes')) {
                $.pollVoters.add(sender);
            }
            $var.skipSong = true;
        } else {
            $.say("A poll to skip a song is already open and running! " + username);
        }
    }
    
    if (command.equalsIgnoreCase("vetosong")) {
        if (!$.isMod(sender)) {
            var points = $.inidb.get('points', sender);
            
            if (points == null) points = 0;
            else points = int(points);

            if (100 > points) {
                $.say(sender + ", " + " You need 100 " + $.pointname + " to skip this song!");
                return;
            }

            $.inidb.decr('points', sender, 100);

            $.say(username + ", paid 100 " + $.pointname + " to skip the current song!");
        }
        
        next();
    }
    
    if (command.equalsIgnoreCase("currentsong")) {
        if ($var.currSong == null) {
            $.say("There is no song playing! Request one with !addsong <youtube link>");
            return;
        }
        
        $.say("Currently playing >> \u266B~" + $var.currSong.name + "~\u266B");
    }
    
    if (command.equalsIgnoreCase("nextsong")) {
        if ($var.songqueue.length > 0) {
            $.say("Next song >> \u266B~" + $var.songqueue[0].song.getName() + "~\u266B requested by " + $var.songqueue[0].user);
        } else {
            $.say("There are no more songs in the queue!");
        }
    }
});

$.registerChatCommand("addsong");
$.registerChatCommand("removesong");
$.registerChatCommand("volume");
$.registerChatCommand("skipsong");
$.registerChatCommand("vetosong");
$.registerChatCommand("currentsong");
$.registerChatCommand("nextsong");

$.on('musicPlayerCurrentVolume', function (event) {
    $.say("Music volume is currently: " + parseInt(event.getVolume()) + "%, dood!");
});