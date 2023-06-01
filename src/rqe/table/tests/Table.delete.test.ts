
import { it, expect } from '../../testing'
import { compileSchema } from '..'
import { checkInvariantsOnTable } from '../checkInvariants'

it("table3 supports delete", () => {
    const table = compileSchema({
        name: 'Test',
        attrs: ['a'],
        funcs: ['listAll', 'delete(a)'],
    }).createTable();

    table.insert({a: 1});
    table.insert({a: 2});
    expect(table.listAll()).toEqual([{a:1},{a:2}]);
    checkInvariantsOnTable(table);

    table.delete_with_a(1);
    expect(table.listAll()).toEqual([{a:2}]);
    checkInvariantsOnTable(table);
});

it("delete works correctly across multiple indexes", () => {
    const table = compileSchema({
        name: 'Test',
        attrs: ['a','b'],
        funcs: ['listAll', 'get(a)','get(b)', 'list(group)','delete(a)', 'delete(group)'],
    }).createTable();

    table.insert({a: 1, b: 10, group: 'one'});
    table.insert({a: 2, b: 20, group: 'one'});
    table.insert({a: 3, b: 30, group: 'two'});
    table.insert({a: 4, b: 40, group: 'two'});

    expect(table.listAll()).toEqual([
        {a: 1, b: 10, group: 'one'},
        {a: 2, b: 20, group: 'one'},
        {a: 3, b: 30, group: 'two'},
        {a: 4, b: 40, group: 'two'},
    ]);
    checkInvariantsOnTable(table);

    table.delete_with_group('one');

    expect(table.listAll()).toEqual([
        {a: 3, b: 30, group: 'two'},
        {a: 4, b: 40, group: 'two'},
    ]);
    expect(table.get_with_a(1)).toBeFalsy();
    expect(table.get_with_a(2)).toBeFalsy();
    expect(table.get_with_a(3)).toEqual({a: 3, b: 30, group: 'two'});
    expect(table.list_with_group('two')).toEqual([
        {a: 3, b: 30, group: 'two'},
        {a: 4, b: 40, group: 'two'},
    ]);
    checkInvariantsOnTable(table);

    table.delete_with_a(4);

    expect(table.listAll()).toEqual([
        {a: 3, b: 30, group: 'two'},
    ]);
    expect(table.get_with_a(3)).toEqual({a: 3, b: 30, group: 'two'});
    expect(table.get_with_a(4)).toBeFalsy();
    expect(table.list_with_group('two')).toEqual([
        {a: 3, b: 30, group: 'two'},
    ]);
    checkInvariantsOnTable(table);
});
