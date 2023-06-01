
import { spawn } from './rqe/node/shell'
import { parseTscOutput } from './rqe/typescript/parseTscOutput'
import { compileSchema } from './rqe'

export async function runTscAndFix({cwd, helper}) {

    const [ output ] = spawn('tsc -p .', { cwd });

    const table = compileSchema({
        name: "TscErrors",
        funcs: [
            "list(filename)",
            "listAll",
        ]
    }).createTable();

    for await (const { line } of (output as any)) {
        if (!line || line == '')
            continue;
        const parsed = parseTscOutput(line);
        for (const item of parsed)
            table.insert(item);
    }

    console.log(table.listAll());
}
