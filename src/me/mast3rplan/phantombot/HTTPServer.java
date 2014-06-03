/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package me.mast3rplan.phantombot;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Date;
import java.util.Scanner;
import java.util.TreeMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author jesse
 */
public class HTTPServer extends Thread {
    
    int port;
    ServerSocket socket;
    Boolean dorun = true;
    
    HTTPServer (int p) {
        port = p;
    }
    
    @Override
    public void run () {
        String webhome = "./web";
        
        try {
            socket = new ServerSocket(port);
        } catch (IOException e) {
            System.err.println("Could not start HTTP server: " + e);
            return;
        }
        
        System.out.println("HTTP server accepting connections on port " + port);
        
        while (dorun) {
            try {
                
                Socket conn = socket.accept ();
                Scanner scan = new Scanner (conn.getInputStream ());
                PrintStream out = new PrintStream (conn.getOutputStream ());
                
                if (!scan.hasNextLine ()) {
                    throw new IOException ();
                }
                
                String [] request = scan.nextLine ().split(" ");
                TreeMap <String, String> args = new TreeMap ();
                while (scan.hasNextLine ()) {
                    String line = scan.nextLine ();
                    String [] arg = line.split (":");
                    if (arg.length == 2) {
                        args.put (arg [0].trim (), arg [1].trim ());
                    }
                    if (line.isEmpty()) break;
                }
                
                if (request.length == 3) {
                    if (request [0].equals ("GET")) {
                        if (false) {
                            //TODO: handle twitch not connected
                        } else {
                            File target = null;
                            if (request [1].startsWith ("/")) {
                                target = new File (webhome + request [1]);
                            } else {
                                target = new File (webhome + "/" + request [1]);
                            }
                            if (target.isDirectory ()) {
                                if (request [1].endsWith ("/")) {
                                    target = new File (webhome + "/" + request [1] + "index.html");
                                } else {
                                    target = new File (webhome + "/" + request [1] + "/" + "index.html");
                                }
                            }
                            String content = IOUtils.toString (new FileInputStream (target));
                            out.print ("HTTP/1.0 200 OK\n" +
                                    "ContentType: " + inferContentType (target.getPath ()) + "\n" +
                                    "Date: " + new Date () + "\n" +
                                    "Server: basic HTTP server\n" +
                                    "Content-Length: " + content.length () + "\n" +
                                    "\n" +
                                    content + "\n");
                        }
                    }
                }
                
                out.flush ();
                if (conn != null)
                {
                    conn.close ();
                }
                
            } catch (IOException ex) {
                Logger.getLogger(HTTPServer.class.getName()).log(Level.SEVERE, null, ex);
            }
            
        }
    }
    
    public void dispose() {
        try
        {
            dorun = false;
            socket.close();
        } catch (IOException ex)
        {
            Logger.getLogger(HTTPServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    private static String inferContentType (String path) {
        if (path.endsWith (".html") || path.endsWith (".htm")) {
            return "text/html";
        } else if (path.endsWith (".css")) {
            return "text/css";
        }
        return "text/text";
    }
    
}
