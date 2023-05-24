
import Fs from 'fs/promises'
import { parseChatHistory, RoleToMacro } from './parseChatFormat'
import { complete, CompletionReq, CompletionItem } from './api'

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

    constructor(prompt?: LoosePrompt) {
        this.messages = [];

        if (prompt) {
            this.messages = prompt.messages || [{ role: 'user', content: prompt.prompt }];
        }
    }

    addSystem(content: string) {
        if (this.messages.length > 0) {
            throw new Error("can't add a system message, this chat is non-empty");
        }

        this.messages.push({
            role: 'system',
            content
        });
    }

    addUser(content: string) {
        this.messages.push({
            role: 'user',
            content
        });
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
            lines.push(`# ${RoleToMacro[message.role]} #`);
            lines.push('');
            lines.push(message.content);
            roleTitleNeedsNewline = true;
        }
        return lines.join('\n');
    }

    async writeToFile(filename: string) {
        await Fs.writeFile(filename, this.toStringFormat(), 'utf8');
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

    async fetchCompletion() {
        const req = {
            messages: this.messages,
        }

        const newMessages = await (complete(req)
               /*
            .spyEvents(evt => {
                if (evt.t === c_related && evt.item.t === 'token_cost')
                    this.progress.put(evt.item);
            })*/
            .promiseItems());

        this.addFromAPI(newMessages);
    }
}

export async function readChatHistoryFromFile(filename: string) {
    const text = await Fs.readFile(filename, 'utf8');
    return parseChatHistory(text);
}
