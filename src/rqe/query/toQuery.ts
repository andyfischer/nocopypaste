
import { Query, QueryNode } from './Query'
import { parseQuery } from '../parser/parseQuery'

export type QueryLike = string | Query

export function toQuery(queryLike: QueryLike): QueryNode {
    if ((queryLike as Query)?.t === 'query')
        return queryLike as Query;

    const parseResult = parseQuery(queryLike as string);

    if (parseResult.t === 'parseError')
        throw parseResult;

    return parseResult;
}
