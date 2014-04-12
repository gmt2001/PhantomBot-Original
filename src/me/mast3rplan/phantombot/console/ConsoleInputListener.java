package me.mast3rplan.phantombot.console;

import me.mast3rplan.phantombot.event.EventBus;
import me.mast3rplan.phantombot.event.console.ConsoleInputEvent;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class ConsoleInputListener extends Thread {

    @Override
    public void run() {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        while (true) {
            try {
                String msg = br.readLine();
                EventBus.instance().post(new ConsoleInputEvent(msg));
                Thread.sleep(10);
            } catch (Exception e) {}
        }
    }
}
