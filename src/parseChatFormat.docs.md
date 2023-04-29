# SUMMARY #

This code file provides functions for parsing chat messages and generating a chat history object.

# RESPONSIBILITIES #

- Parse chat messages from a string and generate an array of message objects.
- Generate a chat history object from a string of chat messages.

# API #

### TextMacros ###

`{USER: {role: 'user'}; SYSTEM: {role: 'system'}; ASSISTANT: {role: 'assistant'}}`

An object containing text macros for different chat roles.

### RoleToMacro ###

`{user: 'USER'; system: 'SYSTEM'; assistant: 'ASSISTANT'}`

An object mapping chat roles to their corresponding text macros.

### trimEmptyLines(lines: string[]) ###

`function trimEmptyLines(lines: string[]): string[]`

Removes empty lines from an array of strings and returns the trimmed array.

### parseChatMessages(s: string) ###

`function* parseChatMessages(s: string): Generator<ChatMessage, void, unknown>`

Parses chat messages from a string and yields a generator of ChatMessage objects.

### parseChatHistory(s: string) ###

`function parseChatHistory(s: string): ChatHistory`

Generates a ChatHistory object from a string of chat messages.

# USAGE EXAMPLE #

```typescript
import { parseChatHistory } from './chat';
const chatString = "USER\nHello\nSYSTEM\nHi there!\nUSER\nHow are you?";
const chatHistory = parseChatHistory(chatString);
console.log(chatHistory.getMessages());
```

# MORE IMPLEMENTATION DETAILS #

- The `parseChatMessages` function uses text macros to determine the chat role of each message.
- The `parseChatHistory` function generates a `ChatHistory` object using the `ChatHistory` class from the `ChatHistory` module.