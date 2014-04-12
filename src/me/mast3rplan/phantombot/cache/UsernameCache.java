package me.mast3rplan.phantombot.cache;

import com.google.common.collect.Maps;
import me.mast3rplan.phantombot.twitch.TwitchAPI;
import org.json.JSONObject;

import java.util.Map;

public class UsernameCache {
    private static final UsernameCache instance = new UsernameCache();
    public static UsernameCache instance() {
        return instance;
    }

    private Map<String, String> cache = Maps.newHashMap();

    public String resolve(String username) {
        username = username.toLowerCase();
        if (cache.containsKey(username)) {
            return cache.get(username);
        } else {
            try {
                JSONObject user = TwitchAPI.instance().getUser(username);
                String displayName = user.getString("display_name");
                cache.put(username, displayName);
                return displayName;
            } catch (Exception e) {
                e.printStackTrace();
                return username;
            }
        }
    }
}
