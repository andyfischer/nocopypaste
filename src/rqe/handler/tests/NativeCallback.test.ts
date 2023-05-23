import { Stream } from '../../Stream'
import { recordUnhandledException } from '../../Errors'
import { Task } from '../../task';
import { resolveOutputToStream, callbackToStream, declaredFunctionToHandler } from '../NativeCallback';
import { it, expect } from '../../test'

    it('should finish stream if output is null or undefined', () => {
      let stream = new Stream();

      resolveOutputToStream(null, stream);
      expect(stream.collectItemsSync()).toEqual([]);

      stream = new Stream();
      resolveOutputToStream(undefined, stream);
      expect(stream.collectItemsSync()).toEqual([]);
    });

    it('should send output to a stream if it is a stream', () => {
      const stream = new Stream();
      const output = new Stream();
      resolveOutputToStream(output, stream);

      output.put({ x: 1 });
      output.finish();

      expect(stream.collectItemsSync()).toEqual([{x:1}]);
    });

    /*
    it('should put each item of a table into a stream', () => {
        const stream = new Stream();
      const output = {
        t: 'table',
        scan: jest.fn().mockReturnValue(['item1', 'item2']),
      };
      resolveOutputToStream(output, stream);
      expect(output.scan).toHaveBeenCalledTimes(1);
      expect(stream.put).toHaveBeenCalledTimes(2);
      expect(stream.put).toHaveBeenNthCalledWith(1, 'item1');
      expect(stream.put).toHaveBeenNthCalledWith(2, 'item2');
      expect(stream.finish).toHaveBeenCalledTimes(1);
    });
    */

    it('should put each element of an array into a stream', () => {
      const stream = new Stream();
      const output = ['item1', 'item2'];
      resolveOutputToStream(output, stream);
      expect(stream.collectItemsSync()).toEqual(['item1','item2']);
    });

    it('should handle a resolved promise', async () => {
        const stream = new Stream();
      const output = Promise.resolve('resolved');
      resolveOutputToStream(output, stream);
      expect(await stream.promiseItems()).toEqual(['resolved']);
    });

    /*
    it('should put output into a stream if not null, undefined, array, table, or stream', () => {
        const stream = new Stream();
      const output = 'test';
      resolveOutputToStream(output, stream);
      expect(stream.put).toHaveBeenCalledTimes(1);
      expect(stream.put).toHaveBeenCalledWith('test');
      expect(stream.finish).toHaveBeenCalledTimes(1);
    });

    it('should handle and put exceptions into a stream', () => {
        const stream = new Stream();
      const output = () => { throw new Error('error') };
      callbackToStream(output, stream);
      expect(stream.putException).toHaveBeenCalledTimes(1);
      expect(stream.putException).toHaveBeenCalledWith(new Error('error'));
      expect(stream.close).toHaveBeenCalledTimes(1);
    });

    it('should handle and record unhandled exceptions', () => {
        const stream = new Stream();
      stream.closedByUpstream = true;
      const output = () => { throw new Error('error') };
      callbackToStream(output, stream);
      expect(recordUnhandledException).toHaveBeenCalledTimes(1);
    });

    it('should handle and close stream when BackpressureStop exception is thrown', () => {
        const stream = new Stream();
      const error = new Error('error');
      (error as any).backpressure_stop = true;
      const output = () => { throw error };
      callbackToStream(output, stream);
      expect(stream.close).toHaveBeenCalledTimes(1);
    });
*/
