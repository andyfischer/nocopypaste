
export type QueryNode = MultistepQuery | Query | QueryTag
export type TagValue = string | QueryNode | null

export class MultistepQuery {
    t = 'multistep'
    steps: Query[]

    constructor(steps: Query[]) {
        this.steps = steps
    }
}

export class Query {
    t = 'query'
    tags: QueryTag[]
    tagsByAttr: Map<string, QueryTag>

    constructor(tags: QueryTag[]) {
        this.tags = tags;
        this._refresh();
    }

    hasAttr(attr: string) {
        return this.tagsByAttr.has(attr);
    }

    getAttr(attr: string) {
        return this.tagsByAttr.get(attr);
    }

    _refresh() {
        this.tagsByAttr = new Map<string, QueryTag>()
        for (const tag of this.tags)
            this.tagsByAttr.set(tag.attr, tag);
    }
}

export class QueryTag {
    t = 'tag'
    attr: string
    value: TagValue
    isValueOptional: boolean
    isAttrOptional: boolean
    isParameter: boolean

    constructor(attr?: string, value?: TagValue) {
        this.t = 'tag'
        if (attr)
            this.attr = attr;

        if (value != null)
            this.value = value || null
    }

    hasValue() {
        return this.value != null;
    }

    isQuery() {
        return (this.value as any)?.t === 'query';
    }
}
