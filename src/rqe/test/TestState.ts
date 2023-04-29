
import { compileSchema } from "../table";

export const TestCases = compileSchema({
    name: "TestCases",
    funcs: [

    ]
}).createTable();

export const TestFailures = compileSchema({
    name: "TestFailures",
    funcs: [
        'each'
    ]
}).createTable();