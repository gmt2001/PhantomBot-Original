$.on('twitchFollow', function(event) {
    var follower = event.getFollower().toLowerCase();
    var username = $.username.resolve(follower);

    var followed = $.inidb.get('followed', follower);
    
    if (followed == null || followed == undefined || followed.isEmpty()) {
        $.inidb.set('followed', follower, 1);
        $.say("Thanks for the follow " + username + "! +100 " + $.pointname + "!");
        $.inidb.incr('points', follower, 100);
    }
    
    if (followed.equalsIgnoreCase("0")) {
        $.inidb.set('followed', follower, 1);
    }
});

$.on('twitchUnfollow', function(event) {
    var follower = event.getFollower().toLowerCase();
    var username = $.username.resolve(follower);

    var followed = $.inidb.get('followed', follower);
    
    if (followed == null || followed == undefined || followed.isEmpty()) {
        return;
    }
    
    if (followed.equalsIgnoreCase("1")) {
        $.inidb.set('followed', follower, 0);
    }
});