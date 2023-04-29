import { Configuration, OpenAIApi } from "openai";
import { Stream } from './rqe'
import https from 'https'
import { roughlyEstimateTokens } from './roughlyEstimateTokens'
import { ChatMessage } from "./ChatHistory";

export interface CompletionReq {
    messages?: ChatMessage[]
    prompt?: string
    maxTokens?: number
}

const DefaultModel = 'gpt-3.5-turbo'
const DefaultMaxTokens = 2024;
const PricePer1kTokensPrompt = 0.002;
const PricePer1kTokensCompletion = 0.002;
//const DefaultModel = 'text-davinci-003'

let _openai: OpenAIApi;

function getOpenAI() {

    if (!_openai) {

        if (!process.env.OPENAI_API_KEY)
            throw new Error("missing env var: OPENAI_API_KEY");

         const configuration = new Configuration({
            organization: "org-Hj5b1iLqCOD8NTWIOBG7ns11",
            apiKey: process.env.OPENAI_API_KEY,
        });

        _openai = new OpenAIApi(configuration);
    }

    return _openai;
}

export interface CompletionItem {
    id: string
    object: string
    created: number
    model: string
    choices: {
        delta: { role?: string, content?: string }
        index: number
        finish_reason: null | 'stop'
    }[]
}


export function complete({ messages, prompt, maxTokens }: CompletionReq) {

    if (prompt) {
        if (messages)
            throw new Error(`don't pass both prompt and messages`);

        messages = [{ role: 'user', content: prompt }];
    }

    let promptTokenEstimate = 0;
    let completionTokenEstimate = 0;

    for (const message of messages) {
        promptTokenEstimate += roughlyEstimateTokens(message.content)
    }

    const output = new Stream<CompletionItem>();

    if (!process.env.OPENAI_API_KEY)
        throw new Error("missing env var: OPENAI_API_KEY");

    const req = https.request({
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            "Authorization": "Bearer "+ process.env.OPENAI_API_KEY,
        }
    }, res => {
        res.on('data', (chunk) => {
            //console.log('received start')
            //console.log(chunk.toString())
            //console.log('received end')

            let responseText = chunk.toString();

            if (!responseText.startsWith("data:")) {
                console.log('started parsing as error: ' + responseText)
                let errorData = JSON.parse(responseText);
                errorData = errorData.error || errorData;
                output.putError({
                    errorType: 'api_error',
                    errorMessage: "API responded with an error: " + errorData.code,
                    cause: errorData
                });
                return;
            }


            for (let line of chunk.toString().split('\n')) {
                line = line.trim();

                if (line === '')
                    continue;
                
                line = line.replace('data: ', '').trim();

                if (line === '[DONE]') {

                    output.putRelated({
                        t: 'token_cost',
                        promptTokenEstimate,
                        completionTokenEstimate,
                        dollarCostEstimate:
                            (promptTokenEstimate * PricePer1kTokensPrompt / 1000) 
                            + (completionTokenEstimate * PricePer1kTokensCompletion / 1000 ) 
                    })
                    output.done();
                    return;
                }

                try {
                    const data = JSON.parse(line);

                    if (data.choices[0]?.delta?.content)
                        completionTokenEstimate += roughlyEstimateTokens(data.choices[0]?.delta?.content)

                    output.put(data as CompletionItem);

                } catch (err) {
                    console.error('Response was not parseable as JSON: ', line);
                }
            }
        });

        res.on('end', () => {
            output.close();
        });
    });

    const body = {
        model: DefaultModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: maxTokens || DefaultMaxTokens,
        /*
        top_p:1.0,
        frequency_penalty:0.5,
        presence_penalty:0.7,
        */
        stream:true,
    };

    req.on('error', (e) => {
        output.putError({ errorType: 'httpError' });
        console.error("problem with request: " + e.message);
    });

    req.write(JSON.stringify(body))

    req.end();

    return output;
}
