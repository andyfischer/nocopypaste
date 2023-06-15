
import Database from 'better-sqlite3'
import { Schema, Table } from '../table'
import { parseSql } from './parser'
import { getGeneratedMigration, runDatabaseSloppynessCheck, MigrationOptions } from './migration'
import { DatabaseSchema } from './DatabaseSchema'
import { Stream } from '../Stream'

function paramsToArray(params) {
    if (params === undefined)
        return [];

    if (Array.isArray(params))
        return params;

    return [params];
}

export class SqliteDatabase {
    db: Database
    logs?: Stream

    constructor(db: Database, logs: Stream) {
        this.db = db;
        this.logs = logs;
    }

    // Return first matching item
    get(sql: string, params?: any): any {
        const statement = this.db.prepare(sql);
        params = paramsToArray(params);
        return statement.get.apply(statement, params);
    }

    // Return a list of items
    list(sql: string, params?: any): any[] {
        const statement = this.db.prepare(sql);
        params = paramsToArray(params);
        return statement.all.apply(statement, params);
    }

    *each(sql: string, params?: any) {
        const statement = this.db.prepare(sql);
        params = paramsToArray(params);
        yield* statement.iterate.apply(statement, params);
    }

    run(sql: string, params?: any): { changes: number, lastInsertRowid: number } {
        const statement = this.db.prepare(sql);
        params = paramsToArray(params);
        return statement.run.apply(statement, params);
    }

    // sql: looks like "from table where ..."
    exists(sql: string, params?: any) {
        const selecting = `exists(select 1 ${sql})`;
        const result = this.get(`select ` + selecting, params);
        return result[selecting] == 1;
    }

    migrateCreateStatement(createStatement: string, options: MigrationOptions) {
        const statement = parseSql(createStatement);
        // console.log(statement)
        if (statement.t == 'create_table') {
            const existingTable: any = this.get(`select sql from sqlite_schema where name = ?`, statement.name);
            
            if (!existingTable) {
                // Table doesn't exist yet, create it.
                this.run(createStatement);
                return;
            }

            const migration = getGeneratedMigration(existingTable.sql, statement);

            for (const migrationStatement of migration.statements) {
                if (migrationStatement.isDestructive && !options.includeDestructive) {
                    this.warn(`not automatically performing destructive migration: ${migrationStatement.sql}`);
                    continue;
                }

                this.info(`migrating table ${statement.name}: ${migrationStatement.sql}`)
                this.run(migrationStatement.sql);
            }

            for (const warning of migration.warnings)
                this.warn(`table ${statement.name} had migration warning: ${warning}`);

        } else if (statement.t === 'create_index') {
            const existingIndex: any = this.get(`select sql from sqlite_schema where name = ?`, statement.index_name);

            if (!existingIndex) {
                // Index doesn't exist yet, create it.
                this.run(createStatement);
                return;
            }

            // TODO: Check if the index needs to be replaced/updated?

            return;
        } else {
            throw new Error("Unsupported statement in migrate(). Only supporting 'create table' right now");
        }
    }

    setupInitialData(statement: string) {
        const parsed = parseSql(statement);

        if (parsed.t !== 'insert_item') {
            console.log(`expected insert statement in .initialData, found: ` + statement);
            return;
        }

        const getExistingCount = this.get(`select count(*) from ${parsed.table_name}`);
        const count = getExistingCount['count(*)'];

        if (count === 0) {
            // Run the insert
            this.run(statement);
        }
    }

    migrateToSchema(schema: DatabaseSchema, options: MigrationOptions = {}) {
        for (const statement of schema.statements) {
            this.migrateCreateStatement(statement, options);
        }

        for (const statement of schema.initialData || []) {
            this.setupInitialData(statement);
        }

        // this.info('finished migrating to schema: ' + schema.name)
    }

    runDatabaseSloppynessCheck(schema: DatabaseSchema) {
        runDatabaseSloppynessCheck(this, schema);
    }

    putLog(event: any) {
        if (this.logs) {
            this.logs.put(event);
        } else {
            console.log(event);
        }
    }

    warn(msg: any) {
        this.putLog({ level: 'warn', msg });
    }
    info(msg: any) {
        this.putLog({ level: 'info', msg });
    }
}
