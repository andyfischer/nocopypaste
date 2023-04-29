
import { IDSource } from './utils/IDSource'

export type ErrorType = 'verb_not_found' | 'unhandled_exception' | 'provider_not_found' | 'missing_parameter'
    | 'no_table_found' | 'Unimplemented' | 'TableNotFound'
    | 'MissingAttrs' | 'MissingValue' | 'NotSupported' | 'ExtraAttrs'
    | 'http_protocol_error' | string

export interface ErrorItem {
    errorType?: ErrorType
    errorLayer?: string
    errorMessage?: string
    failureId?: string
    stack?: any
    cause?: Error
    info?: any
}

export interface ErrorContext {
}

let _nextFailureId = new IDSource('fail-');

export function errorItemToOneLineString(item: ErrorItem) {
    let out = `error (${item.errorType})`;

    if (item.errorMessage)
        out += `: ${item.errorMessage}`;

    return out;
}

export function errorItemToString(item: ErrorItem) {
    let out = `error (${item.errorType})`;

    if (item.errorMessage)
        out += `: ${item.errorMessage}`;

    if (item.stack)
        out += `\nStack trace: ${item.stack}`

    return out;
}

export class ErrorExtended extends Error {
    is_error_extended = true
    errorItem: ErrorItem

    constructor(errorItem: ErrorItem) {
        super(errorItem.errorMessage || errorItemToString(errorItem));
        this.errorItem = errorItem;
    }

    toString() {
        return errorItemToString(this.errorItem);
    }
}

export function toException(item: ErrorItem): ErrorExtended {
    return new ErrorExtended(item);
}

export function captureException(error: Error, context: ErrorContext = {}): ErrorItem {
    if ((error as ErrorExtended).errorItem) {
        const errorItem = (error as ErrorExtended).errorItem;

        return {
            errorType: errorItem.errorType || 'unhandled_exception',
            errorMessage: errorItem.errorMessage,
            stack:  errorItem.stack || error.stack,
            // ...(error as ErrorExtended).errorItem,
        }
    }

    if (error instanceof Error) {
        return {
            errorType: (error as any).errorType || 'unhandled_exception',
            errorMessage: error.message,
            stack: error.stack,
        };
    }

    // Received some other value as an error.
    return {
        errorType: (error as any).errorType || 'unknown_error',
        errorMessage: typeof error === 'string' ? error : ((error as any).errorMessage || (error as any).message),
        stack: (error as any).stack,
    };
}

export function recordFailure(errorItem: ErrorItem) {
    errorItem.failureId = errorItem.failureId || _nextFailureId.take();

    // todo - more stuff here
    console.error('failure: ', errorItemToString(errorItem));

    return errorItem.failureId;
}

export function recordUnhandledException(error: Error) {
    // todo - more stuff here
    console.error('unhandled exception:')
    console.error(error);
}

