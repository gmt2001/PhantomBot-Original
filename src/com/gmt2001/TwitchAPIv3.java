package com.gmt2001;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.SocketTimeoutException;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;
import org.apache.commons.io.IOUtils;
import org.json.JSONObject;

/**
 * Communicates with Twitch Kraken server using the version 3 API
 * @author gmt2001
 */
public class TwitchAPIv3
{

    private static final TwitchAPIv3 instance = new TwitchAPIv3();
    private static final String base_url = "https://api.twitch.tv/kraken";
    private static final String header_accept = "application/vnd.twitchtv.v3+json";
    private static final int timeout = 5 * 1000;
    private String clientid = "";

    private enum request_type
    {

        GET, POST, PUT, DELETE
    };

    public static TwitchAPIv3 instance()
    {
        return instance;
    }

    private JSONObject GetData(request_type type, String url)
    {
        return GetData(type, url, "");
    }

    private JSONObject GetData(request_type type, String url, String post)
    {
        return GetData(type, url, post, "");
    }

    private JSONObject GetData(request_type type, String url, String post, String oauth)
    {
        JSONObject j = new JSONObject();

        try
        {
            URL u = new URL(url);
            HttpsURLConnection c = (HttpsURLConnection) u.openConnection();

            c.addRequestProperty("Accept", header_accept);

            if (!clientid.isEmpty())
            {
                c.addRequestProperty("Client-ID", clientid);
            }

            if (!oauth.isEmpty())
            {
                c.addRequestProperty("Authorization", "OAuth " + oauth);
            }

            c.setRequestMethod(type.name());

            c.setUseCaches(false);
            c.setDefaultUseCaches(false);
            c.setConnectTimeout(timeout);

            c.connect();

            if (!post.isEmpty())
            {
                IOUtils.write(post, c.getOutputStream());
            }

            String content;
            
            if (c.getResponseCode() == 200)
            {
                content = IOUtils.toString(c.getInputStream(), c.getContentEncoding());
            } else {
                content = IOUtils.toString(c.getErrorStream(), c.getContentEncoding());
            }

            j = new JSONObject(content);
            j.put("_success", true);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", c.getResponseCode());
            j.put("_exception", "");
            j.put("_exceptionMessage", "");
        } catch (MalformedURLException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "MalformedURLException");
            j.put("_exceptionMessage", ex.getMessage());
        } catch (SocketTimeoutException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "SocketTimeoutException");
            j.put("_exceptionMessage", ex.getMessage());
        } catch (IOException ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "IOException");
            j.put("_exceptionMessage", ex.getMessage());
        } catch (Exception ex)
        {
            j.put("_success", false);
            j.put("_type", type.name());
            j.put("_url", url);
            j.put("_post", post);
            j.put("_http", 0);
            j.put("_exception", "Exception [" + ex.getClass().getName() + "]");
            j.put("_exceptionMessage", ex.getMessage());
        }

        return j;
    }
    
    /**
     * Sets the Twitch API Client-ID header
     * @param clientid 
     */
    public void SetClientID(String clientid)
    {
        this.clientid = clientid;
    }

    /**
     * Gets a channel object
     *
     * @param channel
     * @return
     */
    public JSONObject GetChannel(String channel)
    {
        return GetData(request_type.GET, base_url + "/channels/" + channel);
    }

    /**
     * Updates the status and game of a channel
     *
     * @param channel
     * @param oauth
     * @param status
     * @param game
     * @param delay -1 to not update
     * @return
     */
    public JSONObject UpdateChannel(String channel, String oauth, String status, String game, int delay)
    {
        JSONObject j = new JSONObject();
        JSONObject c = new JSONObject();

        if (!status.isEmpty())
        {
            c.put("status", status);
        }

        if (!game.isEmpty())
        {
            c.put("game", game);
        }

        if (delay >= 0)
        {
            c.put("delay", delay);
        }

        j.put("channel", c);

        return GetData(request_type.PUT, base_url + "/channels/" + channel, j.toString(), oauth);
    }

    /**
     * Gets an object listing the users following a channel
     *
     * @param channel
     * @param limit between 1 and 100
     * @param offset
     * @param ascending
     * @return
     */
    public JSONObject GetChannelFollows(String channel, int limit, int offset, boolean ascending)
    {
        limit = Math.max(0, Math.min(limit, 100));
        offset = Math.max(0, offset);
        
        String dir = "desc";
        
        if (ascending)
        {
            dir = "asc";
        }

        return GetData(request_type.GET, base_url + "/channels/" + channel + "/follows?limit=" + limit + "&offset=" + offset + "&direction=" + dir);
    }

    /**
     * Gets a stream object
     *
     * @param channel
     * @return
     */
    public JSONObject GetStream(String channel)
    {
        return GetData(request_type.GET, base_url + "/streams/" + channel);
    }

    /**
     * Gets a user object
     *
     * @param user
     * @return
     */
    public JSONObject GetUser(String user)
    {
        return GetData(request_type.GET, base_url + "/users/" + user);
    }
}
