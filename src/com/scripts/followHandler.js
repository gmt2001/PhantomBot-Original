$.on('twitchFollow', function(event) {
    var follower = event.getFollower().toLowerCase();
    var username = $.username.resolve(follower);

    var followed = $.inidb.get('followed', follower);
    if(followed == null || followed == "undefined") {
        $.inidb.set('followed', follower, 1);
        $.say("Thanks for the follow " + username + "! +100 " + $.pointname + "!"); 
        $.inidb.incr('points', follower, 100);

    }

});

