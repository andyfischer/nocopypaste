import { it, expect } from '../../testing'
import { compileSchema } from '..'
import { Stream } from '../../Stream'
import { streamToTable } from '../streamToTable'

it("streamToTable supports streaming data into a Table", () => {
    const table = compileSchema({
        name: 'StreamToTableTest',
        funcs: ['get(a)', 'listAll', 'getStatus'],
    }).createTable();

    const input = new Stream();

    input.put({ a: 123 });
    input.put({ a: 456 });
    input.put({ a: 789 });
    input.done();

    streamToTable({ input, table })

    expect(table.listAll()).toEqual([
        { a: 123 },
        { a: 456 },
        { a: 789 },
    ])
});

it("streamToTable isLoading=true during the open stream", () => {
    const table = compileSchema({
        name: 'StreamToTableTest',
        funcs: ['get(a)', 'listAll', 'getStatus'],
    }).createTable();

    const input = new Stream();
    streamToTable({ input, table })

    expect(table.isLoading()).toEqual(true);

    input.put({ a: 123 });
    input.put({ a: 456 });
    input.put({ a: 789 });

    expect(table.isLoading()).toEqual(true);

    input.done();

    expect(table.isLoading()).toEqual(false);
});

it("streamToTable - afterUpdate is triggered after an update", () => {
    let calledAfterUpdate = false;

    const table = compileSchema({
        name: 'StreamToTableTest',
        funcs: ['get(a)', 'listAll', 'getStatus'],
    }).createTable();

    const input = new Stream();
    streamToTable({
        input,
        table,
        afterUpdate() { calledAfterUpdate = true }
    });

    expect(calledAfterUpdate).toEqual(false);

    input.put({ a: 123 });
    input.put({ a: 456 });
    input.put({ a: 789 });

    expect(calledAfterUpdate).toEqual(true);
    calledAfterUpdate = false;

    input.done();

    expect(calledAfterUpdate).toEqual(true);
});
