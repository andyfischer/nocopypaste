
import { Stream, StreamEvent, c_done } from '../../Stream'
import { PostedRequest, RequestMessage, PostResponse } from '../../remote/HttpClient'

interface ResponseEvent {
    requestId: number
    evt: StreamEvent
}

interface HandlePostOptions<RequestType> {
    requestBody: PostedRequest<RequestType>
    handleOneMessage: (req: RequestType, output: Stream) => void
    sendData: (event: ResponseEvent) => void
    closeResponse: () => void
}

export function handlePostedRequest<RequestType>({ requestBody, handleOneMessage, sendData, closeResponse }: HandlePostOptions<RequestType>) {
    const openStreams = new Map();

    function afterStreamDone(requestId) {
        openStreams.delete(requestId);
        if (openStreams.size === 0)
            closeResponse();
    }

    for (const message of requestBody.messages) {
        const stream = new Stream();
        const requestId = message.requestId;

        openStreams.set(requestId, stream);

        stream.sendTo({
            receive(evt) {
                sendData({
                    requestId,
                    evt,
                });

                if (evt.t === c_done)
                    afterStreamDone(requestId);
            }
        });

        handleOneMessage(message.request, stream);
    }
}

