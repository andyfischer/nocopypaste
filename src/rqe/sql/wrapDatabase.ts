
import Database from 'better-sqlite3'
import { Schema, Table } from '../table'

/*
interface WrappedTable {
    insert(item
}
*/


export class SqliteDatabase {
    db: Database

    constructor(db: Database) {
        this.db = db;
    }

    // Return first matching item
    get(sql: string, params?: any): any {
        const statement = this.db.prepare(sql);
        return statement.get(params);
    }

    // Return a list of items
    list(sql: string, params?: any): any[] {
        const statement = this.db.prepare(sql);
        return statement.list(params);
    }

    *each(sql: string, params?: any) {
        const statement = this.db.prepare(sql);
        yield* statement.iterate(params);
    }

    run(sql: string, params?: any) {
        const statement = this.db.prepare(sql);
        return statement.run(params);
    }
}

export function wrapDatabase(db: Database) {
    return new SqliteDatabase(db);
}
