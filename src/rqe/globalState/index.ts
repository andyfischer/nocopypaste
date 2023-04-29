
import { declaredFunctionToHandler } from '../handler/NativeCallback';
import { Graph } from '../graph'
import { parseHandler } from '../parser/parseHandler'

let _graph: Graph;

export function getGraph() {
    if (!_graph) {
        _graph = new Graph();
    }

    return _graph;
}

export function exposeFunc(decl: string, func: Function) {
    const handler = declaredFunctionToHandler(decl, func);
}
