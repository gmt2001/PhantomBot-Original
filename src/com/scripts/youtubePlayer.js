var init = $.readFile("songs.txt");
/*var stolenSongs = $.readFile("stolenSongs.txt");
for (var i = 0; i < stolenSongs.length; ++i) {
    if (stolenSongs[i] != "")
        init[init.length] = stolenSongs[i];
}
*/
function initPools() {
    if ($var.songpool == null) {
        $var.songpool = [];
        for (var t in init) {
            var s = new Song(init[t]);
            if (s.id != null) {
                s.addToPool()
            } else {
                println("Failed to queue '" + init[t] + "', search returned no results");
            }
        }
    }
    if ($var.songqueue == null)
        $var.songqueue = [];
    if ($var.requestusers == null)
        $var.requestusers = {};
}
//initPools();

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

    this.cue = function () {
        musicplayer.cue(this.id);
    }

    this.addToPool = function () {
        if (this == null || this.id == null) return;
        for (var i in $var.songpool) {
            if (this.id + "" === $var.songpool[i].id + "") return;
        }
        initPools();
        $var.songpool.push(this);
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
        song.addToPool();

        if ($var.requestusers[user] != null) {
            $var.requestusers[user]++;
        } else {
            $var.requestusers[user] = 0;
        }
    }

    this.canRequest = function () {
        if ($var.requestusers[user] == null) return true;
        var requestlimit = 2;

        if ($.hasGroupByName(user, "Regular")) {
            var requestlimit = 3;
        } else {
            var requestlimit = 2;
        }

        if ($.hasGroupByName(user, "Prinny")) {
            var requestlimit = 4;
        } else {
            var requestlimit = 2;
        }

        if ($.hasGroupByName(user, "Golden")) {
            var requestlimit = 6;
        } else {
            var requestlimit = 2;
        }

        if ($.hasGroupByName(user, "Burning")) {
            var requestlimit = 10;
        } else {
            var requestlimit = 2;
        }


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

function next() {
    initPools();
    var name = "";
    var user = "DJ PhantomBot"
    var s = new Song(null);
    if ($var.songqueue.length > 0) {
        s = $var.songqueue.shift();
        s.play();
        name = s.song.getName();
        user = s.user;
    } else {
        if ($var.currSong != null) {
            do {
                s = $.randElement($var.songpool);
            } while (s.id + "" === $var.currSong.id + "");
        } else {
            s = $.randElement($var.songpool);
        }
        //for (var i in $var.songpool) {
        //    println($var.songpool[i]);    
        //}
        s.cue();
        name = s.getName();
    }

    $var.prevSong = $.currSong;
    $var.currSong = s;
    $.say("Coming up >> ♫~" + name + "~♫ requested by " + user);
    var nextMsg = "If no one chooses the next song, PhantomBot will choose for you!";
    if ($var.songqueue.length > 0)
        nextMsg = "Next song >> ♫~" + $var.songqueue[0].song.getName() + "~♫ requested by " + $var.songqueue[0].user;
    printNameToFile(" Now Playing >> ♫~" + name + "~♫ requested by " + user);
}

$.on('musicPlayerState', function (event) {
    //println(event.getState());
    if (event.getStateId() == -2) {
        initPools();
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
    $.say("Songrequests enabled! >> Loading up a random song.");
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

    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }

   
    if (command.equalsIgnoreCase("songrequest")) {
        if (args.length == 0) {
            $.say("Type >> '!songrequest <youtubelink>' to add a song to the playlist.")
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
                var videoL = video.length.toString().substr(0, 1);

            } else if (video.length < 100) {
                var videoL = video.length.toString().substr(0, 3);
            } else {
                var videoL = video.length.toString().substr(0, 2);
            }
            if (video.length > 8.0) {
                $.say("Song >> " + video.name + " is " + videoL + " minutes long, maximum length is 7 minutes.");
                return;
            }

            var song = new RequestedSong(video, username);

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
        }
        if (command.equalsIgnoreCase("songremove")) {
            if (!musicPlayerConnected) {
                $.say("Songrequests is currently disabled!");
                return;
            }
            var id = $.youtube.searchVideo(argsString, "none");
            if (id == null) {
                $.say("Song doesn't exist or you typed something wrong.");
                return;
            }

            for (var i in $var.songqueue) {
                if (id + "" === $var.songqueue[i].song.id + "") {
                    if ($var.songqueue[i].user === username || $.hasGroupByName(sender, "Moderator")) {
                        $.say("Song >> " + $var.songqueue[i].song.getName() + " has been removed from the queue!");
                        $var.songqueue.splice(i, 1);
                        return;
                    } else {
                        $.say($.username.resolve(sender) + ", " + $.getUserGroupName(username) + "s aren't allowed to remove songs! Moderators only.");
                        return;
                    }
                }
            }

            $.say(sender + ", that song isn't in the list.");
        }
    }
    if (command.equalsIgnoreCase("volume")) {
        if (!$.hasGroupByName(sender, "Moderator")) {
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

        var song = $.musicplayer.currentId();

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

        }, ['yes', 'nope'], 35 * 3000, "phantombot")) {
            $.say("2 more votes are required to skip this song, to vote use '!vote yes'");
            if (makeVote('yes')) {
                $.pollVoters.add(sender);
            }
            $var.skipSong = true;
        } else {
            $.say("A poll to skip a song is already open and running! " + username);
        }
    }
    if (command.equalsIgnoreCase("stealsong")) {
        if ($.hasGroupByName(sender, "Moderator")) {
            if (!musicPlayerConnected) {
                $.say("Songrequests is currently disabled!");
                return;
            }
            var id = $var.currSong.id;
            for (var i = 0; i < init.length; ++i) {
                if (init[i] == id) {
                    $.say("'" + $var.currSong.name + "' is already in the queue.");
                    return;
                }
            }
            $.writeToFile(id, "stolensongs.txt", true);
            init[init.length] = id;
        } else {
            $.say($.username.resolve(sender) + ", " + $.getUserGroupName(username) + "s aren't allowed to use this command! Moderators only.");
        }
    }
    if (command.equalsIgnoreCase("vetosong")) {
        if (!$.hasGroupByName(sender, "Moderator")) {
            var points = $.db.get('points', sender);
            if (points == null) points = 0;
            else points = int(points);

            if (50 > points) {
                $.say(sender + ", " + " You need 50 " + $.pointname + " to skip this song!");
                return;
            }

            $.db.decr('points', sender, 50);

            $.say(username + ", paid 50 " + $.pointname + " to skip the current song!");
        }
        next();
    }
    if (command.equalsIgnoreCase("currentsong")) {
        $.say("Currently playing >> ♫~" + $var.currSong.name + "~♫");
    }
    if (command.equalsIgnoreCase("nextsong")) {
        if ($var.songqueue.length > 0) {
            $.say("Next song >> ♫~" + $var.songqueue[0].song.getName() + "~♫ requested by " + $var.songqueue[0].user);
        } else {
            $.say("There are no more songs in the queue!");
        }
    }
});

$.on('musicPlayerCurrentVolume', function (event) {
    $.say("Music volume is currently: " + parseInt(event.getVolume()) + "%, dood!");
});

function printNameToFile(name) {
    var pw = new java.io.PrintWriter("currentsong.txt", "UTF-8");
    pw.println(name);
    pw.close();
}