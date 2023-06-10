
import { ProjectContext } from './ProjectContext'
import { spawn } from '../rqe/node/shell'
import Fs from 'fs/promises'
import Path from 'path'
import crypto from 'crypto'


export async function captureCheckpoint(project: ProjectContext) {
    const getModifiedFiles = spawn('git status --porcelain');
    const getCurrentSha = spawn('git rev-list --max-count=1 HEAD');

    const promises = [];

    async function captureOneFile(filename: string) {
        try {
            const resolvedFilename = Path.resolve(project.rootDir, filename);
            const contents = await Fs.readFile(filename, 'utf8');
            const md5sum = crypto.createHash('md5').update(contents).digest('hex');
            if (!project.changelog.exists(`from blob where hash = ?`, [md5sum])) {
                project.changelog.run('insert into blob (hash, contents) values (?,?)',
                                         [md5sum, contents]);
            }
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
