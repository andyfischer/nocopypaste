
import { it, expect } from '../../test'
import { compileSchema } from '..'
import { checkInvariantsOnTable } from '../checkInvariants'

it("supports update on a single value table", () => {
    const table = compileSchema({
        name: 'Test',
        attrs: ['a'],
        funcs: ['get', 'update'],
    }).createTable();

    table.set(1);
    table.update(item => item + 1)

    expect(table.get()).toEqual(2);
});

it("supports update on a list table", () => {
    const table = compileSchema({
        name: 'Test',
        attrs: ['a'],
        funcs: ['listAll', 'update'],
    }).createTable();

    table.insert(1);
    table.insert(2);
    table.insert(3);
    table.update(item => item + 1)

    expect(table.listAll()).toEqual([2,3,4]);
    checkInvariantsOnTable(table);
});

it("supports update on a map table", () => {
    const table = compileSchema({
        name: 'Test',
        attrs: ['a'],
        funcs: ['get(a)', 'listAll', 'update'],
    }).createTable();

    table.insert({a:1});
    table.insert({a:2});
    table.insert({a:3});
    table.update(item => {
        if (item.a === 2)
            item.a = 4;
    });

    expect(table.listAll()).toEqual([{ a: 1 }, { a: 3 }, { a: 4 }]);
    checkInvariantsOnTable(table);
});


it("supports update on a specific attr", () => {
    const table = compileSchema({
        name: 'Test',
        attrs: ['a'],
        funcs: ['listAll', 'update(a)'],
    }).createTable();

    table.insert({ a: 1, count: 0 });
    table.insert({ a: 2, count: 0 });

    table.update_with_a(1, item => item.count++);

    expect(table.listAll()).toEqual([
        {a: 1, count: 1},
        {a: 2, count: 0},
    ]);

    table.update_with_a(2, item => { item.count += 3 });

    expect(table.listAll()).toEqual([
        {a: 1, count: 1},
        {a: 2, count: 3},
    ]);
});

