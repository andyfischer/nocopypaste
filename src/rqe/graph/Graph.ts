
import { parseQuery } from '../parser'
import { Query } from '../query'
import { Stream } from '../Stream'

type QueryLike = string | Query

export interface GraphLike {
    query(queryLike: QueryLike): Stream
}

export function toQuery(queryLike: QueryLike): Query {
    if (typeof queryLike === 'string') {
        const parsed = parseQuery(queryLike);

        if (parsed.t === 'parseError')
            throw parsed;

        return parsed as Query;
    }

    return queryLike
}

export class Graph implements GraphLike {
    query(queryLike: QueryLike): Stream {
        return new Stream()
    }
}
