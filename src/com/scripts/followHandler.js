$.on('twitchFollow', function(event) {
    var follower = event.getFollower().toLowerCase();
    var username = $.username.resolve(follower);

    var followed = $.db.get('followed', follower);
    if(followed == null || followed == "undefined") {
        $.db.set('followed', follower, 1);
        $.say("Thanks for the follow " + username + "! +100 " + $.pointname + "!"); 
        $.db.incr('points', follower, 100);

    }

});

