
import { TaskHelper } from './cli'
import { ChatHistory, readChatHistoryFromFile } from './ChatHistory'

export async function completeChatFile({filename, helper}: { filename: string, helper: TaskHelper }) {
    const chat = await readChatHistoryFromFile(filename);

    if (chat.isCompletedByAssistant()) {
        helper.putError({ errorMessage: "Looks like this chat is already completed by the assistant" });
        return;
    }

    // Feed into AI
    const updatedChat = await helper.complete({
        messages: chat.messages,
        maxTokens: 5000,
    })

    // Save back to file
    await updatedChat.writeToFile(filename);
    helper.progress.put({ t: 'saving', message: "Saving results to: " + filename });
    helper.finish();
}
