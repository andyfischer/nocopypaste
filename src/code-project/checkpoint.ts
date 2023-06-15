
import { ProjectContext } from './ProjectContext'
import { spawn } from '../rqe/node/shell'
import { newTrigger, c_done, c_close, c_item, c_error } from '../rqe'
import Fs from 'fs/promises'
import Path from 'path'
import crypto from 'crypto'

export async function captureCheckpoint(project: ProjectContext) {
    const getModifiedFiles = spawn('git status --porcelain');
    const getCurrentSha = spawn('git rev-list --max-count=1 HEAD');

    const captures = [];
    const capturedFiles: {relpath: string, blob_id:string}[] = [];
    const getFilesDone = newTrigger();

    function shouldIgnoreFile(filename: string) {
        if (filename === 'changelog.db')
            return true;

        return false;
    }

    async function captureOneFile(filename: string) {
        try {
            const resolvedFilename = Path.resolve(project.rootDir, filename);
            const contents = await Fs.readFile(filename, 'utf8');
            const md5sum = crypto.createHash('md5').update(contents).digest('hex');

            let blob_id;

            if (!project.changelog.exists(`from blob where hash = ?`, [md5sum])) {
                blob_id = project.changelog.run('insert into blob (hash, contents) values (?,?)',
                                         [md5sum, contents])
                    .lastInsertRowid;
            } else {
                blob_id = project.changelog.get(`select id from blob where hash = ?`, [md5sum]).id;
            }

            capturedFiles.push({ relpath: filename, blob_id })

            console.log(`captured ${filename} as blob #${blob_id}, hash = ${md5sum}`);
        } catch (err) {
            console.error(err);
        }
    }

    getModifiedFiles.output.sendTo((evt) => {
        switch (evt.t) {
        case c_item:
            if (evt.item.line) {
                const { line } = evt.item;
                const status = line.substring(0,2).trim();
                const filename = line.substring(3);

                if (status === 'D') {
                    // deleted - ignore for now
                    return;
                }

                if (shouldIgnoreFile(filename))
                    return;

                captures.push(captureOneFile(filename));

                //console.log({ status, filename })
            }
            break;
        case c_done:
        case c_close:
            getFilesDone.finish();
            break;
        case c_error:
            getFilesDone.error(evt.error);
            break;
        }
    });

    const sha = (await getCurrentSha.output.promiseItems() as any)[0].line;

    await getFilesDone;
    await Promise.all(captures);

    const result = project.changelog.run(`
         insert into project_checkpoint (based_on_git_sha) values (?)
    `, sha);

    const checkpoint_id = result.lastInsertRowid;

    for (const { relpath, blob_id } of capturedFiles) {
        project.changelog.run(`
                  insert into project_checkpoint_modified_file (checkpoint_id, relpath, blob_id) values (?,?,?)
                              `, [checkpoint_id, relpath, blob_id])
    }

    console.log(`captured checkpoint #${checkpoint_id} based on git sha: ${sha.substring(0,10)}`)
}

