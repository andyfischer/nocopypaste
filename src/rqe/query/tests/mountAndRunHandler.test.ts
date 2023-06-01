
import { it, expect } from '../../testing'
import { Graph } from '../../graph'

it("should be able to mount and run a simple function using a query", () => {
    const graph = new Graph();
    graph.exposeFunc("the_func -> result", () => {
        return { result: 'the result' }
    });

    expect(graph.query("the_func result").collectOneItemSync()).toEqual({the_func: null, result: 'the result'});
});
