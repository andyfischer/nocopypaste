import { parseTscOutput, ParsedOutputItem } from '../parseTscOutput';
import { it, expect } from '../../test';

it("correctly parses example", () => {
    const sample = `src/mail-server/ops/SimulatedActivity.ts(19,44): error TS2339: Property 'oneAttr' does not exist on type 'Stream<any>'.`

    const parsed = parseTscOutput(sample)[0];

    expect(parsed.t).toEqual('error');
    expect(parsed.filename).toEqual('src/mail-server/ops/SimulatedActivity.ts');
    expect(parsed.lineNumber).toEqual(19);
    expect(parsed.columnNumber).toEqual(44);
    expect(parsed.errorCode).toEqual('TS2339');
    expect(parsed.errorMessage).toEqual("Property 'oneAttr' does not exist on type 'Stream<any>'.");
});
