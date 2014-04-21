package me.mast3rplan.phantombot.cache;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.util.List;
import java.util.Map;
import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.twitch.follower.TwitchFollowEvent;
import me.mast3rplan.phantombot.event.twitch.follower.TwitchUnfollowEvent;
import me.mast3rplan.phantombot.twitch.TwitchAPI;
import org.json.JSONArray;
import org.json.JSONObject;

public class FollowersCache implements Runnable
{

    private static final Map<String, FollowersCache> instances = Maps.newHashMap();

    public static FollowersCache instance(String channel)
    {
        FollowersCache instance = instances.get(channel);
        if (instance == null)
        {
            instance = new FollowersCache(channel);

            instances.put(channel, instance);
            return instance;
        }

        return instance;
    }
    private Map<String, JSONObject> cache;
    private String channel;
    private int count;
    private Thread updateThread;

    public FollowersCache(String channel)
    {
        this.channel = channel;
        this.updateThread = new Thread(this);
        updateThread.start();
    }

    public int getCount(String channel) throws IOException
    {
        return TwitchAPI.instance().getChannel(channel, "follows?direction=ASC&limit=1&offset=" + (1000000 + (System.currentTimeMillis() % 1000000))).getInt("_total");
    }

    public boolean is(String username)
    {
        return cache.containsKey(username);
    }

    public JSONObject get(String username)
    {
        return cache.get(username);
    }

    @Override
    public void run()
    {
        while (true)
        {
            try
            {
                int newCount = getCount(channel);
                if (newCount != count)
                {
                    this.updateCache(newCount);
                }
            } catch (SocketTimeoutException e)
            {
                System.out.println("FollowersCache>>Failed to update followers: [SocketTimeoutException] " + e.getMessage());
            } catch (ConnectException e)
            {
                System.out.println("FollowersCache>>Failed to update followers: [ConnectException] " + e.getMessage());
            } catch (IOException e)
            {
                System.out.println("FollowersCache>>Failed to update followers: [IOException] " + e.getMessage());
            } catch (Exception e)
            {
                e.printStackTrace();
            }

            try
            {
                Thread.sleep(30 * 1000);
            } catch (InterruptedException e)
            {
                System.out.println("FollowersCache>>Failed to sleep: [InterruptedException] " + e.getMessage());
            }
        }
    }

    private void updateCache(int newCount) throws IOException, InterruptedException
    {
        Map<String, JSONObject> newCache = Maps.newHashMap();

        final List<JSONObject> responses = Lists.newArrayList();
        List<Thread> threads = Lists.newArrayList();
        for (int i = 0; i < Math.ceil(newCount / 100.0); i++)
        {
            final int offset = i * 100;
            Thread thread = new Thread()
            {
                @Override
                public void run()
                {
                    try
                    {
                        responses.add(TwitchAPI.instance().getChannel(channel, "follows?direction=ASC&limit=100&offset=" + offset));
                    } catch (IOException e)
                    {
                        System.out.println("FollowersCache>>Failed to get followers: [IOException] " + e.getMessage());
                    }
                }
            };
            threads.add(thread);
            thread.start();
        }

        for (Thread thread : threads)
        {
            thread.join();
        }

        for (JSONObject response : responses)
        {
            JSONArray followers = response.getJSONArray("follows");
            if (followers.length() == 0)
            {
                break;
            }

            for (int j = 0; j < followers.length(); j++)
            {
                JSONObject follower = followers.getJSONObject(j);
                newCache.put(follower.getJSONObject("user").getString("name"), follower);
            }
        }

        List<String> followers = Lists.newArrayList();
        List<String> unfollowers = Lists.newArrayList();

        if (cache != null)
        {
            for (String key : newCache.keySet())
            {
                if (!cache.containsKey(key))
                {
                    followers.add(key);
                }
            }

            for (String key : cache.keySet())
            {
                if (!newCache.containsKey(key))
                {
                    unfollowers.add(key);
                }
            }
        }

        this.cache = newCache;
        this.count = newCache.size();

        for (String follower : followers)
        {
            EventBus.instance().post(new TwitchFollowEvent(follower));
        }

        for (String follower : unfollowers)
        {
            EventBus.instance().post(new TwitchUnfollowEvent(follower));
        }
    }

    public void setCache(Map<String, JSONObject> cache)
    {
        this.cache = cache;
    }

    public Map<String, JSONObject> getCache()
    {
        return cache;
    }
}
