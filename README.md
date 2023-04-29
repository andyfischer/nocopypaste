
# nocopypaste #

Handful of command line scripts for automating various coding tasks with OpenAI's chat API (GPT 3.5).

Currently optimized for Typescript code.

Current state is that this project has a lot of random opinions and is changing rapidly. I'm expecting
that people might want to see the project as an example but might not use it directly.

If you're just curious about the prompts then they are here: [src/codeTasks.ts](./src/codeTasks.ts)

# Setup #

 - `yarn install` or `npm install`
 - `yarn build`

# Running #

The tool has a shell command at `bin/gpt`.

If you add the 'bin' directory to your PATH then you can run the command with just `gpt`.

Command line syntax:

    `bin/gpt <task> <filename>`

Available commands:

 - `bin/gpt chat <filename>` - Submit the file as a chat transcript, and save the response.
 - `bin/gpt writeDocs <filename>` - Ask ChatGPT to write Markdown documentation for the file and save it.
 - `bin/gpt rewrite <filename>` - Ask ChatGPT to fix/rewrite the file. Warning: this will overwrite the file with whatever the chat returns.



