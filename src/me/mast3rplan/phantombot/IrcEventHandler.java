package me.mast3rplan.phantombot;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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

    private final ArrayList<String> mods = new ArrayList<>();

    @Override
    public void receiveEvent(IRCEvent event)
    {
        EventBus eventBus = EventBus.instance();
        Session session = event.getSession();

        switch (event.getType())
        {
            case CONNECT_COMPLETE:
                com.gmt2001.Console.out.println("Connected to IRC " + session.getNick() + "@" + session.getConnectedHostName());
                eventBus.postAsync(new IrcConnectCompleteEvent(session));
                break;
            case JOIN_COMPLETE:
                com.gmt2001.Console.out.println("Channel Joined [" + ((JoinCompleteEvent) event).getChannel().getName() + "]");
                eventBus.postAsync(new IrcJoinCompleteEvent(session, ((JoinCompleteEvent) event).getChannel()));
                break;
            case JOIN:
                JoinEvent joinEvent = (JoinEvent) event;
                //com.gmt2001.Console.out.println("User Joined Channel [" + joinEvent.getChannelName() + "] " + joinEvent.getNick());
                eventBus.postAsync(new IrcChannelJoinEvent(session, joinEvent.getChannel(), joinEvent.getNick()));
                break;
            case PART:
                PartEvent partEvent = (PartEvent) event;
                mods.remove(partEvent.getNick().toLowerCase());
                //com.gmt2001.Console.out.println("User Left Channel [" + partEvent.getChannelName() + "] " + partEvent.getNick());
                eventBus.postAsync(new IrcChannelLeaveEvent(session, partEvent.getChannel(), partEvent.getNick(), partEvent.getPartMessage()));
                break;
            case CHANNEL_MESSAGE:
                MessageEvent cmessageEvent = (MessageEvent) event;
                Map<String, String> cmessageTags = cmessageEvent.tags();

                if (PhantomBot.enableDebugging)
                {
                    com.gmt2001.Console.out.println(">>Channel Message Tags");
                    com.gmt2001.Console.out.println(">>>>Raw: " + cmessageEvent.tagsString());

                    for (Map.Entry<String, String> tag : cmessageTags.entrySet())
                    {
                        com.gmt2001.Console.out.println(">>>>" + tag.getKey() + " = " + tag.getValue());
                    }

                    com.gmt2001.Console.out.println(">>End of Tags");
                }

                if (cmessageTags.containsKey("subscriber"))
                {
                    if (cmessageTags.get("subscriber").equalsIgnoreCase("1"))
                    {
                        eventBus.postAsync(new IrcPrivateMessageEvent(session, "jtv", "SPECIALUSER " + cmessageEvent.getNick() + " subscriber"));
                    }
                }

                if (cmessageTags.containsKey("user-type"))
                {
                    if (cmessageTags.get("user-type").length() > 0
                            || cmessageEvent.getChannel().getName().replaceAll("#", "").equalsIgnoreCase(cmessageEvent.getNick()))
                    {
                        if (!mods.contains(cmessageEvent.getNick().toLowerCase()))
                        {
                            mods.add(cmessageEvent.getNick().toLowerCase());
                            eventBus.postAsync(new IrcChannelUserModeEvent(session, cmessageEvent.getChannel(), cmessageEvent.getNick(), "O", true));
                        }
                    } else
                    {
                        if (mods.contains(cmessageEvent.getNick().toLowerCase()))
                        {
                            mods.remove(cmessageEvent.getNick().toLowerCase());
                            eventBus.postAsync(new IrcChannelUserModeEvent(session, cmessageEvent.getChannel(), cmessageEvent.getNick(), "O", false));
                        }
                    }
                }

                if (cmessageEvent.getChannel().getName().replaceAll("#", "").equalsIgnoreCase(cmessageEvent.getNick()))
                {
                    if (!mods.contains(cmessageEvent.getNick().toLowerCase()))
                    {
                        mods.add(cmessageEvent.getNick().toLowerCase());
                        //com.gmt2001.Console.out.println(">>Next message marked Moderator (Broadcaster)");
                        eventBus.postAsync(new IrcChannelUserModeEvent(session, cmessageEvent.getChannel(), cmessageEvent.getNick(), "O", true));
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
                    Map<String, String> ctcmessageTags = ctcmessageEvent.tags();

                    if (ctcmessageTags.containsKey("subscriber"))
                    {
                        if (ctcmessageTags.get("subscriber").equalsIgnoreCase("1"))
                        {
                            eventBus.postAsync(new IrcPrivateMessageEvent(session, "jtv", "SPECIALUSER " + ctcmessageEvent.getNick() + " subscriber"));
                        }
                    }

                    if (ctcmessageTags.containsKey("user-type"))
                    {
                        if (ctcmessageTags.get("user-type").length() > 0
                                || ctcmessageEvent.getChannel().getName().replaceAll("#", "").equalsIgnoreCase(ctcmessageEvent.getNick()))
                        {
                            if (!mods.contains(ctcmessageEvent.getNick().toLowerCase()))
                            {
                                mods.add(ctcmessageEvent.getNick().toLowerCase());
                                eventBus.postAsync(new IrcChannelUserModeEvent(session, ctcmessageEvent.getChannel(), ctcmessageEvent.getNick(), "O", true));
                            }
                        } else
                        {
                            if (mods.contains(ctcmessageEvent.getNick().toLowerCase()))
                            {
                                mods.remove(ctcmessageEvent.getNick().toLowerCase());
                                eventBus.postAsync(new IrcChannelUserModeEvent(session, ctcmessageEvent.getChannel(), ctcmessageEvent.getNick(), "O", false));
                            }
                        }
                    }

                    if (ctcmessageEvent.getChannel().getName().replaceAll("#", "").equalsIgnoreCase(ctcmessageEvent.getNick()))
                    {
                        if (!mods.contains(ctcmessageEvent.getNick().toLowerCase()))
                        {
                            mods.add(ctcmessageEvent.getNick().toLowerCase());
                            //com.gmt2001.Console.out.println(">>Next message marked Moderator (Broadcaster)");
                            eventBus.postAsync(new IrcChannelUserModeEvent(session, ctcmessageEvent.getChannel(), ctcmessageEvent.getNick(), "O", true));
                        }
                    }

                    Channel ctcchannel = ctcmessageEvent.getChannel();
                    String ctcusername = ctcmessageEvent.getNick();
                    String ctcmessage = ctcmessageEvent.getCtcpString().replace("ACTION", "/me");

                    //Don't change this to postAsync. It cannot be processed in async or messages will be delayed
                    eventBus.post(new IrcChannelMessageEvent(session, ctcusername, ctcmessage, ctcchannel));
                }
                break;
            case PRIVATE_MESSAGE:
                MessageEvent pmessageEvent = (MessageEvent) event;
                String pusername = pmessageEvent.getNick();
                String pmessage = pmessageEvent.getMessage();

                eventBus.postAsync(new IrcPrivateMessageEvent(session, pusername, pmessage));
                break;
            case MODE_EVENT:
                ModeEvent modeEvent = (ModeEvent) event;

                if (modeEvent.getChannel() != null && modeEvent.getChannel().getName().length() > 1
                        && modeEvent.getModeType() == ModeEvent.ModeType.CHANNEL)
                {
                    List<ModeAdjustment> l = modeEvent.getModeAdjustments();
                    for (ModeAdjustment adj : l)
                    {
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

                            eventBus.postAsync(new IrcChannelUserModeEvent(session, modeEvent.getChannel(), adj.getArgument(),
                                    String.valueOf(adj.getMode()), adj.getAction() == ModeAdjustment.Action.PLUS));
                        }
                    }
                }
                break;
            case NOTICE:
                eventBus.postAsync(new IrcPrivateMessageEvent(session, "jtv", ((NoticeEvent) event).getNoticeMessage()));
                break;
            case DEFAULT:
                if (event.command().equalsIgnoreCase("USERSTATE"))
                {
                    Map<String, String> ceventTags = event.tags();

                    if (ceventTags.containsKey("user-type"))
                    {
                        if (ceventTags.get("user-type").length() > 0
                                || session.getChannel(event.arg(0)).getName().replaceAll("#", "").equalsIgnoreCase(PhantomBot.instance().getSession().getNick()))
                        {
                            if (!mods.contains(PhantomBot.instance().getSession().getNick().toLowerCase()))
                            {
                                mods.add(PhantomBot.instance().getSession().getNick().toLowerCase());
                                eventBus.postAsync(new IrcChannelUserModeEvent(session, session.getChannel(event.arg(0)), PhantomBot.instance().getSession().getNick(), "O", true));
                            }
                        } else
                        {
                            if (mods.contains(PhantomBot.instance().getSession().getNick().toLowerCase()))
                            {
                                mods.remove(PhantomBot.instance().getSession().getNick().toLowerCase());
                                eventBus.postAsync(new IrcChannelUserModeEvent(session, session.getChannel(event.arg(0)), PhantomBot.instance().getSession().getNick(), "O", false));
                            }
                        }
                    }

                    if (event.arg(0).replaceAll("#", "").equalsIgnoreCase(PhantomBot.instance().getSession().getNick()))
                    {
                        if (!mods.contains(PhantomBot.instance().getSession().getNick().toLowerCase()))
                        {
                            mods.add(PhantomBot.instance().getSession().getNick().toLowerCase());
                            //com.gmt2001.Console.out.println(">>Userstate marked bot Moderator (Broadcaster)");
                            eventBus.postAsync(new IrcChannelUserModeEvent(session, session.getChannel(event.arg(0)), PhantomBot.instance().getSession().getNick(), "O", true));
                        }
                    }
                }
                if (event.command().equalsIgnoreCase("WHISPER"))
                {
                    Map<String, String> weventTags = event.tags();
                    String wusername = event.getNick();
                    String message = event.arg(1);
                    eventBus.postAsync(new IrcPrivateMessageEvent(session, wusername, message));
                }
                break;
        }
    }
}
