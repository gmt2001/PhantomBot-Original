package me.mast3rplan.phantombot;

import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelJoinEvent;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelLeaveEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcConnectCompleteEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcJoinCompleteEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcChannelMessageEvent;
import me.mast3rplan.phantombot.jerklib.Channel;
import me.mast3rplan.phantombot.jerklib.Session;
import me.mast3rplan.phantombot.jerklib.events.*;
import me.mast3rplan.phantombot.jerklib.listeners.IRCEventListener;

public class IrcEventHandler implements IRCEventListener {
    @Override
    public void receiveEvent(IRCEvent event) {
        EventBus eventBus = EventBus.instance();
        Session session = event.getSession();

        switch (event.getType()) {
            case CONNECT_COMPLETE:
                System.out.println ("Connection complete event");
                eventBus.post(new IrcConnectCompleteEvent(session));
                break;
            case JOIN_COMPLETE:
                System.out.println ("Join complete event");
                eventBus.post(new IrcJoinCompleteEvent(session, ((JoinCompleteEvent) event).getChannel()));
                break;
            case JOIN:
                System.out.println ("User joined event");
                JoinEvent joinEvent = (JoinEvent) event;
                eventBus.post(new IrcChannelJoinEvent(session, joinEvent.getChannel(), joinEvent.getNick()));
                break;
            case PART:
                System.out.println ("User left event");
                PartEvent partEvent = (PartEvent) event;
                eventBus.post(new IrcChannelLeaveEvent(session, partEvent.getChannel(), partEvent.getNick(), partEvent.getPartMessage()));
                break;
            case CHANNEL_MESSAGE:
                System.out.println ("Somebody said something");
                MessageEvent messageEvent = (MessageEvent) event;
                Channel channel = messageEvent.getChannel();
                String username = messageEvent.getNick();
                String message = messageEvent.getMessage();

                eventBus.post(new IrcChannelMessageEvent(session, username, message, channel));
                break;
        }
    }
}
