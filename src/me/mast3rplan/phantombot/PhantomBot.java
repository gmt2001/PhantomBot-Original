package me.mast3rplan.phantombot;

import com.google.common.eventbus.Subscribe;
import java.io.File;
import java.io.IOException;
import java.util.Random;
import java.util.TreeMap;
import java.util.TreeSet;
import me.mast3rplan.phantombot.cache.BannedCache;
import me.mast3rplan.phantombot.cache.FollowersCache;
import me.mast3rplan.phantombot.cache.UsernameCache;
import me.mast3rplan.phantombot.console.ConsoleInputListener;
import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.Listener;
import me.mast3rplan.phantombot.event.command.CommandEvent;
import me.mast3rplan.phantombot.event.console.ConsoleInputEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcConnectCompleteEvent;
import me.mast3rplan.phantombot.event.irc.complete.IrcJoinCompleteEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcChannelMessageEvent;
import me.mast3rplan.phantombot.event.irc.message.IrcMessageEvent;
import me.mast3rplan.phantombot.jerklib.Channel;
import me.mast3rplan.phantombot.jerklib.ConnectionManager;
import me.mast3rplan.phantombot.jerklib.Profile;
import me.mast3rplan.phantombot.jerklib.Session;
import me.mast3rplan.phantombot.musicplayer.MusicWebSocketServer;
import me.mast3rplan.phantombot.script.Script;
import me.mast3rplan.phantombot.script.ScriptEventManager;
import me.mast3rplan.phantombot.script.ScriptManager;
import me.mast3rplan.phantombot.store.DataStore;
import me.mast3rplan.phantombot.store.IniStore;
import me.mast3rplan.phantombot.twitch.TwitchAPI;
import me.mast3rplan.phantombot.youtube.YoutubeAPI;

public class PhantomBot implements Listener {
    private final String username;
    private final String password;
    private final String channelName;
    private String channelStatus;
    private Random rng;
    private BannedCache bancache;
    private TreeMap <String, Integer> sinbin;
    private TreeMap <String, Integer> pollResults;
    private TreeSet <String> voters;

    private Profile profile;
    private ConnectionManager connectionManager;
    private Session session;
    private Channel channel;

    private FollowersCache followersCache;

    private MusicWebSocketServer mws;
    //private MusicHtmlServer mhs;
    private HTTPServer mhs;

    ConsoleInputListener cil;

    public PhantomBot(String username, String password, String channel) {
        this.username = username;
        this.password = password;
        this.channelName = channel;

        this.profile = new Profile(username.toLowerCase());
        this.connectionManager = new ConnectionManager(profile);

        this.followersCache = FollowersCache.instance(channel.toLowerCase());
        
        rng = new Random ();
        rng.setSeed (System.currentTimeMillis ());
        bancache = new BannedCache ();
        sinbin = new TreeMap ();
        pollResults = new TreeMap ();
        voters = new TreeSet ();

        this.init();
        try {
            Thread.sleep (1000);
        } catch (InterruptedException ex) {
        }
        this.session = connectionManager.requestConnection("tmi6.justin.tv", 443, password);
        //this.session = connectionManager.requestConnection("irc.twitch.tv", 6667, password);
        this.session.addIRCEventListener(new IrcEventHandler());
    }

    public final void init() {
        mhs = new HTTPServer(25565);
        mhs.start ();
        mws = new MusicWebSocketServer(25566);

        cil = new ConsoleInputListener();
        cil.start();

        EventBus.instance().register(this);
        EventBus.instance().register(ScriptEventManager.instance());

        Script.global.defineProperty("db", DataStore.instance(), 0);
        Script.global.defineProperty("inidb", IniStore.instance(), 0);
        Script.global.defineProperty("sinbin", sinbin, 0);
        Script.global.defineProperty("bancache", bancache, 0);
        Script.global.defineProperty("username", UsernameCache.instance(), 0);
        Script.global.defineProperty("twitch", TwitchAPI.instance(), 0);
        Script.global.defineProperty("followers", followersCache, 0);
        Script.global.defineProperty("channelName", channelName, 0);
        Script.global.defineProperty("channelStatus", channelStatus, 0);
        Script.global.defineProperty("musicplayer", mws, 0);
        Script.global.defineProperty("random", rng, 0);
        Script.global.defineProperty("youtube", YoutubeAPI.instance, 0);
        Script.global.defineProperty("pollResults", pollResults, 0);
        Script.global.defineProperty("pollVoters", voters, 0);

        try {
            ScriptManager.loadScript(new File("./scripts/init.js"));
        } catch (IOException e) {
        }
    }

