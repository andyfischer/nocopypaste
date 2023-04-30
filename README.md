
# nocopypaste #

Handful of command line scripts for automating some coding tasks with OpenAI's chat API (without copy-pasting
from the chat page)

Using engine gpt-3.5-turbo. Currently assumes that your project is in Typescript.

Current state is that this project has a lot of random opinions and is changing rapidly. I'm expecting
that people might want to see the project as an example but might not use it directly.

If you're just curious about the prompts then they are here: [src/codeTasks.ts](./src/codeTasks.ts)

# Setup #

 - `yarn install` or `npm install`
 - `yarn build`

# Running #

The tool has a shell command at `bin/gpt`.

If you add the 'bin' directory to your PATH then you can run the command with just `gpt`. Otherwise
you can launch it with `./bin/gpt`

Command line syntax:

    gpt <task> <filename>

# Available commands #

### `gpt chat <filename>` ###

Submit the file as a chat transcript, and save the result (with response) back to this file. Quick way to
perform an open-ended chat using your text editor instead of using the web page.

### `gpt writeUnitTest <filename>` ###

Ask ChatGPT to write a new Jest unit test for the file, and save it.

### `gpt rewrite <filename>` ###

Ask ChatGPT to fix/rewrite the entire file. Adds some specific instructions to fill in any "TODO" comments.

Usage: You can start writing a file and add a few comments and `// TODO` sections, then call rewrite, and Chat
will (almost always) return the same code with your TODOs replaced with real code.

Warning: this will overwrite the whole file with whatever the chat returns.

### `gpt writeDocs <filename>` ###

Ask ChatGPT to write Markdown documentation for the file, and save it. (with an extension of .docs.md)

The idea of the .docs.md file is that we might use it for humans, and also for future Chat requests.
There might be some requests that work better when sending a summary of the file instead of the whole source
code.
