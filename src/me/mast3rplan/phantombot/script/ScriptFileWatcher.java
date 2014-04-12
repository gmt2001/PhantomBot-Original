package me.mast3rplan.phantombot.script;

import java.io.File;

public class ScriptFileWatcher implements Runnable {
    private Script script;

    public ScriptFileWatcher(Script script) {
        this.script = script;
    }

    @Override
    public void run() {
        File file = script.getFile();
        long lastUpdate = file.lastModified();
        while(true) {
            try {
                Thread.sleep(100);
                if(file.lastModified() != lastUpdate) {
                    lastUpdate = file.lastModified();
                    script.reload();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