    @Subscribe
    public void onIRCConnectComplete(IrcConnectCompleteEvent event) {
        session.join("#" + channelName.toLowerCase());
        System.out.println ("Connected to server\nJoining channel #" + channelName.toLowerCase());
    }

    @Subscribe
    public void onIRCJoinComplete(IrcJoinCompleteEvent event) {
        this.channel = event.getChannel ();
        System.out.println ("Joined channel: " + event.getChannel ().getName ());
    }

    @Subscribe
    public void onIRCChannelMessage(IrcChannelMessageEvent event) {
        String message = event.getMessage();
        String sender = event.getSender();
        if(message.startsWith("!")) {
            String commandString = message.substring(1);
            handleCommand (sender, commandString);
        }
        //System.out.println (event.getMessage ());
    }
    
    @Subscribe
    public void onConsoleMessage (ConsoleInputEvent msg) {
        String message = msg.getMsg ();
        if (message.equals ("exit"))
        {
            IniStore.instance().SaveAll(true);
            
            System.exit (0);
        }
        //System.out.println (message);
        handleCommand ("Phantombot", message);
    }
    
    public void handleCommand (String sender, String commandString) {
        String command, arguments;
        int split = commandString.indexOf(' ');
        if(split == -1) {
            command = commandString;
            arguments = "";
        } else {
            command = commandString.substring(0, split);
            arguments = commandString.substring(split + 1);
        }

        EventBus.instance().post(new CommandEvent(sender, command, arguments));
    }

    public static void main(String[] args) throws IOException {
        if(args.length != 3) {
            System.out.println("Usage: java -jar PhantomBot.jar <username> <password> <channel>");
            return;
        }
        PhantomBot phantomBot = new PhantomBot(args[0], args[1], args[2]);
        //HTTPClient.getResource ("http://en.wikipedia.org/index.html");
        //HTTPClient.getResource ("http://en.wikipedia.org/wiki/Main_Page");
        //System.out.println (HTTPClient.getResource ("https://api.twitch.tv/kraken").getBody ());
        /*URLConnection connection = new URL("https://api.twitch.tv/kraken/oauth2/token").openConnection();
        connection.setUseCaches(false);
        connection.setDefaultUseCaches(false);
        connection.addRequestProperty ("client_id", "tgl3z25burd57mkv3ov5gb6io40i7f9");
        connection.addRequestProperty ("username", "jesmaz");
        System.out.println (IOUtils.toString(connection.getInputStream(), connection.getContentEncoding()));*/
        /*String [] test = {
          "message 192.45.45.1",
          "2001:0db8:0000:0000:0000:ff00:0042:8329",
          "text before 2001:0db8:0000:0000:0000:ff10:0042:8329 text after",
          "2001:db8:0:0:0:ff00:42:8329",
          "2001:db8::ff00:42:8329",
          "example.com",
          "probably.not.a.website",
          "this.is.not.a.valid.link()",
          "the comment has no link",
          "www.google.com",
          "http://www.kernal.org/",
          "google.com",
          "www.facebook.com/subpage",
          "www.facebook.com/subpage?v=O932GF"
        };
        for (String s : test) {
            System.out.println ("'" + s + "' : " + isLink (s));
        }*/
    }
    
    public static boolean isLink (String message) {
        String [] arr = message.split (" ");
        for (String s : arr) {
            if (IrcMessageEvent.addressPtn.matcher(s).matches())
            {
                return true;
            }
        }
        return false;
        /*InetAddress ip;
        URI uri;
        
        String [] arr = message.split (" ");
        for (String s : arr) {
            try {
                uri = URI.create (s);
                //ip = InetAddress.getByName (s);
                return true;
            } catch (IllegalArgumentException ex) {
            }
        }
        return false;*/
    }
}
