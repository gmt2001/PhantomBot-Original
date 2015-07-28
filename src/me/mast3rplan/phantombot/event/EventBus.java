package me.mast3rplan.phantombot.event;

import com.google.common.collect.Sets;
import java.util.Set;
import java.util.concurrent.Executors;

public class EventBus
{

    private static final EventBus instance = new EventBus();

    public static EventBus instance()
    {
        return instance;
    }
    private com.google.common.eventbus.AsyncEventBus aeventBus = new com.google.common.eventbus.AsyncEventBus(Executors.newFixedThreadPool(8));
    private com.google.common.eventbus.EventBus eventBus = new com.google.common.eventbus.EventBus();
    private Set<Listener> listeners = Sets.newHashSet();

    public void register(Listener listener)
    {
        listeners.add(listener);
        eventBus.register(listener);
        aeventBus.register(listener);
    }

    public void unregister(Listener listener)
    {
        listeners.remove(listener);
        eventBus.unregister(listener);
        aeventBus.unregister(listener);
    }

    public void post(Event event)
    {
        eventBus.post(event);
    }

    public void postAsync(Event event)
    {
        aeventBus.post(event);
    }
}
