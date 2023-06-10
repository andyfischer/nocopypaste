
import { SqliteDatabase  } from "../rqe/sql"
import Database from 'better-sqlite3'
import Path from 'path'
import { createNestedLoggerStream } from "../rqe/repl/Logger"
import { ChangelogSchema } from './storage'

export interface ProjectContext {
    rootDir: string
    changelog: SqliteDatabase
}

export function loadProject(rootDir: string): ProjectContext {

    const changelog = new SqliteDatabase(new Database(Path.join(rootDir, 'changelog.db')), createNestedLoggerStream('changelog.db'))

    changelog.migrateToSchema(ChangelogSchema);

    return {
        rootDir,
        changelog
    }
}
