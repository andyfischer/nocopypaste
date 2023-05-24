
import { ChatRole, ChatMessage, ChatHistory } from './ChatHistory'

export const TextMacros = {
    USER: {role:'user'},
    SYSTEM: {role:'system'},
    ASSISTANT: {role:'assistant'},
}

export const RoleToMacro = {
    user: 'USER',
    system: 'SYSTEM',
    assistant: 'ASSISTANT',
}

export function trimEmptyLines(lines: string[]) {
  while (lines.length > 0 && lines[0] === '') {
    lines.shift();
  }
  while (lines.length > 0 && (lines[lines.length - 1] === '')) {
    lines.pop();
  }
  return lines;
}

export function* parseChatMessages(s: string) {
    const lines = s.split('\n');
    let currentRole: ChatRole = 'user';
    let currentContentLines = [];

    function outputMessage() {
        currentContentLines = trimEmptyLines(currentContentLines);

        if (currentContentLines.length === 0)
            return null;

        const item: ChatMessage = {
            role: currentRole,
            content: currentContentLines.join('\n'),
        }

        currentContentLines = [];
        return item;
    }

    for (let line of lines) {

        const lineWithoutFormating = line.replaceAll('#','').trim();

        if (TextMacros[lineWithoutFormating]) {
            const message = outputMessage();
            if (message)
                yield message;

            currentRole = TextMacros[lineWithoutFormating].role;
            continue;
        }

        currentContentLines.push(line);
    }

    const message = outputMessage();
    if (message)
        yield message;
}

export function parseChatHistory(s: string) {
    let messages: ChatMessage[] = []
    for (const message of parseChatMessages(s))
        messages.push(message);
    return new ChatHistory({messages})
}
