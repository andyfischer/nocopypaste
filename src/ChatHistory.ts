
import Fs from 'fs/promises'
import { parseChatHistory, RoleToMacro } from './parseChatFormat'
import { CompletionItem } from './api'

export type ChatRole = 'user' | 'system' | 'assistant'

export interface ChatMessage {
    role: ChatRole
    content: string
}

export interface LoosePrompt {
    messages?: ChatMessage[]
    prompt?: string
}

export class ChatHistory {
    messages: ChatMessage[]

    constructor(prompt: LoosePrompt) {
        this.messages = prompt.messages || [{ role: 'user', content: prompt.prompt }];
    }

    isCompletedByAssistant() {
        return this.messages.length > 0 && this.messages[this.messages.length-1].role === 'assistant';
    }

    toStringFormat() {
        let lines: string[] = [];
        let roleTitleNeedsNewline = false;

        for (const message of this.messages) {
            if (roleTitleNeedsNewline)
                lines.push('');
            lines.push(RoleToMacro[message.role]);
            lines.push('');
            lines.push(message.content);
            roleTitleNeedsNewline = true;
        }
        return lines.join('\n');
    }

    async writeToFile(filename: string) {
        await Fs.writeFile(filename, this.toStringFormat());
    }

    addFromAPI(items: CompletionItem[]) {
        let currentRole: ChatRole = 'user';
        let currentText: string[] = [];

        const completeCurrentMessage = () => {
            if (currentText.length === 0)
                return;
            this.messages.push({ role: currentRole, content: currentText.join('') });
            currentText = [];
        }

        for (const item of items) {
            const delta = item?.choices?.[0]?.delta;

            if (!delta)
                continue;

            if (delta.role) {
                completeCurrentMessage();
                currentRole = delta.role as ChatRole;
            }

            if (delta.content)
                currentText.push(delta.content);
        }

        completeCurrentMessage();
    }

    getAnswer() {
        if (!this.isCompletedByAssistant())
            throw new Error('Chat is not completed by assistant');

        return this.messages[this.messages.length-1].content;
    }
}

export async function readChatHistoryFromFile(filename: string) {
    const text = await Fs.readFile(filename, 'utf8');
    return parseChatHistory(text);
}
