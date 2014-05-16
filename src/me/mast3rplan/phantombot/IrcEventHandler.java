package me.mast3rplan.phantombot;

import java.util.Iterator;
import java.util.List;
import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelJoinEvent;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelLeaveEvent;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelUserModeEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcConnectCompleteEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcJoinCompleteEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcChannelMessageEvent;
import me.mast3rplan.phantombot.jerklib.Channel;
import me.mast3rplan.phantombot.jerklib.ModeAdjustment;
import me.mast3rplan.phantombot.jerklib.Session;
import me.mast3rplan.phantombot.jerklib.events.*;
import me.mast3rplan.phantombot.jerklib.listeners.IRCEventListener;

public class IrcEventHandler implements IRCEventListener
{

    @Override
    public void receiveEvent(IRCEvent event)
    {
        EventBus eventBus = EventBus.instance();
        Session session = event.getSession();

        switch (event.getType())
        {
            case CONNECT_COMPLETE:
                System.out.println("Connected to IRC " + session.getNick() + "@" + session.getConnectedHostName());
                eventBus.post(new IrcConnectCompleteEvent(session));
                break;
            case JOIN_COMPLETE:
                System.out.println("Channel Joined [" + ((JoinCompleteEvent) event).getChannel().getName() + "]");
                eventBus.post(new IrcJoinCompleteEvent(session, ((JoinCompleteEvent) event).getChannel()));
                break;
            case JOIN:
                JoinEvent joinEvent = (JoinEvent) event;
                System.out.println("User Joined Channel [" + joinEvent.getChannelName() + "] " + joinEvent.getNick());
                eventBus.post(new IrcChannelJoinEvent(session, joinEvent.getChannel(), joinEvent.getNick()));
                break;
            case PART:
                PartEvent partEvent = (PartEvent) event;
                System.out.println("User Left Channel [" + partEvent.getChannelName() + "] " + partEvent.getNick());
                eventBus.post(new IrcChannelLeaveEvent(session, partEvent.getChannel(), partEvent.getNick(), partEvent.getPartMessage()));
                break;
            case CHANNEL_MESSAGE:
                MessageEvent messageEvent = (MessageEvent) event;
                System.out.println("Message from Channel [" + messageEvent.getChannel().getName() + "] " + messageEvent.getNick());
                Channel channel = messageEvent.getChannel();
                String username = messageEvent.getNick();
                String message = messageEvent.getMessage();

                eventBus.post(new IrcChannelMessageEvent(session, username, message, channel));
                break;
            case MODE_EVENT:
                ModeEvent modeEvent = (ModeEvent) event;

                if (modeEvent.getChannel() != null && modeEvent.getChannel().getName().length() > 1
                        && modeEvent.getModeType() == ModeEvent.ModeType.CHANNEL)
                {
                    List<ModeAdjustment> l = modeEvent.getModeAdjustments();
                    Iterator it = l.iterator();

                    while (it.hasNext())
                    {
                        ModeAdjustment adj = (ModeAdjustment) it.next();

                        System.out.println("MODE [" + modeEvent.getChannel().getName() + "] " + adj.toString());

                        if (adj.getArgument().length() > 0)
                        {
                            eventBus.post(new IrcChannelUserModeEvent(session, modeEvent.getChannel(), adj.getArgument(),
                                    String.valueOf(adj.getMode()), adj.getAction() == ModeAdjustment.Action.PLUS));
                        }
                    }
                }
                break;
        }
    }
}
