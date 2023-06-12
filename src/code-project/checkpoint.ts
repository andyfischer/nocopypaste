
import { ProjectContext } from './ProjectContext'
import { spawn } from '../rqe/node/shell'
import Fs from 'fs/promises'
import Path from 'path'
import crypto from 'crypto'


export async function captureCheckpoint(project: ProjectContext) {
    const getModifiedFiles = spawn('git status --porcelain');
    const getCurrentSha = spawn('git rev-list --max-count=1 HEAD');

    const promises = [];
    const everyModifiedFile = [];

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

            console.log('found', { md5sum, blob_id })
        } catch (err) {
            console.error(err);
        }
    }

    getModifiedFiles.output.watchItems(({ line }) => {
        if (line) {
            const status = line.substring(0,2).trim();
            const filename = line.substring(3);

            console.log({status,filename})

            if (status === 'D') {
                // deleted - ignore for now
                return;
            }

            promises.push(captureOneFile(filename));

            //console.log({ status, filename })
        }
    });

    const sha = (await getCurrentSha.output.promiseItems() as any)[0].line;

    await Promise.all(promises);

    const result = project.changelog.run(`
         insert into project_checkpoint (based_on_git_sha) values (?)
    `, sha);

    console.log('captured a checkpoint ', { result, sha })
}
