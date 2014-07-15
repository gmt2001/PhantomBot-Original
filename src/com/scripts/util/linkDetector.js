var Pattern = java.util.regex.Pattern;

//Did I miss a top level domain? (The part after the last dot, such as [com, org, net])
//Place it inside this otherTlds variable, with a pipe| character before each one
//Example for .tv: var otherTlds = "|tv";
//Example for .domain and .us: var otherTlds = "|domain|us";
var otherTlds = "";
var tldPattern = "(";
tldPattern += "a(c|ac(ademy|tor)|d|e|ero|f|g|gency|i|l|m|n|o|q|r|rpa|s|sia|t|u|w|x|z)|";
tldPattern += "b(a|ar|argains|b|d|e|erlin|est|f|g|h|i|id|ike|iz|j|lue|m|n|o|outique|r|s|t|uil(d|ers)|uzz|v|w|y|z)|";
tldPattern += "c(a|ab|amera|amp|ar(ds|eers)|at|atering|c|d|enter|eo|f|g|h|heap|hristmas|i|k|";
  tldPattern += "l|leaning|lothing|lub|m|n|o|odes|offee|o(m|m(munity|pany|puter))|on(dos|";
  tldPattern += "struction|tractors)|oo(l|p)|r|ruises|u|v|w|x|y|z)|";
tldPattern += "d(ance|ating|e|emocrat|iamonds|irectory|j|k|m|o|omains|z)|";
tldPattern += "e(c|du|ducation|e|g|mail|nterprises|quipment|r|s|state|t|u|vents|xp(ert|osed))|";
tldPattern += "f(arm|i|ish|j|k|lights|lorist|m|o|oundation|r|utbol)|";
tldPattern += "g(a|allery|b|d|e|f|g|h|i|ift|l|lass|m|n|ov|p|q|r|raphics|s|t|u|uitars|uru|w|y)|";
tldPattern += "h(k|m|n|ol(dings|iday)|ouse|r|t|u)|";
tldPattern += "i(d|e|l|m|mmobilien|n|ndustries|nfo|nstitute|nt|nternational|o|q|r|s|t)|";
tldPattern += "j(e|m|o|obs|p)|";
tldPattern += "k(aufen|e|g|h|i|im|itchen|iwi|m|n|p|r|red|w|y|z)|";
tldPattern += "l(a|and|b|c|i|ighting|imo|ink|k|r|s|t|u|uxury|v|y)|";
tldPattern += "m(a|aison|an(agement|go)|arketing|c|d|e|enu|g|h|il|k|l|m|n|o|obi|oda|onash|p|q|r|s|t|u|useum|v|w|x|y|z)|";
tldPattern += "n(a|agoya|ame|c|e|et|eustar|f|g|i|inja|l|o|p|r|u|z)|";
tldPattern += "o(kinawa|m|nl|rg)|";
tldPattern += "p(a|art(ners|s)|e|f|g|h|hot(o|ography|os)|ics|ink|k|l|lumbing|m|n|ost|r|ro|ro(ductions|perties)|s|t|ub|w|y)|";
tldPattern += "q(a|pon)|";
tldPattern += "r(e|ecipes|ed|entals|ep(air|ort)|eviews|ich|o|s|u|uhr|w)|";
tldPattern += "s(a|b|c|d|e|exy|g|h|hiksha|hoes|i|ingles|j|k|l|m|n|o|ocial|ol(ar|utions)|r|t|u|upp(lies|ly|ort)|v|x|y|ystems|z)|";
tldPattern += "t(attoo|c|d|echnology|el|f|g|h|ienda|ips|j|k|l|m|n|o|oday|okyo|ools|p|r|ra(ining|vel)|t|v|w|z)|";
tldPattern += "u(a|g|k|no|s|y|z)|";
tldPattern += "v(a|acations|c|e|entures|g|i|i(ajes|llas|sion)|n|ot(e|ing|o)|oyage|u)|";
tldPattern += "w(ang|atch|ed|f|ien|iki|orks|s)|";
tldPattern += "x(xx|yz)|";
tldPattern += "y(e|t)|";
tldPattern += "z(a|m|one|w)";
tldPattern += otherTlds + ")";
var linkPattern = "(http://|https://|ftp://)?(www\\.)?(\\w+\\.)+" + tldPattern + "(\\.\\w{1,4})?(:[0-9]{1,5})?((/|\\?)|(?![\\x20-\\x7E]))[\\x20-\\x7E]*";
var emailPattern = "(mailto:)?[\\w\\.]+\\x40(\\w+\\.)+" + tldPattern + "((\\.\\w{1,4})?(?![\\x20-\\x7E]))";
var otherPattern = "(magnet:|mailto:|ed2k://|irc://|ircs://|skype:|ymsgr:|xfire:|steam:|aim:|spotify:)[\\x20-\\x7E]*";

$.hasLinks = function(event, fallback) {
    if (fallback) {
        return event.isLink() == true;
    } else {
        var m1 = Pattern.compile(linkPattern).matcher(event.getMessage().toLowerCase());
        var m2 = Pattern.compile(emailPattern).matcher(event.getMessage().toLowerCase());
        var m3 = Pattern.compile(otherPattern).matcher(event.getMessage().toLowerCase());
        var s;
        var time = new java.text.SimpleDateFormat().format(new java.util.Date());

        if (m1.find() == true) {
            s = m1.group();

            println(">>>>Matched link on linkPattern from " + event.getSender() + ": " + s);
            $.writeToFile(">>>>[" + time + "] Matched link on linkPattern from " + event.getSender() + ": " + s, "linkMatches.txt", true);

           return true;
        }
        
        if (m2.find() == true) {
            s = m2.group();
            
            println(">>>>Matched link on emailPattern from " + event.getSender() + ": " + s);
            $.writeToFile(">>>>[" + time + "] Matched link on emailPattern from " + event.getSender() + ": " + s, "linkMatches.txt", true);

            return true;
        }

        if (m3.find() == true) {
            s = m3.group();
            
            println(">>>>Matched link on otherPattern from " + event.getSender() + ": " + s);
            $.writeToFile(">>>>[" + time + "] Matched link on otherPattern from " + event.getSender() + ": " + s, "linkMatches.txt", true);

            return true;
        }
    
        return false;
    }
}