package me.mast3rplan.phantombot.musicplayer;

import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.musicplayer.*;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;
import java.util.Arrays;
import java.util.Collection;
import java.util.regex.Pattern;

public class MusicWebSocketServer extends WebSocketServer {
    public MusicWebSocketServer(int port) {
        super(new InetSocketAddress(port));

        this.start();
        System.out.println("MusicSockServer accepting connections on port " + port);
    }

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake) {
        EventBus.instance().post(new MusicPlayerConnectEvent());
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        EventBus.instance().post(new MusicPlayerDisconnectEvent());
    }

    @Override
    public void onMessage(WebSocket webSocket, String s) {
        String[] m = s.split(Pattern.quote("|"));
        if (m[0].equals("state")) {
            MusicPlayerState mps = MusicPlayerState.getStateFromId(Integer.parseInt(m[1]));
            EventBus.instance().post(new MusicPlayerStateEvent(mps));
        }
        if (m[0].equals("ready")) {
            EventBus.instance().post(new MusicPlayerStateEvent(MusicPlayerState.NEW));
        }
        if (m[0].equals("currentid")) {
            EventBus.instance().post(new MusicPlayerCurrentIdEvent(m[1]));
        }
        if (m[0].equals("currentvolume")) {
            EventBus.instance().post(new MusicPlayerCurrentVolumeEvent(Double.parseDouble(m[1])));
        }
    }

    @Override
    public void onError(WebSocket webSocket, Exception e) {
        e.printStackTrace();
    }

    public void sendToAll(String text) {
        Collection<WebSocket> con = connections();
        synchronized (con) {
            for (WebSocket c : con) {
                c.send(text);
            }
        }
    }

    public void cueNext() {
        sendToAll("next");
    }

    public void cuePrevious() {
        sendToAll("previous");
    }

    public void play() {
        sendToAll("play");
    }

    public void pause() {
        sendToAll("pause");
    }

    public void add(String video) {
        sendToAll("add|" + video);
    }

    public void reload() {
        sendToAll("reload");
    }

    public void cue(String video) {
        sendToAll("cue|" + video);
    }

    public void currentId() {
        sendToAll("currentid");
    }

    public void eval(String code) {
        sendToAll("eval|" + code);
    }

    public void setVolume(int volume) {
        if (!(volume > 100 || volume < 0)) {
            sendToAll("setvolume|" + volume);
        }
    }

    public void currentVolume() {
        sendToAll("currentvolume");
    }
}
