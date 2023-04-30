
# nocopypaste #

Handful of command line scripts for automating some coding tasks with OpenAI's chat API (without copy-pasting
from the chat page)

Current state is that this project has a lot of random opinions and is changing rapidly. It might be
hard to use in its current state, but I'm open sourcing it more in case folks want to see it as an example.

Using engine gpt-3.5-turbo. Currently assumes that your project is in Typescript.

If you're just curious about the prompts then they are here: [src/codeTasks.ts](./src/codeTasks.ts)

# Setup #

 - Run `yarn install` or `npm install`
 - Run `yarn build`

### Set up your API key ###

The scripts expect to find your OpenAI API key passed in the `OPENAI_API_KEY` environment variable.

The project is using `dotenv` so the easiest way is to save a text file `.env` in this directory and
add a line `OPENAI_API_KEY=sk-...` in that file.

You will need to set up a billing method on OpenAI since these requests aren't on the free tier. In practice each of 
these commands costs around $0.001 to $0.004 to run.

# Running #

The tool has a shell command at `./bin/chatgpt`.

If you add the 'bin' directory to your PATH then you can run the command with just `chatgpt`.

General command line syntax:

    chatgpt <task name> <filename>

# Available commands #

### `chatgpt chat <filename>` ###

Submit the file as a chat transcript, and save the result (with response) back to this file. Quick way to
perform an open-ended chat using your text editor instead of using the web page.

### `chatgpt writeUnitTest <filename>` ###

Ask ChatGPT to write a new Jest unit test for the file, and save it.

### `chatgpt rewrite <filename>` ###

Ask ChatGPT to fix/rewrite the entire file. Adds some specific instructions to fill in any "TODO" comments.

Usage: You can start writing a file and add a few comments and `// TODO` sections, then call rewrite, and Chat
will (almost always) return the same code with your TODOs replaced with real code.

Warning: this will overwrite the whole file with whatever the chat returns.

### `chatgpt writeDocs <filename>` ###

Ask ChatGPT to write Markdown documentation for the file, and save it. (with an extension of .docs.md)

The idea of the .docs.md file is that we might use it for humans, and also for future Chat requests.
There might be some requests that work better when sending a summary of the file instead of the whole source
code.
