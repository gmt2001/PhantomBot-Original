package me.mast3rplan.phantombot.cache;

import com.gmt2001.TwitchAPIv2;
import com.google.common.collect.Maps;
import java.util.Map;
import org.json.JSONObject;

public class UsernameCache
{

    private static final UsernameCache instance = new UsernameCache();

    public static UsernameCache instance()
    {
        return instance;
    }
    private Map<String, String> cache = Maps.newHashMap();

    public String resolve(String username)
    {
        username = username.toLowerCase();
        if (cache.containsKey(username))
        {
            return cache.get(username);
        } else
        {
            try
            {
                JSONObject user = TwitchAPIv2.instance().GetUser(username);

                if (user.getBoolean("_success"))
                {
                    String displayName = user.getString("display_name");
                    cache.put(username, displayName);
                    return displayName;
                } else
                {
                    return username;
                }
            } catch (Exception e)
            {
                e.printStackTrace();
                return username;
            }
        }
    }
}
