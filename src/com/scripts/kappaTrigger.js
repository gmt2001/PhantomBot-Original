$.on('ircChannelMessage', function(event) {
    var message = event.getMessage();
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);

    var emote = "Kappa";

    if (message.indexOf(emote) != -1) {
        $.say(emote);
    }

    var helix = "Helix";
    var messages = new Array (0);
    messages[0] = "May the Helix be with you."
    messages[1] = "I'm neutral on that subject."
    messages[2] = "Definitely."
    messages[3] = "Everyone in this channel has been converted to the Helix."
    messages[4] = "Praise Helix."

    if (message.indexOf(helix) != -1) {
        $.say($.randElement(messages));
    }
});
