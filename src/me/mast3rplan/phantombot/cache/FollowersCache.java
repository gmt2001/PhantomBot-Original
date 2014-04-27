package me.mast3rplan.phantombot.cache;

import com.gmt2001.TwitchAPIv2;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import java.util.List;
import java.util.Map;
import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.twitch.follower.TwitchFollowEvent;
import me.mast3rplan.phantombot.event.twitch.follower.TwitchUnfollowEvent;
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

    public int getCount(String channel) throws Exception
    {
        JSONObject j = TwitchAPIv2.instance().GetChannelFollows(channel, 1, (int) (1000000 + (System.currentTimeMillis() % 1000000)));

        if (j.getBoolean("_success"))
        {
            if (j.getInt("_http") == 200)
            {
                int i = j.getInt("_total");

                return i;
            } else
            {
                throw new Exception("[HTTPErrorException] HTTP " + j.getInt("status") + " " + j.getString("error") + ". req="
                        + j.getString("_type") + " " + j.getString("_url") + " " + j.getString("_post") + "   message="
                        + j.getString("message"));
            }
        } else
        {
            throw new Exception("[" + j.getString("_exception") + "] " + j.getString("_exceptionMessage"));
        }
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
        try
        {
            Thread.sleep(30 * 1000);
        } catch (InterruptedException e)
        {
            System.out.println("FollowersCache.run>>Failed to initial sleep: [InterruptedException] " + e.getMessage());
        }

        while (true)
        {
            try
            {
                int newCount = getCount(channel);

                if (newCount != count)
                {
                    this.updateCache(newCount);
                }
            } catch (Exception e)
            {
                System.out.println("FollowersCache.run>>Failed to update followers: " + e.getMessage());
            }

            try
            {
                Thread.sleep(30 * 1000);
            } catch (InterruptedException e)
            {
                System.out.println("FollowersCache.run>>Failed to sleep: [InterruptedException] " + e.getMessage());
            }
        }
    }

    private void updateCache(int newCount) throws Exception
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
                    JSONObject j = TwitchAPIv2.instance().GetChannelFollows(channel, 100, offset);

                    if (j.getBoolean("_success"))
                    {
                        if (j.getInt("_http") == 200)
                        {
                            responses.add(j);

                        } else
                        {
                            try
                            {
                                throw new Exception("[HTTPErrorException] HTTP " + j.getInt("status") + " " + j.getString("error") + ". req="
                                        + j.getString("_type") + " " + j.getString("_url") + " " + j.getString("_post") + "   message="
                                        + j.getString("message"));
                            } catch (Exception e)
                            {
                                System.out.println("FollowersCache.updateCache>>Failed to update followers: " + e.getMessage());
                            }
                        }
                    } else
                    {
                        try
                        {
                            throw new Exception("[" + j.getString("_exception") + "] " + j.getString("_exceptionMessage"));
                        } catch (Exception e)
                        {
                            System.out.println("FollowersCache.updateCache>>Failed to update followers: " + e.getMessage());
                        }
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

        for (String key : newCache.keySet())
        {
            if (cache == null || !cache.containsKey(key))
            {
                followers.add(key);
            }
        }

        if (cache != null)
        {
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
