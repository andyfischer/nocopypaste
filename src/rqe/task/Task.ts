
import { Query } from '../query'
import { Stream } from '../Stream'

type QueryParameters = Map<string,any>

export class Task {
    input: Stream
    output: Stream

    query: Query
    queryParameters: QueryParameters

    // Query accessors
    hasAttr(attr: string) {
        return this.query.hasAttr(attr);
    }

    hasValue(attr: string) {
        const tag = this.query.getAttr(attr);
        if (!tag)
            return false;

        return this.queryParameters.has(attr) || tag.hasValue();
    }

    getValue(attr: string) {
        const tag = this.query.getAttr(attr);
        if (!tag)
            return null;

        if (this.queryParameters.has(attr))
            return this.queryParameters.get(attr);

        return tag.value;
    }

}
