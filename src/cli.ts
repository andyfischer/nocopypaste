
import Path from 'path'
import colors from 'colors'
import Fs from 'fs/promises'
import { ChatHistory, readChatHistoryFromFile } from './ChatHistory'
import { complete, CompletionReq } from './api'
import { Stream, c_done, c_error, c_item, c_related } from './rqe/Stream'
import { writeUnitTest, summarizeSourceFile, rewriteSourceFile } from './codeTasks'
import { completeChatFile } from './chatTranscriptTasks'
import { runTscAndFix } from './tscFix'

require('source-map-support/register');
require('dotenv').config({ path: Path.resolve(__dirname, '../.env')});

export class TaskHelper {
    progress: Stream

    constructor({progress}: { progress: Stream }) {
        this.progress = progress;
    }

    putError(error: any) {
        this.progress.putError(error);
    }

    finish() {
        this.progress.finish();
    }

    async complete(req: CompletionReq): Promise<ChatHistory> {

        const chat = new ChatHistory(req);

        this.progress.put({ t: 'sending_completion_request' });

        const newMessages = await (complete(req)
            .spyEvents(evt => {
                if (evt.t === c_related && evt.item.t === 'token_cost')
                    this.progress.put(evt.item);
            })
            .promiseItems());

        chat.addFromAPI(newMessages);
        return chat;
    }

    async saveResults(filename: string, contents: string) {
        this.progress.put({ t: 'saving', message: "Saving results to: " + filename });
        await Fs.writeFile(filename, contents);
    }
}

function formatPriceUSD(dollars: number) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
    });
    return formatter.format(dollars);
}

async function main() {
    const taskName = process.argv[2];
    const taskArgs = process.argv.slice(3);

    const progress = new Stream();
    const helper = new TaskHelper({ progress });

    if (!taskName) {
        console.log(
`Supported commands:
  chat <txt filename> - Submit the file as a chat transcript, and save the response.
  writeUnitTest <code filename> - Ask ChatGPT to write a unit test for the file and save the result.
  writeDocs <code filename> - Ask ChatGPT to write Markdown documentation for the file and save it.
  rewrite <code filename> - Ask ChatGPT to fix/rewrite the file. Warning: this will overwrite the file
                            with whatever the chat returns.`);

        return;
    }

    switch (taskName) {
    case 'chat':
        await completeChatFile({ filename: taskArgs[0], helper });
        break;
    case 'writeUnitTest':
    case 'write-unit-test':
        await writeUnitTest({ filename: taskArgs[0], helper });
        break;
    case 'writeDocs':
        await summarizeSourceFile({ filename: taskArgs[0], helper });
        break;
    case 'rewrite':
        await rewriteSourceFile({ filename: taskArgs[0], helper });
        break;
    case 'tsc-fix':
        await runTscAndFix({ cwd: taskArgs[0], helper });
        break;
    default:
        progress.putError({ errorMessage: "unrecognized task name: " + taskName });
        break;
    }

    progress.sendTo(msg => {
        switch (msg.t) {
            case c_item:
                const item = msg.item;
                switch (item.t) {
                    case 'sending_completion_request':
                        console.log("Starting a ChatGPT request..");
                        break;
                    case 'token_cost':
                        console.log("ChatGPT cost estimate: " + formatPriceUSD(item.dollarCostEstimate));
                        break;
                    default:
                        console.log(item.message || item);
                }
                break;
            case c_error:
                console.error(colors.red("error: ") + msg.error.errorMessage);
                break;

        }
    });
}

main()
.catch(e => {
    process.exitCode = -1;
    console.error(e);
});
