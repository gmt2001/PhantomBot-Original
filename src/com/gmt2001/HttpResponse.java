package com.gmt2001;

import com.gmt2001.HttpRequest.RequestType;

/**
 *
 * @author gmt2001
 */
public class HttpResponse
{

    public RequestType type;
    public String url;
    public String post;
    public String content;
    public int httpCode;
    public boolean success;
}
