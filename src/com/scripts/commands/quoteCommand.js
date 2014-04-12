$.on('command', function(event) {
    var command = event.getCommand();
    var quotes = new Array (0);

    quotes[0] = "\"NO ONE CARES WHAT DAY YOU LIVE IN!!\" - PhantomIndex December 1st 2013"
    quotes[1] = "\"Take this!!! MY LOVE! MY ANGER! AND ALL OF MY FINGERS!!!\" - PhantomIndex December 1st 2013"
    quotes[2] = "\"He's gonna USE ALL FIVE FINGERS!!\" - PhantomIndex December 1st 2013"
    quotes[3] = "\"Sometimes you just gotta POMF~!\" - PhantomIndex December 3rd 2013"
    quotes[4] = "\"Let's all POMF~ together. . .\" - PhantomIndex December 2nd 2013"
    quotes[5] = "\"I am the bone of my boner. . .\" - PhantomIndex December 11th 2013"
    quotes[6] = "\"We must take this man down, I\"ve got the boner.\" - PhantomIndex December 11th 2013"
    quotes[7] = "\"Christmas is about 10 gays away.\" - PhantomIndex December 15th 2013"
    quotes[8] = "\"If your love does not give Phantom a boner then its not enough.\" - PhantomIndex December 18th 2013"
    quotes[9] = "\"I can MAKE more breast milk?\" - PhantomIndex December 24th 2013"
    quotes[10] = "\"Oh, you can't just quote yourself!\" - ScrubyScrubrton December 25th 2013"
    quotes[11] = "\"Muffins right Phantom, you can\"t just shit your pants and call it a quote.\" - ScrubyScrubrton December 25th 2013",
    quotes[12] = "\"Be prepaired for queefing!\" - Muffinsbetasty December 25th 2013\""
    quotes[13] = "\"Oh, I know how to grow a penis.\" - Muffinsbetasty December 26th 2013\""
    quotes[14] = "\"You know what, just eat me.\" - FeralKitsune December 28th 2013\""
    quotes[15] = "\"Engaging hat mode\" - DawnHikarii January 3rd 2014"
    quotes[16] = "\"I have over 10,000 mating calls!\" - PhantomIndex January 6th 2014"
    quotes[17] = "\"i like futanari so it's all good\" - Kageken January 7th 2014"
    quotes[18] = "\"Put my dick in your foot.\" - PhantomIndex January 7th 2014"
    quotes[19] = "\"Im expanding my tunnel vision. With my anus.\" - PhantomIndex January 20th 2014"
    quotes[20] = "\"Draw yourdick, not your dick but yourdick!\" - Muffinsbetasty January 23rd 2014"
    quotes[21] = "\"Phantom has fluffy hair like Gintoki\" - ibakerboi March 2nd 2014"
    quotes[22] = "\"I don't wanna fight him!\" - Phantom_Index while playing Dark Souls 2 - March 11th 2014"
    quotes[23] = "\"What is Waifu, Baby don't Desu me, Don't Desu me, No Sugoi\" - ScrubyScrubrton - March 26th 2014"

    if(command.equalsIgnoreCase("quotes" || "quote")) {
        $.say($.randElement(quotes));
    }
});


