
import { it, expect } from '../../test'
import { compileSchema } from '..'
import { checkInvariantsOnTable } from '../checkInvariants'

function* startingSchemas() {
    yield* [{
        name: 'SingleAttr',
        attrs: ['a'],
        funcs: ['get(a)'],
    },{
        name: 'PlainList',
        funcs: [],
    },
    {
        name: 'WithAuto',
        attrs: ['a auto'],
        funcs: ['get(a)'],
    },
    {
        name: 'SingleValue',
        attrs: ['a'],
        funcs: ['get'],
    }];
}

for (const schema of startingSchemas()) {
    it(`table3 invariant test - ${schema.name} - listAll`, () => {
        schema.funcs.push('listAll');
        const table = compileSchema(schema).createTable();

        checkInvariantsOnTable(table);

        expect(table.listAll()).toEqual([])
        checkInvariantsOnTable(table);

        table.insert({ a: 1 });
        expect(table.listAll()).toEqual([{a: 1}])
        checkInvariantsOnTable(table);
    });
}

for (const schema of startingSchemas()) {
    it(`table3 invariant test - ${schema.name} - listen`, () => {
        schema.funcs.push('listen');
        const table = compileSchema(schema).createTable();

        const stream = table.listen();
        let events = [];
        stream.sendTo({ receive(evt) { events.push(evt) }});
        events = [];

        table.insert({ a: 1 });
        expect(events).toEqual([{ t: 'item', item: { a: 1 }}]);
    });
}
