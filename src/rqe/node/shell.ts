
import { Stream } from '../Stream'
import { spawn as nodeSpawn } from 'child_process'

type SpawnOptions = Parameters<typeof nodeSpawn>[2];

export type ProcessEvent = StdoutEvent | StderrEvent | ExitEvent;

export interface StdoutEvent {
    t: 'stdout'
    line: string
}

export interface StderrEvent {
    t: 'stderr'
    line: string
}

export interface ExitEvent {
    t: 'exit'
    code: number
}

export function spawn(command: string | string[], options: SpawnOptions = {}) {

    if (typeof command === 'string') {
        command = command.split(' ')
    }

    command = command as string[];

    const output = new Stream<ProcessEvent>();

    const child = nodeSpawn(command[0], command.slice(1), options);

    child.stdout.on('data', data => {
        const dataStr = data.toString();
        for (const line of dataStr.split('\n')) {
            output.put({ t: 'stdout', line })
        }
    });

    child.stderr.on('data', data => {
        const dataStr = data.toString();
        for (const line of dataStr.split('\n')) {
            output.put({ t: 'stderr', line })
        }
    });

    child.on('error', err => {
        output.putError({errorType: 'child_process_error', cause: err})
    });

    child.on('close', code => {
        output.put({ t: 'exit', code });
        output.close();
    });

    return [ output, child ] as [ typeof output, typeof child ];
}
