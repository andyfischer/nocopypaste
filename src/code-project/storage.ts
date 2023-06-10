
import { DatabaseSchema } from '../rqe/sql'

export const ChangelogSchema: DatabaseSchema = {
    name: 'Changelog',
    statements: [
        `create table project_checkpoint (
            id integer primary key autoincrement,
            based_on_git_sha text not null
        )`,
        `create table project_checkpoint_modified_file (
            checkpoint_id integer,
            relpath text not null,
            foreign key (checkpoint_id) references project_checkpoint(id)
        )`,
        `create table blob (
            id integer primary key autoincrement,
            hash text not null,
            contents text not null
        )`,
    ],
}
