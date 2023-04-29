
import { ChatHistory, ChatMessage } from '../ChatHistory';

describe('ChatHistory', () => {
  test('isCompletedByAssistant returns true when the last message is from the assistant', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'How can I help you?' },
    ];
    const chat = new ChatHistory({messages});
    expect(chat.isCompletedByAssistant()).toBe(true);
  });

  test('isCompletedByAssistant returns false when the last message is not from the assistant', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'system', content: 'Please wait for an assistant' },
    ];
    const chat = new ChatHistory({messages});
    expect(chat.isCompletedByAssistant()).toBe(false);
  });

  test('toStringFormat returns the chat history in string format', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'How can I help you?' },
      { role: 'user', content: 'I need help with my account' },
      { role: 'assistant', content: 'Sure, what is your email address?' },
    ];
    const chat = new ChatHistory({messages});
    const expected = `USER\n\nHello\n\n`
        +`ASSISTANT\n\nHow can I help you?\n\n`
        +`USER\n\nI need help with my account\n\n`
        +`ASSISTANT\n\nSure, what is your email address?`;
    expect(chat.toStringFormat()).toEqual(expected);
  });
});
