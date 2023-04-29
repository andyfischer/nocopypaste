
import { lexStringToIterator, t_space } from './rqe/lexer'

export function roughlyEstimateTokens(s: string) {
    let count = 0;
    const toks = lexStringToIterator(s);
    while (!toks.finished()) {
        if (toks.tryConsume(t_space))
            continue;

        count++;
        toks.consume();
    }
    return count;
}
