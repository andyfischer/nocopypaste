# SUMMARY #

This code defines classes and functions related to reading, writing, and manipulating chat histories.

# RESPONSIBILITIES #

* Define `ChatMessage` and `ChatRole` interfaces.
* Define a `LoosePrompt` interface for optional prompt messages.
* Define a `ChatHistory` class for storing chat messages and providing methods to manipulate them.
* Define a `readChatHistoryFromFile` function for parsing chat histories from a file.
* Define a `writeToFile` method for writing a `ChatHistory` object to a file.
* Define a `getAnswer` method for retrieving the last message from an assistant.
* Define a `addFromAPI` method for adding messages from an API response to a `ChatHistory` object.
* Define a `toStringFormat` method for converting a `ChatHistory` object to a string format.

# IMPLEMENTATION NOTES #

* The code uses TypeScript to define interfaces and types.
* The `parseChatHistory` and `RoleToMacro` functions are imported from a separate module.
* The `ChatHistory` class has a default message of a user prompt if none are provided.
* The `addFromAPI` method processes `CompletionItem` objects and adds them to the `ChatHistory` object.
* The `toStringFormat` method converts a `ChatHistory` object to a string format with a custom macro for each message role.