var messageCount = 0;
var messageTime = 0;
var points = $.db.get('points', 'phantombot');
if(points == null) points = 0;

var messageIndex = 0;

function sendMessage() {
	var message = $.messages[messageIndex];
	
	messageIndex++;
	if(messageIndex == messages.length) {
		messageIndex = 0;
	}
	
    $.say(message());
}

$.on('ircChannelMessage', function(event) {
	messageCount++;
});

function runMessage() {
	if (messageCount >= 10 && messageTime + 550 * 1000 < System.currentTimeMillis()){
		messageCount = 0;
        sendMessage();
        messageTime = System.currentTimeMillis();
    }
	setTimeout(runMessage, 1000);
}

runMessage();