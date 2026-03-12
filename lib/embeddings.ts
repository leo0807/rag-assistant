import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

// 每批最多处理 20 个 chunks，避免单次请求过大
const BATCH_SIZE = 50;

export async function embedTexts(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];

    // 把 texts 分批处理
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);

        const response = await openai.embeddings.create({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            input: batch,
        });

        if (!response.data) {
            throw new Error(`Embedding failed: ${JSON.stringify(response)}`);
        }

        results.push(...response.data.map(item => item.embedding));

        // 批次之间稍作延迟，避免触发限流
        if (i + BATCH_SIZE < texts.length) {
            await new Promise(r => setTimeout(r, 200));
        }
    }

    return results;
}

export async function embedQuery(query: string): Promise<number[]> {
    const embeddings = await embedTexts([query]);
    return embeddings[0];
}