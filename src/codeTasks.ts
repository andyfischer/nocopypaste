
import Fs from 'fs/promises'
import Path from 'path';
import { Stream } from './rqe'
import { fileExists } from './rqe/node/fs'
import { TaskHelper } from './cli';

async function findTestDirectory(baseDir: string) {
    for (const relativeDir of ['tests','__tests__']) {
        const testDir = Path.join(baseDir, relativeDir);
        if (await fileExists(testDir))
            return testDir;
    }

    throw new Error("No test directory found at: " + baseDir);
}

/*
  writeUnitTest

  Send the entire code file to ChatGPT and generate a Jest unit test, and save it as a file to __tests__/<filename>.test.ts
*/
export async function writeUnitTest({filename, helper}: {filename: string, helper: TaskHelper}) {
    // Find the test directory
    const testDirectory = await findTestDirectory(Path.dirname(filename));
    const testFilename = Path.join(testDirectory, Path.basename(filename, Path.extname(filename)) + '.test.ts');

    // Error if the file already exists
    if (await fileExists(testFilename)) {
        throw new Error(`Test file ${testFilename} already exists`);
    }

    const chat = await helper.complete({
        prompt: `Add a TypeScript unit test using the Jest framework for the following code. The filename is ${filename}. `
            +`The code is: \n\n`
            +(await Fs.readFile(filename, 'utf8'))
    });

    helper.progress.put({ t: 'saving', message: "Saving results to: " + testFilename });
    await Fs.writeFile(testFilename, chat.getAnswer());
    helper.finish();
}

export async function summarizeSourceFile({ filename, helper }: { filename: string, helper: TaskHelper }) {
    const summaryFilename = filename.replace(Path.extname(filename), '.docs.md');

    const chat = await helper.complete({
        prompt: `Write a summary for the following code file:\n\n`
            +(await Fs.readFile(filename, 'utf8'))
            +`\n\nThe summary should use Markdown syntax and be in the following format:`
    +`
     # SUMMARY #   

     A short summary of the responsibilities and implementation of this file. One or two sentences.
     Some examples of this section are: "Performs xxx task", or "Implements xxx", or "Handles xxx".

     # RESPONSIBILITIES #

      * A list of the responsibilities of this code. One per line.

     # API #

     A list of all public exports including functions and classes. Each item should have this format:

     ### The name of export such as: "function()" or "class Class" or "const Name" ###

     \`The Typescript type declaration of the export such as: "function theFunction(input: InputType): OutputType" , or "class Class(constructor: Type)" \`
     
     A description of this exported item.

     # USAGE EXAMPLE #

     (Note to assistant: This section is optional and can be omitted if it's not helpful)

     An example snippet of code that uses the functions or classes provided by this file.
     
     # IMPLEMENTATION DETAILS #

     (Note to assistant: This section is optional and can be omitted if it's not helpful)

      * Notes describing any additional helpful details, or anything interesting or unusual about the implementation of this code. One per line.
          
    `
    });

    helper.progress.put({ t: 'saving', message: "Saving results to: " + summaryFilename });
    await Fs.writeFile(summaryFilename, chat.getAnswer());
    helper.finish();
}

/*
   rewriteSourceFile

   Send the entire file to ChatGPT with instructions to fix it, especially replacing any
   sections marked 'TODO'. Overwrite the file with the response.
*/
export async function rewriteSourceFile({ filename, helper }: { filename: string, helper: TaskHelper }) {
    const chat = await helper.complete({
        prompt: `Fix or complete the following code file. Replace any sections marked TODO `
            +`your implementation code.\n\n`
            +(await Fs.readFile(filename, 'utf8'))
    });

    await helper.saveResults(filename, chat.getAnswer());
    helper.finish();
}
