package me.mast3rplan.phantombot.script;

import com.google.common.collect.Lists;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class ScriptManager {
    private static List<Script> scripts = Lists.newArrayList();

    public static void loadScript(File scriptFile) throws IOException {
        if (scripts.contains(scriptFile)) {
            return;
        }

        Script script = new Script(scriptFile);
        scripts.add(script);
        script.load();
    }
}
