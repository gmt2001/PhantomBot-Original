/* 
 * Copyright (C) 2015 www.phantombot.net
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package me.mast3rplan.phantombot;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelJoinEvent;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelLeaveEvent;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelUserModeEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcConnectCompleteEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcJoinCompleteEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcChannelMessageEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcPrivateMessageEvent;
import me.mast3rplan.phantombot.jerklib.Channel;
import me.mast3rplan.phantombot.jerklib.ModeAdjustment;
import me.mast3rplan.phantombot.jerklib.Session;
import me.mast3rplan.phantombot.jerklib.events.*;
import me.mast3rplan.phantombot.jerklib.listeners.IRCEventListener;

public class IrcEventHandler implements IRCEventListener
{

    private ArrayList<String> mods = new ArrayList<>();

    @Override
    public void receiveEvent(IRCEvent event)
    {
        EventBus eventBus = EventBus.instance();
        Session session = event.getSession();
        boolean triggerSub = false;
        boolean triggerMod = false;

        if (PhantomBot.enableDebugging)
        {
            com.gmt2001.Console.out.println(">>>[DEBUG] Got event " + event.getType().toString() + " with command " + event.command());
        }

        switch (event.getType())
        {
            case CONNECT_COMPLETE:
                com.gmt2001.Console.out.println("Connected to IRC " + session.getNick() + "@" + session.getConnectedHostName());
                eventBus.post(new IrcConnectCompleteEvent(session));
                break;
            case JOIN_COMPLETE:
                com.gmt2001.Console.out.println("Channel Joined [" + ((JoinCompleteEvent) event).getChannel().getName() + "]");
                eventBus.post(new IrcJoinCompleteEvent(session, ((JoinCompleteEvent) event).getChannel()));
                break;
            case JOIN:
                JoinEvent joinEvent = (JoinEvent) event;
                //com.gmt2001.Console.out.println("User Joined Channel [" + joinEvent.getChannelName() + "] " + joinEvent.getNick());
                eventBus.post(new IrcChannelJoinEvent(session, joinEvent.getChannel(), joinEvent.getNick()));
                break;
            case PART:
                PartEvent partEvent = (PartEvent) event;
                mods.remove(partEvent.getNick().toLowerCase());
                //com.gmt2001.Console.out.println("User Left Channel [" + partEvent.getChannelName() + "] " + partEvent.getNick());
                eventBus.post(new IrcChannelLeaveEvent(session, partEvent.getChannel(), partEvent.getNick(), partEvent.getPartMessage()));
                break;
            case CHANNEL_MESSAGE:
                MessageEvent cmessageEvent = (MessageEvent) event;
                String cmessageTags = cmessageEvent.tags();

                if (PhantomBot.enableDebugging)
                {
                    com.gmt2001.Console.out.println(">>>[DEBUG] cmessageTags " + cmessageTags);
                }

                if (cmessageTags.length() > 0)
                {
                    String[] tags = cmessageTags.split(";");

                    for (int i = 0; i < tags.length && !triggerSub && !triggerMod; i++)
                    {

                        if (PhantomBot.enableDebugging)
                        {
                            com.gmt2001.Console.out.println(">>>[DEBUG] Splitting Tag " + tags[i]);
                        }

                        String[] kv = tags[i].split("=");

                        if (PhantomBot.enableDebugging)
                        {
                            com.gmt2001.Console.out.println(">>>[DEBUG] Split Size " + kv.length);
                        }

                        if (PhantomBot.enableDebugging && kv.length >= 1)
                        {
                            com.gmt2001.Console.out.println(">>>[DEBUG] Split[0] " + kv[0]);
                        }

                        if (PhantomBot.enableDebugging && kv.length >= 2)
                        {
                            com.gmt2001.Console.out.println(">>>[DEBUG] Split[1] " + kv[1]);
                        }

                        if (!triggerSub && kv[0].equalsIgnoreCase("subscriber") && kv.length == 2 && kv[1].equalsIgnoreCase("1"))
                        {
                            if (PhantomBot.enableDebugging)
                            {
                                com.gmt2001.Console.out.println(">>>[DEBUG] Dectected Subscriber");
                            }

                            com.gmt2001.Console.out.println(">>Next message marked Subscriber by IRCv3");
                            eventBus.post(new IrcPrivateMessageEvent(session, "jtv", "SPECIALUSER " + cmessageEvent.getNick() + " subscriber"));
                            triggerSub = true;
                        }

                        if (!triggerMod && kv[0].equalsIgnoreCase("user-type") && !cmessageEvent.getChannel().getName().replaceAll("#", "").equalsIgnoreCase(cmessageEvent.getNick()))
                        {
                            if (PhantomBot.enableDebugging)
                            {
                                com.gmt2001.Console.out.println(">>>[DEBUG] Checking user-type");
                            }

                            if (kv.length == 1 || kv[1].isEmpty())
                            {
                                if (mods.contains(cmessageEvent.getNick().toLowerCase()))
                                {
                                    if (PhantomBot.enableDebugging)
                                    {
                                        com.gmt2001.Console.out.println(">>>[DEBUG] User is not a moderator");
                                    }

                                    mods.remove(cmessageEvent.getNick().toLowerCase());
                                    eventBus.post(new IrcChannelUserModeEvent(session, cmessageEvent.getChannel(), cmessageEvent.getNick(), "O", false));
                                }

                                triggerMod = true;
                            } else
                            {
                                if (!mods.contains(cmessageEvent.getNick().toLowerCase()))
                                {
                                    if (PhantomBot.enableDebugging)
                                    {
                                        com.gmt2001.Console.out.println(">>>[DEBUG] User is a moderator (" + kv[1] + ")");
                                    }

                                    mods.add(cmessageEvent.getNick().toLowerCase());
                                    com.gmt2001.Console.out.println(">>Next message marked Moderator/Staff by IRCv3");
                                    eventBus.post(new IrcChannelUserModeEvent(session, cmessageEvent.getChannel(), cmessageEvent.getNick(), "O", true));
                                }

                                triggerMod = true;
                            }
                        }
                    }
                }

                if (cmessageEvent.getChannel().getName().replaceAll("#", "").equalsIgnoreCase(cmessageEvent.getNick()))
                {
                    if (!mods.contains(cmessageEvent.getNick().toLowerCase()))
                    {
                        mods.add(cmessageEvent.getNick().toLowerCase());
                        com.gmt2001.Console.out.println(">>Next message marked Moderator (Broadcaster)");
                        eventBus.post(new IrcChannelUserModeEvent(session, cmessageEvent.getChannel(), cmessageEvent.getNick(), "O", true));
                    }
                }

                //com.gmt2001.Console.out.println("Message from Channel [" + cmessageEvent.getChannel().getName() + "] " + cmessageEvent.getNick());
                Channel cchannel = cmessageEvent.getChannel();
                String cusername = cmessageEvent.getNick();
                String cmessage = cmessageEvent.getMessage();

                eventBus.post(new IrcChannelMessageEvent(session, cusername, cmessage, cchannel));
                break;
            case CTCP_EVENT:
                CtcpEvent ctcmessageEvent = (CtcpEvent) event;

                if (ctcmessageEvent.getCtcpString().startsWith("ACTION"))
                {
                    //com.gmt2001.Console.out.println("Message from Channel [" + ctcmessageEvent.getChannel().getName() + "] " + ctcmessageEvent.getNick());
                    Channel ctcchannel = ctcmessageEvent.getChannel();
                    String ctcusername = ctcmessageEvent.getNick();
                    String ctcmessage = ctcmessageEvent.getCtcpString().replace("ACTION", "/me");

                    eventBus.post(new IrcChannelMessageEvent(session, ctcusername, ctcmessage, ctcchannel));
                }
                break;
            case PRIVATE_MESSAGE:
                MessageEvent pmessageEvent = (MessageEvent) event;
                String pusername = pmessageEvent.getNick();
                String pmessage = pmessageEvent.getMessage();

                eventBus.post(new IrcPrivateMessageEvent(session, pusername, pmessage));
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

                        com.gmt2001.Console.out.println("MODE [" + modeEvent.getChannel().getName() + "] " + adj.toString());

                        if (adj.getArgument().length() > 0)
                        {
                            if (String.valueOf(adj.getMode()).equalsIgnoreCase("O"))
                            {
                                if (adj.getAction() == ModeAdjustment.Action.PLUS)
                                {
                                    mods.add(adj.getArgument().toLowerCase());
                                } else
                                {
                                    mods.remove(adj.getArgument().toLowerCase());
                                }
                            }

                            eventBus.post(new IrcChannelUserModeEvent(session, modeEvent.getChannel(), adj.getArgument(),
                                    String.valueOf(adj.getMode()), adj.getAction() == ModeAdjustment.Action.PLUS));
                        }
                    }
                }
                break;
            case NOTICE:
                eventBus.post(new IrcPrivateMessageEvent(session, "jtv", ((NoticeEvent) event).getNoticeMessage()));
                break;
            case DEFAULT:
                if (event.command().equalsIgnoreCase("USERSTATE"))
                {
                    String eventTags = event.tags();

                    if (eventTags.length() > 0)
                    {
                        String[] tags = eventTags.split(";");

                        for (int i = 0; i < tags.length && !triggerSub && !triggerMod; i++)
                        {
                            String[] kv = tags[i].split("=");

                            if (!triggerMod && kv[0].equalsIgnoreCase("user-type"))
                            {
                                if (kv.length > 1 && !kv[1].isEmpty())
                                {
                                    if (!mods.contains(PhantomBot.instance().getSession().getNick().toLowerCase()))
                                    {
                                        mods.add(PhantomBot.instance().getSession().getNick().toLowerCase());
                                        com.gmt2001.Console.out.println(">>Userstate marked bot Moderator/Staff by IRCv3");
                                        eventBus.post(new IrcChannelUserModeEvent(session, session.getChannel(event.arg(0)), PhantomBot.instance().getSession().getNick(), "O", true));
                                    }

                                    triggerMod = true;
                                }
                            }
                        }
                    }

                    if (event.arg(0).replaceAll("#", "").equalsIgnoreCase(PhantomBot.instance().getSession().getNick()))
                    {
                        if (!mods.contains(PhantomBot.instance().getSession().getNick().toLowerCase()))
                        {
                            mods.add(PhantomBot.instance().getSession().getNick().toLowerCase());
                            com.gmt2001.Console.out.println(">>Userstate marked bot Moderator (Broadcaster)");
                            eventBus.post(new IrcChannelUserModeEvent(session, session.getChannel(event.arg(0)), PhantomBot.instance().getSession().getNick(), "O", true));
                        }
                    }
                }
                break;
        }
    }
}
