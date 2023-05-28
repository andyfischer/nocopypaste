
import Fs from 'fs/promises'

export class CodeTask {
    files = new Map<string, any>()

    async includeFileWithContext(filename: string) {
        this.files.set(filename, {})

        const contextFiles = await findDefaultContextFiles(filename);

        for (const file of contextFiles)
            this.files.set(filename, {});
    }
}

async function findDefaultContextFiles(filename: string) {
    const files: string = [];

    // TODO
    //
    // If the file has a name like "SomeFile.test.ts" then look for a file in the
    // above directory called SomeFile.ts. If it exists then add it to files.
}
