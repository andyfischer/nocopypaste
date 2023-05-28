
import Fs from 'fs/promises'
import Path from 'path'
import { Stream } from './rqe'
import { fileExists } from './rqe/node/fs'

interface FileInfo {
    addReason: 'explicit' | 'defaultContext'
}

export class CodeTask {
    files = new Map<string, FileInfo>()

    progress: Stream

    constructor(progress: Stream) {
        this.progress = progress;
    }

    addFile(filename: string, info: FileInfo) {
        filename = Path.resolve(filename);

        if (!this.files.has(filename)) {
            this.files.set(filename, info);
        }

        this.progress.put({ t: 'loading_source_file', filename, addReason: info.addReason});
    }

    async includeFileWithContext(filename: string) {
        if (!await fileExists(filename))
            throw new Error("file not found: " + filename);

        this.addFile(filename, { addReason: 'explicit'});

        const contextFiles = await findDefaultContextFiles(filename);

        for (const filename of contextFiles)
            this.addFile(filename, { addReason: 'defaultContext' })
    }

    async getSourceForPrompt() {
        let prompt: string[] = [];

        for (const [filename,info] of this.files.entries()) {
            if (info.addReason === 'defaultContext')
                prompt.push(`For context here is the source code for the related file ${Path.basename(filename)}`);

            prompt.push(await Fs.readFile(filename, 'utf8'));
        }

        return prompt.join('\n\n');
    }
}

async function findDefaultContextFiles(filename: string) {
    const files: string[] = [];

    if (filename.endsWith('.test.ts')) {
        const nonTestFilename = 
            Path.join(Path.dirname(filename), '..',
                Path.basename(filename).replace('.test.ts', '.ts'));

        if (await fileExists(nonTestFilename))
            files.push(nonTestFilename);
    }

    return files;
}

