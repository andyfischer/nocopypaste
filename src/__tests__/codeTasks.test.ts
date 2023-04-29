// Import dependencies
import Fs from 'fs/promises';
import Path from 'path';
import { writeUnitTest } from '../codeTasks';
import { fileExists } from '../rqe/node/fs';
import { TaskHelper } from '../cli';
import { Stream } from '../rqe'

// Mock TaskHelper
const mockHelper: TaskHelper = {
  complete: jest.fn().mockResolvedValue({ getAnswer: () => 'describe("writeUnitTest", () => { test("should add unit test", () => { expect(true).toBe(true); }); });' }),
  finish: jest.fn(),
  progress: new Stream()
  
} as any;

// Mock fileExists function
jest.mock('../rqe/node/fs', () => ({
  fileExists: jest.fn().mockResolvedValue(false)
}));

jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
    writeFile: jest.fn(),
}));

describe('writeUnitTest', () => {
    /*
  it('should create a test file', async () => {
    // Set up input
    const filename = 'src/codeTasks.ts';

    // Call function
    await writeUnitTest({ filename, helper: mockHelper });

    // Check that file was created
    const testFilename = Path.join(Path.dirname(filename), '__tests__', `${Path.basename(filename, Path.extname(filename))}.test.ts`);
    expect(await fileExists(testFilename)).toBe(true);

    // Check that file contains expected code
    const expectedCode = 'describe("writeUnitTest", () => { test("should add unit test", () => { expect(true).toBe(true); }); });';
    const actualCode = await Fs.readFile(testFilename, 'utf8');
    expect(actualCode).toBe(expectedCode);

    // Check that TaskHelper methods were called
    expect(mockHelper.complete).toHaveBeenCalledWith({
      prompt: `Add a TypeScript unit test using the Jest framework for the following code. The filename is ${filename}. \nThe code is: \n\n${await Fs.readFile(filename, 'utf8')}`
    });
    expect(mockHelper.finish).toHaveBeenCalled();
  });
  */

  it('should throw an error if test file already exists', async () => {
    // Set up input
    const filename = 'src/codeTasks.ts';
    const testFilename = Path.join(Path.dirname(filename), '__tests__', `${Path.basename(filename, Path.extname(filename))}.test.ts`);
    jest.spyOn(global.console, 'error').mockImplementation(() => {});

    // Mock fileExists function to return true
    (fileExists as jest.Mock).mockResolvedValue(true);

    // Call function and check for error
    await expect(writeUnitTest({ filename, helper: mockHelper })).rejects.toThrowError(`Test file src/__tests__/codeTasks.test.ts already exists`);
  });
})
