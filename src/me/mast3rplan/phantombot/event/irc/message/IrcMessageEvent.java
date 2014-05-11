package me.mast3rplan.phantombot.event.irc.message;

import java.util.regex.Pattern;
import me.mast3rplan.phantombot.event.irc.IrcEvent;
import me.mast3rplan.phantombot.jerklib.Session;
import org.apache.commons.lang3.CharUtils;

public abstract class IrcMessageEvent extends IrcEvent
{

    private String sender;
    private String message;
    /*public static Pattern addressPtn = Pattern.compile (
     "((\\w*\\.)*((a(ero|sia)|biz|cat|co(m|op)|edu|gov|i(nfo|nt)|jobs|m(e|il|obi|useum)|n(ame|et)|org|p(ost|ro)|t(el|ravel)|xxx)|" + 
     "(\\w*\\.\\w{2,4}))([ /\\\\$].*)?)|" +
     "(([0-9]{1,3}\\.){3}[0-9]{1,3})|" + 
     "(([0-9a-fA-F]{1,4}:){0,7}:?:?([0-9a-fA-F]{1,4})(:[0-9a-fA-F]{1,4}){0,7})" +
     "");*/
    public static Pattern addressPtn = Pattern.compile(
            "(http://)?(www\\.)?(\\w+\\.)+(a(ero|sia)|biz|cat|co(m|op)|edu|gov|i(nfo|nt)|jobs|m(e|il|obi|useum)|n(ame|et)|org|p(ost|ro)|t(el|ravel)|xxx)(\\.\\w{1,4})?(:[0-9])?[\\x20-\\x7E]*" //"((\\w{1,5}://)?(\\w+\\.)+\\w\\w+([ :/\\\\].*)?)|" +
            //"(([0-9]{1,3}\\.){3}[0-9]{1,3})|" +
            //"(([0-9a-fA-F]{1,4}:){0,7}:?:?([0-9a-fA-F]{1,4})(:[0-9a-fA-F]{1,4}){0,7})"
            );

    protected IrcMessageEvent(Session session, String sender, String message)
    {
        super(session);
        this.sender = sender;
        this.message = message;
    }

    public String getSender()
    {
        return sender;
    }

    public String getMessage()
    {
        return message;
    }

    public int getCapsCount()
    {
        int count = 0;
        for (int i = 0, l = message.length(); i < l; ++i)
        {
            if (CharUtils.isAsciiAlphaUpper(message.charAt(i)))
            {
                ++count;
            }
        }
        return count;
    }

    public boolean isLink()
    {
        return IrcMessageEvent.addressPtn.matcher(message).find();
    }
}
