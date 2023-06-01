import { Stream, c_item, c_done, c_close } from '../../Stream';
import { Options, streamToCsv } from '../streamToCsv';
import { it, expect } from '../../testing'

  let input: Stream;
  let output: Stream;
  let options: Options;

  function setup() {
    input = new Stream();
    output = new Stream();
    options = { attrs: ['id', 'name', 'email'], seperator: ',' };
  }


  it('should convert stream to CSV', () => {
      setup();

    const inputItems = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
      { id: 3, name: 'Bob', email: 'bob@example.com' },
    ];

    streamToCsv(input, options).sendTo(output);

    inputItems.forEach((item) => {
      input.put(item);
    });
    input.finish();

    const outputMsgs = output.collectItemsSync();

    expect(outputMsgs.length).toBe(4);
    expect(outputMsgs[0].line).toBe('id,name,email');
    expect(outputMsgs[1].line).toBe('1,John,john@example.com');
    expect(outputMsgs[2].line).toBe('2,Jane,jane@example.com');
    expect(outputMsgs[3].line).toBe('3,Bob,bob@example.com');
  });

  it('should handle null and undefined values', () => {
      setup();

    const inputItems = [
      { id: 1, name: 'John', email: null },
      { id: 2, name: 'Jane', email: undefined },
      { id: 3, name: 'Bob', email: 'bob@example.com' },
    ];

    streamToCsv(input, options).sendTo(output);

    inputItems.forEach((item) => {
      input.put(item);
    });
    input.finish();

    const outputMsgs = output.collectItemsSync();

    expect(outputMsgs.length).toBe(4);
    expect(outputMsgs[0].line).toBe('id,name,email');
    expect(outputMsgs[1].line).toBe('1,John,');
    expect(outputMsgs[2].line).toBe('2,Jane,');
    expect(outputMsgs[3].line).toBe('3,Bob,bob@example.com');
  });

  it('should handle tab separator', () => {
      setup();

    const inputItems = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
      { id: 3, name: 'Bob', email: 'bob@example.com' },
    ];
    const expectedOutput = `id\tname\temail\n1\tJohn\tjohn@example.com\n2\tJane\tjane@example.com\n3\tBob\tbob@example.com\n`;

    options.seperator = '\t';

    streamToCsv(input, options).sendTo(output);

    inputItems.forEach((item) => {
      input.put(item);
    });
    input.finish();

    const outputMsgs = output.collectItemsSync();

    expect(outputMsgs.length).toBe(4);
    expect(outputMsgs[0].line).toBe('id\tname\temail');
    expect(outputMsgs[1].line).toBe('1\tJohn\tjohn@example.com');
    expect(outputMsgs[2].line).toBe('2\tJane\tjane@example.com');
    expect(outputMsgs[3].line).toBe('3\tBob\tbob@example.com');
  });

  it('should handle empty attributes array', () => {
      setup();

    options.attrs = [];

    streamToCsv(input, options).sendTo(output);

    input.put({ id: 1, name: 'John', email: 'john@example.com' });
    input.finish();

    const outputMsgs = output.collectItemsSync();

    expect(outputMsgs.length).toBe(2);
    expect(outputMsgs[0].line).toBe('');
    expect(outputMsgs[1].line).toBe('');
  });
