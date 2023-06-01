import { it, expect } from '../testing'
import { Stream } from '../Stream'

it('collectEventsSync works correctly on a successfully closed stream', () => {
    const stream = new Stream();
    stream.put(1);
    stream.put(2);
    stream.done();
    stream.close();
    const events = stream.collectEventsSync();
    expect(events).toEqual([
        { t: 'item', item: 1 },
        { t: 'item', item: 2 },
        { t: 'items_done' },
    ]);
});

it('collectEventsSync works correctly on an errored stream', () => {
    const stream = new Stream();
    stream.put(1);
    stream.putError({ errorMessage: 'Oops!' });
    stream.close();
    const events = stream.collectEventsSync();
    expect(events).toEqual([
        { t: 'item', item: 1 },
        { t: 'error', error: { errorMessage: 'Oops!'} },
        { t: 'close' },
    ]);
});
