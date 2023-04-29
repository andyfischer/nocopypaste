
import { parseChatMessages, parseChatHistory, TextMacros, RoleToMacro, trimEmptyLines } from '../parseChatFormat';
import { ChatRole, ChatMessage, ChatHistory } from '../ChatHistory';

describe('parseChatMessages', () => {
  it('should parse chat messages correctly', () => {
    const s = 'USER\nHello\nASSISTANT\nHow can I help you?';
    const expectedMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'How can I help you?' },
    ];

    const messages = [...parseChatMessages(s)];

    expect(messages).toEqual(expectedMessages);
  });

  it('should handle empty lines correctly', () => {
    const s = 'USER\n\nHello\n\n\nASSISTANT\nHow can I help you?\n\n';
    const expectedMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'How can I help you?' },
    ];

    const messages = [...parseChatMessages(s)];

    expect(messages).toEqual(expectedMessages);
  });

  it('should handle text macros correctly', () => {
    const s = 'USER\nHello\nSYSTEM\nThis is a system message\nASSISTANT\nHow can I help you?';
    const expectedMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'system', content: 'This is a system message' },
      { role: 'assistant', content: 'How can I help you?' },
    ];

    const messages = [...parseChatMessages(s)];

    expect(messages).toEqual(expectedMessages);
  });
});

describe('parseChatHistory', () => {
  it('should parse chat history correctly', () => {
    const s = 'USER\nHello\nASSISTANT\nHow can I help you?';
    const expectedHistory = new ChatHistory({messages:[
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'How can I help you?' },
    ]});

    const history = parseChatHistory(s);

    expect(history).toEqual(expectedHistory);
  });
});

describe('TextMacros', () => {
  it('should have correct values', () => {
    expect(TextMacros.USER).toEqual({ role: 'user' });
    expect(TextMacros.SYSTEM).toEqual({ role: 'system' });
    expect(TextMacros.ASSISTANT).toEqual({ role: 'assistant' });
  });
});

describe('RoleToMacro', () => {
  it('should map roles to macros correctly', () => {
    expect(RoleToMacro.user).toEqual('USER');
    expect(RoleToMacro.system).toEqual('SYSTEM');
    expect(RoleToMacro.assistant).toEqual('ASSISTANT');
  });
});

describe('trimEmptyLines', () => {
  it('should trim empty lines at the front and back', () => {
    const input = ['', '', 'Hello', '', 'World', '', ''];
    const expectedOutput = ['Hello', '', 'World'];

    const output = trimEmptyLines(input);

    expect(output).toEqual(expectedOutput);
  });
});
